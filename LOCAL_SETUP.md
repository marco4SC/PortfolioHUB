# Configuração local do PortfolioHUB

## 1. Backend

No PowerShell, dentro de `backend`:

```powershell
Copy-Item .env.example .env
npm ci
npm test
npm start
```

O backend ficará disponível em `http://localhost:3000`.

## 2. Frontend

Em outro terminal, na raiz do repositório:

```powershell
python -m http.server 5500 --directory frontend
```

Abra `http://localhost:5500`.

Não abra os HTMLs diretamente com `file://`: o navegador bloqueará chamadas de sessão e API.

## 3. GitHub OAuth local

No GitHub, crie ou edite uma OAuth App e configure:

- Homepage URL: `http://localhost:5500`
- Authorization callback URL: `http://localhost:3000/auth/github/callback`

Depois preencha `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` no arquivo local `backend/.env`. Esses valores não devem ser commitados.

## 4. Fluxo do AI Job Apply

1. Acesse `http://localhost:5500`.
2. Entre com GitHub.
3. Use o backend autenticado para registrar o consentimento `job_application_processing`.
4. Envie uma vaga e um perfil para `POST http://localhost:3000/api/job-apply/match`.
5. Consulte a revisão e aprove somente o `dry-run`.

Teste rápido do backend:

```powershell
Invoke-RestMethod http://localhost:3000/health
```
