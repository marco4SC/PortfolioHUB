const crypto = require('crypto');
const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/github', (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.FRONTEND_URL) {
    return res.status(503).send('OAuth não configurado');
  }

  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  url.searchParams.set('scope', 'read:user user:email');
  url.searchParams.set('state', state);
  return res.redirect(url.toString());
});

router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('Código não fornecido');
  if (!state || state !== req.session.oauthState) return res.status(400).send('Estado OAuth inválido');
  delete req.session.oauthState;
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(503).send('OAuth não configurado');
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        state
      },
      { headers: { accept: 'application/json' } }
    );
    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) throw new Error('Token OAuth ausente');
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'PortfolioHUB-backend' }
    });

    req.session.regenerate((error) => {
      if (error) {
        console.error(error.message);
        return res.status(500).send('Erro ao criar sessão');
      }
      req.session.user = {
        id: userResponse.data.id,
        login: userResponse.data.login,
        avatar_url: userResponse.data.avatar_url
      };
      return res.redirect(`${process.env.FRONTEND_URL}/admin.html`);
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).send('Erro na autenticação');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).send('Erro ao encerrar sessão');
    return res.redirect(process.env.FRONTEND_URL || '/');
  });
});

module.exports = router;
