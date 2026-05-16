const https = require("https");

function checkRegion(region) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: `vehicle-tracker-recibos-2026.s3.${region}.amazonaws.com`,
        method: "HEAD",
        timeout: 5000,
      },
      (res) => {
        if (res.statusCode === 403 || res.statusCode === 200) {
          console.log(`FOUND: ${region} (${res.statusCode})`);
        }
        resolve(res.statusCode);
      }
    );
    req.on("error", () => resolve(null));
    req.end();
  });
}

async function main() {
  const regions = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-central-1", "eu-west-2", "eu-west-3",
    "eu-north-1", "sa-east-1", "ap-southeast-1", "ap-southeast-2",
    "ap-northeast-1", "ap-northeast-2", "ap-south-1",
    "ca-central-1", "me-south-1",
  ];
  for (const r of regions) {
    await checkRegion(r);
  }
  console.log("Done");
}

main();
