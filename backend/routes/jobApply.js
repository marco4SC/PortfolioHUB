const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const applicationsFile = path.join(__dirname, '../data/job-applications.json');
const processingPurpose = 'job_application_processing';

function ensureStore() {
  fs.mkdirSync(path.dirname(applicationsFile), { recursive: true });
  if (!fs.existsSync(applicationsFile)) fs.writeFileSync(applicationsFile, '[]', 'utf8');
}

function readApplications() {
  ensureStore();
  return JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
}

function writeApplications(applications) {
  ensureStore();
  const temporary = `${applicationsFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(applications, null, 2), 'utf8');
  fs.renameSync(temporary, applicationsFile);
}

function requireUser(req, res, next) {
  if (!req.session?.user?.id) return res.status(401).json({ error: 'Autenticação necessária' });
  next();
}

function hasActiveConsent(req) {
  const consentsFile = path.join(__dirname, '../data/consents.json');
  if (!fs.existsSync(consentsFile)) return false;
  const consents = JSON.parse(fs.readFileSync(consentsFile, 'utf8'));
  return consents.some((item) =>
    item.user_id === String(req.session.user.id) &&
    item.purpose === processingPurpose &&
    item.revoked_at === null
  );
}

function normalizeSkill(skill) {
  return String(skill).toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim();
}

function validateJob(job) {
  if (!job || typeof job !== 'object') return 'job é obrigatório';
  if (typeof job.title !== 'string' || !job.title.trim()) return 'job.title é obrigatório';
  if (!Array.isArray(job.requirements) || job.requirements.length === 0) {
    return 'job.requirements deve conter pelo menos uma habilidade';
  }
  return null;
}

router.post('/match', requireUser, (req, res) => {
  if (!hasActiveConsent(req)) {
    return res.status(403).json({ error: 'Consentimento ativo necessário', purpose: processingPurpose });
  }
  const { profile, job, template = 'resume.html' } = req.body;
  const jobError = validateJob(job);
  if (jobError) return res.status(400).json({ error: jobError });
  if (!profile || typeof profile !== 'object' || !Array.isArray(profile.skills)) {
    return res.status(400).json({ error: 'profile.skills é obrigatório' });
  }
  if (!['resume.html', 'compact.html'].includes(template)) {
    return res.status(400).json({ error: 'template inválido' });
  }

  const profileSkills = new Map(profile.skills.map((skill) => [normalizeSkill(skill), String(skill)]));
  const matchedSkills = job.requirements
    .filter((skill) => profileSkills.has(normalizeSkill(skill)))
    .map((skill) => profileSkills.get(normalizeSkill(skill)));
  const unmatchedSkills = job.requirements.filter((skill) => !profileSkills.has(normalizeSkill(skill)));
  const score = Math.round((matchedSkills.length / job.requirements.length) * 100);
  const review = {
    id: crypto.randomUUID(),
    user_id: String(req.session.user.id),
    profile_id: String(profile.id || 'private-profile'),
    job: {
      id: String(job.id || crypto.randomUUID()),
      title: job.title.trim(),
      company: String(job.company || 'Unspecified company').trim(),
      url: String(job.url || '').trim()
    },
    matched_skills: matchedSkills,
    unmatched_skills: unmatchedSkills,
    score,
    template,
    status: 'REVIEW_REQUIRED',
    approved_at: null,
    sent: false,
    created_at: new Date().toISOString()
  };
  const applications = readApplications();
  applications.push(review);
  writeApplications(applications);
  return res.status(201).json({ review });
});

router.get('/:id', requireUser, (req, res) => {
  const review = readApplications().find((item) =>
    item.id === req.params.id && item.user_id === String(req.session.user.id)
  );
  if (!review) return res.status(404).json({ error: 'Revisão não encontrada' });
  return res.json({ review });
});

router.post('/:id/approve', requireUser, (req, res) => {
  if (!hasActiveConsent(req)) {
    return res.status(403).json({ error: 'Consentimento ativo necessário', purpose: processingPurpose });
  }
  const applications = readApplications();
  const review = applications.find((item) =>
    item.id === req.params.id && item.user_id === String(req.session.user.id)
  );
  if (!review) return res.status(404).json({ error: 'Revisão não encontrada' });
  if (review.sent) return res.status(409).json({ error: 'Candidatura já processada' });
  review.approved_at = new Date().toISOString();
  review.status = 'APPROVED_FOR_DRY_RUN';
  review.sent = false;
  writeApplications(applications);
  return res.json({ review });
});

module.exports = router;
