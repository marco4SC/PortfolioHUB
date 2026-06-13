const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/github', (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`;
  res.redirect(githubAuthURL);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Código não fornecido');
  }

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    req.session.user = userResponse.data;
    res.redirect(`${process.env.FRONTEND_URL}/admin.html`);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Erro na autenticação');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

module.exports = router;