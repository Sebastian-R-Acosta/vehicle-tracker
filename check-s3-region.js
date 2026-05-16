const { S3Client, GetBucketLocationCommand } = require("@aws-sdk/client-s3");

const bucket = "vehicle-tracker-recibos-2026";
const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

s3.send(new GetBucketLocationCommand({ Bucket: bucket }))
  .then(r => console.log("Bucket location:", r.LocationConstraint || "us-east-1"))
  .catch(e => console.error("Error:", e.message, e.name))
  .finally(() => s3.destroy());
