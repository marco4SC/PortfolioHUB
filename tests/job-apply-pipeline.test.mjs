import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const profile = path.join(root, "data/job-apply-demo/test_profile.json");
const job = path.join(root, "data/job-apply-demo/test_job.json");

test("generates a review-required match without sending", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "job-apply-"));
  try {
    await run("node", ["scripts/job-apply-pipeline.mjs", profile, job, temp], { cwd: root });
    const metadata = JSON.parse(await fs.readFile(path.join(temp, "metadata.json"), "utf8"));
    assert.equal(metadata.score, 83);
    assert.deepEqual(metadata.unmatched_skills, ["Automated testing"]);
    assert.equal(metadata.review_required, true);
    assert.equal(metadata.application_sent, false);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test("rejects delivery without explicit human approval", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "job-apply-"));
  try {
    await run("node", ["scripts/job-apply-pipeline.mjs", profile, job, temp], { cwd: root });
    await assert.rejects(
      run("node", ["scripts/send-application.mjs", path.join(temp, "metadata.json"), "dry-run", "false"], { cwd: root }),
      /Human approval is required/
    );
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});
