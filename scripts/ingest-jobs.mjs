import fs from "node:fs/promises";
import path from "node:path";

const [, , source, output = "artifacts/job-apply-demo/jobs.json"] = process.argv;
if (!source) {
  throw new Error("Usage: node scripts/ingest-jobs.mjs <local-json-or-authorized-url> [output]");
}

const normalize = (job, index) => ({
  id: String(job.id ?? `job-${index + 1}`),
  title: String(job.title ?? "Untitled role"),
  company: String(job.company ?? "Unspecified company"),
  location: String(job.location ?? "Unspecified"),
  description: String(job.description ?? ""),
  requirements: Array.isArray(job.requirements) ? job.requirements.map(String) : [],
  url: String(job.url ?? "")
});

const isHttp = /^https:\/\/[^ ]+$/i.test(source);
let payload;
if (isHttp) {
  const response = await fetch(source, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Job source returned HTTP ${response.status}`);
  payload = await response.json();
} else {
  payload = JSON.parse(await fs.readFile(source, "utf8"));
}

const jobs = Array.isArray(payload) ? payload : payload.jobs;
if (!Array.isArray(jobs) || jobs.length === 0) {
  throw new Error("Job source must contain a non-empty array or an object with a jobs array");
}

const normalized = jobs.slice(0, 20).map(normalize);
const destination = path.resolve(output);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(JSON.stringify({ source_type: isHttp ? "authorized-json-url" : "local-json", count: normalized.length, output: destination }));
