const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const projectsFile = path.join(__dirname, '../data/projects.json');

// Garante que o arquivo existe e é um array
function initFile() {
    if (!fs.existsSync(projectsFile)) {
        fs.writeFileSync(projectsFile, '[]', 'utf-8');
    } else {
        try {
            const data = fs.readFileSync(projectsFile, 'utf-8');
            if (!data.trim()) throw new Error('vazio');
            JSON.parse(data);
        } catch (e) {
            fs.writeFileSync(projectsFile, '[]', 'utf-8');
        }
    }
}
initFile();

function readProjects() {
    const data = fs.readFileSync(projectsFile, 'utf-8');
    return JSON.parse(data);
}

function writeProjects(projects) {
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2), 'utf-8');
}

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    res.status(401).json({ error: 'Não autorizado' });
}

// GET públicos
router.get('/', (req, res) => {
    try {
        const projects = readProjects();
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao ler projetos' });
    }
});

// POST (admin)
router.post('/', isAuthenticated, (req, res) => {
    try {
        const { title, description, link, image } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
        }
        const projects = readProjects();
        const newProject = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            link: link || '',
            image: image || ''
        };
        projects.push(newProject);
        writeProjects(projects);
        res.status(201).json(newProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno ao salvar projeto' });
    }
});

// DELETE (admin)
router.delete('/:id', isAuthenticated, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let projects = readProjects();
        const newProjects = projects.filter(p => p.id !== id);
        if (projects.length === newProjects.length) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        writeProjects(newProjects);
        res.json({ message: 'Projeto removido' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao remover' });
    }
});

// PUT (admin)
router.put('/:id', isAuthenticated, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, description, link, image } = req.body;
        let projects = readProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }
        projects[index] = { ...projects[index], title, description, link, image };
        writeProjects(projects);
        res.json(projects[index]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao editar' });
    }
});

module.exports = router;