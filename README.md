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
