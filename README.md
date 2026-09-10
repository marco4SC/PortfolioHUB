# Meu Portfolio de Projetos - Marco Souza Carvalho

Bem-vindo ao meu portf¢lio. Este reposit¢rio centraliza meus projetos acadˆmicos e pessoais.

## Tecnologias: Java, Python, JavaScript (HTML/CSS), Git

## Como Navegar

* [Projetos Web](projetos/projeto-inicial-web/) - Landing page inicial
* [Projetos Acadˆmicos](academicos/) - Trabalhos da faculdade
* [Projetos Pessoais](pessoais/) - Estudos e desafios pr¢prios

## AI Job Apply

O protótipo público está em [docs/demo](docs/demo/). Ele demonstra o fluxo de matching sem coletar dados pessoais e sem enviar candidaturas.

Regras do MVP:

* perfis e credenciais ficam fora do GitHub Pages;
* fontes de vagas devem ser autorizadas e respeitar seus termos de uso;
* o currículo personalizado deve usar apenas fatos fornecidos pelo candidato;
* toda candidatura exige revisão e aprovação humana;
* logs e consentimentos devem ser mantidos em armazenamento privado.

O backend possui OAuth do GitHub com validação de `state`, regeneração de sessão e endpoints autenticados para registrar, consultar e revogar consentimentos em `/api/consents`. Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET` e `FRONTEND_URL` somente no ambiente privado; nunca publique esses valores no Pages.

O workflow `ai-job-apply-demo.yml` usa `workflow_dispatch` como aprovação operacional: a entrada `approved` precisa ser marcada manualmente, mas ainda produz somente um `dry-run`. O workflow `pages-smoke-test.yml` verifica periodicamente as páginas públicas da demo; o endpoint `/health` permite monitorar o backend quando ele estiver hospedado.

## API real do AI Job Apply

Com OAuth do GitHub e consentimento ativo `job_application_processing`, o backend oferece:

* `POST /api/job-apply/match` para criar uma revisão com score, habilidades encontradas e ausentes;
* `GET /api/job-apply/:id` para consultar a revisão do próprio usuário;
* `POST /api/job-apply/:id/approve` para aprovar a preparação em `dry-run`.

A aprovação não envia e-mail, não acessa LinkedIn e não submete formulários. O registro permanece privado no backend e pode ser revogado pelo endpoint de consentimento.
