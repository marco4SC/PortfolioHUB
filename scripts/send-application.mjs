import fs from "node:fs/promises";
import path from "node:path";

const [, , metadataPath, mode = "dry-run", approval = "false", output = "artifacts/job-apply-demo/delivery.json"] = process.argv;
if (!metadataPath) {
  throw new Error("Usage: node scripts/send-application.mjs <metadata.json> [dry-run] [approved] [output]");
}

const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
const approved = approval.toLowerCase() === "true";
if (metadata.application_sent === true) {
  throw new Error("Refusing to process an application already marked as sent");
}
if (!metadata.review_required || !approved) {
  throw new Error("Human approval is required before delivery");
}
if (mode !== "dry-run") {
  throw new Error("Only dry-run delivery is implemented; no external message was sent");
}

const delivery = {
  job_id: metadata.job_id,
  profile_id: metadata.profile_id,
  mode,
  approved,
  sent: false,
  status: "READY_FOR_MANUAL_DELIVERY",
  reason: "Demo sender is intentionally non-delivery and requires a future approved provider integration",
  created_at: new Date().toISOString()
};
const destination = path.resolve(output);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, `${JSON.stringify(delivery, null, 2)}\n`);
console.log(JSON.stringify(delivery));
