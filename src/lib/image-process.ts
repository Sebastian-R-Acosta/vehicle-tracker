function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function grayscale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = gray;
  }
  ctx.putImageData(img, 0, 0);
}

function sobelEdgeMagnitude(ctx: CanvasRenderingContext2D, w: number, h: number): Float32Array {
  const img = ctx.getImageData(0, 0, w, h);
  const gray = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      gray[y * w + x] = img.data[(y * w + x) * 4];
    }
  }
  const mag = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)]
        -2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)]
        -gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)];
      const gy =
        -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)]
        +gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];
      mag[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return mag;
}

function findDocumentCorners(mag: Float32Array, w: number, h: number): { x: number; y: number }[] {
  const threshold = 40;
  const halfW = w >> 1;
  const halfH = h >> 1;

  const quadrants = [
    { x1: 0, y1: 0, x2: halfW, y2: halfH },
    { x1: halfW, y1: 0, x2: w, y2: halfH },
    { x1: 0, y1: halfH, x2: halfW, y2: h },
    { x1: halfW, y1: halfH, x2: w, y2: h },
  ];

  const corners: { x: number; y: number }[] = [];

  for (const q of quadrants) {
    let bestScore = 0;
    let bestPt = { x: q.x1, y: q.y1 };
    for (let y = q.y1; y < q.y2; y += 2) {
      for (let x = q.x1; x < q.x2; x += 2) {
        const idx = y * w + x;
        if (mag[idx] > threshold) {
          const dist = Math.sqrt(
            (x - (q.x1 + q.x2) / 2) ** 2 + (y - (q.y1 + q.y2) / 2) ** 2
          );
          const score = mag[idx] * (1 + dist * 0.01);
          if (score > bestScore) {
            bestScore = score;
            bestPt = { x, y };
          }
        }
      }
    }
    corners.push(bestPt);
  }

  corners.sort((a, b) => a.y - b.y);
  const top = corners.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = corners.slice(2).sort((a, b) => a.x - b.x);
  return [top[0], top[1], bottom[1], bottom[0]];
}

function perspectiveTransform(
  src: CanvasRenderingContext2D,
  sw: number, sh: number,
  dst: CanvasRenderingContext2D,
  dw: number, dh: number,
  corners: { x: number; y: number }[]
) {
  const [tl, tr, br, bl] = corners;
  const srcData = src.getImageData(0, 0, sw, sh);
  const dstImg = dst.createImageData(dw, dh);

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const u = x / dw;
      const v = y / dh;

      const px =
        (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + u * v * br.x + (1 - u) * v * bl.x;
      const py =
        (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + u * v * br.y + (1 - u) * v * bl.y;

      const sx = Math.round(px);
      const sy = Math.round(py);

      if (sx >= 0 && sx < sw && sy >= 0 && sy < sh) {
        const srcIdx = (sy * sw + sx) * 4;
        const dstIdx = (y * dw + x) * 4;
        dstImg.data[dstIdx] = srcData.data[srcIdx];
        dstImg.data[dstIdx + 1] = srcData.data[srcIdx + 1];
        dstImg.data[dstIdx + 2] = srcData.data[srcIdx + 2];
        dstImg.data[dstIdx + 3] = 255;
      }
    }
  }
  dst.putImageData(dstImg, 0, 0);
}

export async function autoCrop(
  imageData: string,
  targetWidth = 800,
  targetHeight = 520
): Promise<string> {
  const img = await loadImage(imageData);
  const { c: srcC, ctx: srcCtx } = getCanvas(img.width, img.height);
  srcCtx.drawImage(img, 0, 0);

  grayscale(srcCtx, img.width, img.height);

  const mag = sobelEdgeMagnitude(srcCtx, img.width, img.height);
  const corners = findDocumentCorners(mag, img.width, img.height);

  const { c: dstC, ctx: dstCtx } = getCanvas(targetWidth, targetHeight);
  perspectiveTransform(srcCtx, img.width, img.height, dstCtx, targetWidth, targetHeight, corners);

  return dstC.toDataURL("image/jpeg", 0.92);
}

export function autoContrast(
  imageData: string,
  saturation = 1.15,
  brightness = 1.08
): string {
  const img = new Image();
  img.src = imageData;
  const { c, ctx } = getCanvas(img.width, img.height);
  ctx.drawImage(img, 0, 0);

  const image = ctx.getImageData(0, 0, img.width, img.height);
  const d = image.data;

  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  for (let i = 0; i < d.length; i += 4) {
    minR = Math.min(minR, d[i]); maxR = Math.max(maxR, d[i]);
    minG = Math.min(minG, d[i + 1]); maxG = Math.max(maxG, d[i + 1]);
    minB = Math.min(minB, d[i + 2]); maxB = Math.max(maxB, d[i + 2]);
  }

  const rangeR = maxR - minR || 255;
  const rangeG = maxG - minG || 255;
  const rangeB = maxB - minB || 255;

  const brightBoost = brightness * 1.0 - 1.0;

  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, Math.max(0, ((d[i] - minR) / rangeR) * 255 * saturation + brightBoost * 128));
    d[i + 1] = Math.min(255, Math.max(0, ((d[i + 1] - minG) / rangeG) * 255 * saturation + brightBoost * 128));
    d[i + 2] = Math.min(255, Math.max(0, ((d[i + 2] - minB) / rangeB) * 255 * saturation + brightBoost * 128));
  }

  ctx.putImageData(image, 0, 0);
  return c.toDataURL("image/jpeg", 0.92);
}

export function sharpen(
  imageData: string,
  strength = 0.6
): string {
  const img = new Image();
  img.src = imageData;
  const { c, ctx } = getCanvas(img.width, img.height);
  ctx.drawImage(img, 0, 0);

  const w = img.width, h = img.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);

  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0,
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += src.data[idx] * k;
          g += src.data[idx + 1] * k;
          b += src.data[idx + 2] * k;
        }
      }
      const di = (y * w + x) * 4;
      dst.data[di] = Math.min(255, Math.max(0, r));
      dst.data[di + 1] = Math.min(255, Math.max(0, g));
      dst.data[di + 2] = Math.min(255, Math.max(0, b));
      dst.data[di + 3] = 255;
    }
  }

  ctx.putImageData(dst, 0, 0);
  return c.toDataURL("image/jpeg", 0.92);
}

export async function processLicenseImage(
  base64: string
): Promise<string> {
  const dataUrl = `data:image/jpeg;base64,${base64}`;
  const cropped = await autoCrop(dataUrl);
  const contrasted = autoContrast(cropped);
  const sharpened = sharpen(contrasted);
  return sharpened.split(",")[1];
}
