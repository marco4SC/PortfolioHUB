process.env.GOOGLE_GENAI_USE_VERTEXAI = "false";
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const geminiRoutes = require('./routes/gemini');
const consentRoutes = require('./routes/consent');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('SESSION_SECRET é obrigatório em produção'); })()
    : 'development-only-session-secret'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/consents', consentRoutes);

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Não autenticado' });
  }
});

const originalUrl = '/v1beta/';
app.use((req, res, next) => {
    if (req.url.includes('/models/gemini-')) {
        req.url = originalUrl + req.url;
    }
    next();
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});