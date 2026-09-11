const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Verifica se a chave da API existe
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'sua_chave_api_aqui') {
    console.warn('⚠️  ATENÇÃO: GEMINI_API_KEY não configurada ou está com o valor padrão.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt não fornecido' });
    }

    try {
        // Testa se a chave foi fornecida
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'sua_chave_api_aqui') {
            return res.status(500).json({ error: 'Chave do Gemini não configurada no servidor.' });
        }

        // Usa o modelo mais estável (gemini-1.5-flash é o mais rápido e gratuito)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        
        res.json({ reply: reply });
    } catch (error) {
        console.error('Erro detalhado do Gemini:', error);
        // Retorna uma mensagem amigável
        let errorMsg = 'Erro interno ao processar sua pergunta.';
        if (error.message) errorMsg = error.message;
        res.status(500).json({ error: 'Gemini: ' + errorMsg });
    }
});

router.get('/security-tips', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'sua_chave_api_aqui') {
            return res.status(500).json({ error: 'Chave do Gemini não configurada' });
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(
            'Liste 3 boas práticas de segurança para uma aplicação web com autenticação OAuth e armazenamento local de dados.'
        );
        res.json({ tips: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar dicas' });
    }
});

module.exports = router;