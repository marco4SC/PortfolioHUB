import fs from "node:fs/promises";
import path from "node:path";

const [, , jobsPath, output = "artifacts/job-apply-demo/selected_job.json"] = process.argv;
if (!jobsPath) throw new Error("Usage: node scripts/select-job.mjs <jobs.json> [output]");
const jobs = JSON.parse(await fs.readFile(jobsPath, "utf8"));
if (!Array.isArray(jobs) || jobs.length === 0) throw new Error("Normalized jobs file is empty");
const selected = jobs[0];
const destination = path.resolve(output);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, `${JSON.stringify(selected, null, 2)}\n`);
console.log(JSON.stringify({ selected_job: selected.id, output }));
