
# Guia: Como Funciona o "CMS Sem Banco de Dados" com GitHub

Este documento explica a arquitetura por trás do sistema de edição de conteúdo do nosso aplicativo. Em vez de usar um banco de dados tradicional (como Firestore ou PocketBase), utilizamos o próprio repositório do GitHub como nossa fonte de dados.

Isso nos dá um controle de versão natural para o conteúdo e simplifica a infraestrutura.

---

## O Conceito: "Git as a Database"

A ideia é que arquivos de conteúdo (como `src/database/banco.json`) dentro do nosso projeto sirvam como o "banco de dados". Qualquer alteração nesses arquivos, feita através de um `commit`, resulta em um novo deploy do site, atualizando o conteúdo para todos os usuários.

O processo de edição e salvamento é automatizado para que o administrador não precise interagir diretamente com o Git.

---

## Fluxo de Funcionamento (3 Passos)

O processo, desde clicar em "Salvar" até o site ser atualizado, acontece em três etapas principais:

### 1. Painel de Edição (Cliente)

-   **Onde:** Acontece no seu navegador, na página `/admin/developer`.
-   **O que faz:** Um administrador edita o conteúdo em um formulário (no nosso caso, um campo de texto que aceita um JSON).
-   **Ação:** Ao clicar em **"Salvar"**, o navegador **não** se comunica diretamente com o GitHub. Em vez disso, ele envia os dados (o conteúdo JSON do arquivo) para uma rota de API interna do nosso próprio aplicativo (ex: `/api/save-content`).
-   **Por quê?** Isso é uma medida de segurança crucial. A chave de acesso ao GitHub (`GITHUB_TOKEN`) nunca é exposta no navegador, ficando segura no nosso servidor.

### 2. Nossa API (Servidor)

-   **Onde:** A rota `/api/save-content` é executada no servidor (na Vercel ou durante o `npm run dev` local).
-   **O que faz:** Esta é a ponte entre nosso aplicativo e o GitHub. Ela realiza a "mágica":
    1.  **Recebe os Dados:** Pega o conteúdo JSON enviado pelo painel de edição.
    2.  **Lê as Chaves Secretas:** Acessa as variáveis de ambiente `GITHUB_REPO` e `GITHUB_TOKEN`, que só existem no servidor.
    3.  **Comunica-se com a API do GitHub:**
        -   Primeiro, ela **busca o arquivo atual** no repositório para obter um identificador único da versão dele, chamado `sha`. A API do GitHub exige esse `sha` para garantir que estamos atualizando a versão mais recente do arquivo, evitando conflitos.
        -   Em seguida, ela envia o **novo conteúdo** para a API do GitHub, junto com o `sha` do arquivo antigo e uma mensagem de commit (ex: "Atualização de conteúdo via CMS").
    4.  **Resultado:** O GitHub recebe essa requisição, cria um novo `commit` no repositório com as alterações e retorna uma resposta de sucesso para a nossa API.

### 3. Deploy Automático (Vercel / Firebase Hosting)

-   **Onde:** Acontece na nossa plataforma de hospedagem (Vercel, Netlify, Firebase App Hosting, etc.).
-   **O que faz:** A plataforma está configurada para "ouvir" qualquer `commit` novo na `branch` principal do nosso repositório.
-   **Ação:**
    1.  Ao detectar o novo `commit` feito pela nossa API, a plataforma automaticamente inicia um novo processo de **build** (recria o site do zero).
    2.  Após o build ser concluído, ela faz o **deploy**, ou seja, coloca a nova versão do site no ar.

---

## Resumo Visual

`Painel Admin` ➡️ `POST /api/save-content` ➡️ `API do GitHub (cria commit)` ➡️ `Vercel (detecta commit)` ➡️ `Novo Deploy`

Este ciclo garante que o conteúdo do site seja sempre um reflexo direto do que está na `branch` principal do nosso repositório, com um processo de atualização seguro e automatizado.
