"use client";

import { useEffect, useRef } from "react";
import type {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
} from "three";

export default function ThreeJSVehicle() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    let animationId: number;
    let renderer: WebGLRenderer | null = null;
    let scene: Scene | null = null;
    let camera: PerspectiveCamera | null = null;
    let lexusGroup: Group | null = null;

    async function init(container: HTMLElement) {
      const THREE = await import("three");

      const width = container.clientWidth || 400;
      const height = container.clientHeight || 400;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(6, 4, 8);
      camera.lookAt(0, 0.5, 0);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);
      const spotLight = new THREE.SpotLight(0xffffff, 0.5);
      spotLight.position.set(-10, 5, 0);
      scene.add(spotLight);

      lexusGroup = new THREE.Group();

      const primaryBlue = 0x3b82f6;
      const bodyMat = new THREE.MeshPhongMaterial({
        color: primaryBlue,
        specular: 0x555555,
        shininess: 60,
        transparent: true,
        opacity: 0.85,
      });
      const glassMat = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4,
        shininess: 100,
      });
      const tireMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
      const darkMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const lowerBody = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.6, 4.2),
        bodyMat
      );
      lowerBody.position.y = 0.5;
      lexusGroup.add(lowerBody);

      const upperBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, 2.5),
        bodyMat
      );
      upperBody.position.set(0, 1.2, -0.2);
      lexusGroup.add(upperBody);

      const windows = new THREE.Mesh(
        new THREE.BoxGeometry(1.82, 0.6, 2.3),
        glassMat
      );
      windows.position.set(0, 1.2, -0.2);
      lexusGroup.add(windows);

      const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
      const wheelPositions = [
        { x: -1.0, z: -1.4 },
        { x: 1.0, z: -1.4 },
        { x: -1.0, z: 1.4 },
        { x: 1.0, z: 1.4 },
      ];
      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeom, tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, 0.4, pos.z);
        lexusGroup!.add(wheel);
      });

      const grill = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.4, 0.1),
        darkMat
      );
      grill.position.set(0, 0.6, 2.1);
      lexusGroup.add(grill);

      const lightGeom = new THREE.BoxGeometry(0.4, 0.2, 0.1);
      const leftLight = new THREE.Mesh(lightGeom, whiteMat);
      leftLight.position.set(-0.7, 0.7, 2.1);
      lexusGroup.add(leftLight);
      const rightLight = new THREE.Mesh(lightGeom, whiteMat);
      rightLight.position.set(0.7, 0.7, 2.1);
      lexusGroup.add(rightLight);

      scene.add(lexusGroup);

      function animate() {
        animationId = requestAnimationFrame(animate);
        if (lexusGroup) {
          lexusGroup.rotation.y += 0.008;
          lexusGroup.position.y = Math.sin(Date.now() * 0.002) * 0.05;
        }
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      }
      animate();
    }

    init(c);

    function handleResize() {
      if (!c || !renderer || !camera) return;
      const w = c.clientWidth || 400;
      const h = c.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (renderer && c.contains(renderer.domElement)) {
        c.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] md:min-h-[450px]"
    />
  );
}
