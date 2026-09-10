const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const consentFile = path.join(__dirname, '../data/consents.json');

function ensureStore() {
  const directory = path.dirname(consentFile);
  fs.mkdirSync(directory, { recursive: true });
  if (!fs.existsSync(consentFile)) fs.writeFileSync(consentFile, '[]', 'utf8');
}

function readConsents() {
  ensureStore();
  return JSON.parse(fs.readFileSync(consentFile, 'utf8'));
}

function writeConsents(consents) {
  ensureStore();
  const temporary = `${consentFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(consents, null, 2), 'utf8');
  fs.renameSync(temporary, consentFile);
}

function requireUser(req, res, next) {
  if (!req.session?.user?.id) return res.status(401).json({ error: 'Autenticação necessária' });
  next();
}

router.get('/', requireUser, (req, res) => {
  const consents = readConsents().filter((item) => item.user_id === String(req.session.user.id));
  res.json({ consents });
});

router.post('/', requireUser, (req, res) => {
  const { purpose, policy_version } = req.body;
  if (typeof purpose !== 'string' || purpose.trim().length < 3) {
    return res.status(400).json({ error: 'purpose é obrigatório' });
  }
  if (typeof policy_version !== 'string' || policy_version.trim().length < 1) {
    return res.status(400).json({ error: 'policy_version é obrigatório' });
  }

  const consents = readConsents();
  const active = consents.find((item) =>
    item.user_id === String(req.session.user.id) &&
    item.purpose === purpose.trim() &&
    item.revoked_at === null
  );
  if (active) return res.status(409).json({ error: 'Consentimento já ativo', consent: active });

  const consent = {
    id: crypto.randomUUID(),
    user_id: String(req.session.user.id),
    purpose: purpose.trim(),
    policy_version: policy_version.trim(),
    granted_at: new Date().toISOString(),
    revoked_at: null
  };
  consents.push(consent);
  writeConsents(consents);
  return res.status(201).json({ consent });
});

router.delete('/:id', requireUser, (req, res) => {
  const consents = readConsents();
  const consent = consents.find((item) =>
    item.id === req.params.id &&
    item.user_id === String(req.session.user.id) &&
    item.revoked_at === null
  );
  if (!consent) return res.status(404).json({ error: 'Consentimento ativo não encontrado' });
  consent.revoked_at = new Date().toISOString();
  writeConsents(consents);
  return res.json({ consent });
});

module.exports = router;
