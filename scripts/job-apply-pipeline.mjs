import fs from "node:fs/promises";
import path from "node:path";

const [, , profilePath, jobPath, outputDir = "artifacts/job-apply-demo", templateName = "resume.html"] = process.argv;
if (!profilePath || !jobPath) {
  throw new Error("Usage: node scripts/job-apply-pipeline.mjs <profile.json> <job.json> [output-dir]");
}

const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const profile = await readJson(profilePath);
const job = await readJson(jobPath);
const profileSkills = new Set(profile.skills.map((skill) => skill.toLowerCase()));
const matchedSkills = job.requirements.filter((skill) => profileSkills.has(skill.toLowerCase()));
const score = Math.round((matchedSkills.length / job.requirements.length) * 100);
const output = path.resolve(outputDir);
await fs.mkdir(output, { recursive: true });

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const allowedTemplates = new Set(["resume.html", "compact.html"]);
if (!allowedTemplates.has(templateName)) throw new Error(`Unsupported template: ${templateName}`);
const template = await fs.readFile(path.join("templates/job-apply", templateName), "utf8");
const resume = template
  .replaceAll("{{TITLE}}", escapeHtml(job.title))
  .replaceAll("{{HEADLINE}}", escapeHtml(profile.headline))
  .replaceAll("{{JOB_TITLE}}", escapeHtml(job.title))
  .replaceAll("{{COMPANY}}", escapeHtml(job.company))
  .replaceAll("{{SUMMARY}}", escapeHtml(profile.summary))
  .replaceAll("{{MATCHED_SKILLS}}", matchedSkills.map(escapeHtml).join(" · "))
  .replaceAll("{{PROJECTS}}", profile.projects.map((project) => `<li>${escapeHtml(project)}</li>`).join(""))
  .replaceAll("{{JOB_URL}}", escapeHtml(job.url))
  .replaceAll("{{SCORE}}", String(score));

const manifest = {
  job_id: job.id,
  profile_id: profile.id,
  matched_skills: matchedSkills,
  score,
  review_required: true,
  application_sent: false,
  template: templateName,
  generated_at: new Date().toISOString()
};
await fs.writeFile(path.join(output, "resume.html"), resume);
await fs.writeFile(path.join(output, "metadata.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest));
