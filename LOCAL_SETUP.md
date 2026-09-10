# Configuração local do PortfolioHUB

## 0. Abra a raiz correta do projeto

No PowerShell, use o caminho completo do worktree:

```powershell
Set-Location "C:\Users\marcs\Kepler\worktrees\PortfolioHUB-ai-job_aplly-6a42a281"
```

Confirme que está no diretório certo:

```powershell
Test-Path .\backend\package.json
```

O resultado deve ser `True`.

## 1. Backend

No PowerShell, a partir da raiz do projeto:

```powershell
Copy-Item .env.example .env
npm ci
npm test
npm start
```

O backend ficará disponível em `http://localhost:3000`.

## 2. Frontend

Em outro PowerShell, entre novamente na raiz do projeto:

```powershell
Set-Location "C:\Users\marcs\Kepler\worktrees\PortfolioHUB-ai-job_aplly-6a42a281"
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
