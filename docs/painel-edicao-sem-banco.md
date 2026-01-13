# Guia: Como Funciona o "CMS Sem Banco de Dados" com GitHub

Este documento explica a arquitetura por trás do sistema de edição de conteúdo do nosso aplicativo. Em vez de usar um banco de dados tradicional, utilizamos o próprio repositório do GitHub como nossa fonte de dados, uma abordagem conhecida como **"Git as a CMS"**.

Isso nos dá um controle de versão natural para o conteúdo e simplifica drasticamente a infraestrutura.

---

## O Conceito: "Git as a Database"

A ideia central é que o arquivo de conteúdo `src/database/banco.json` dentro do nosso projeto serve como o "banco de dados". Qualquer alteração nesse arquivo, feita através de um `commit`, resulta em um novo deploy do site, atualizando o conteúdo para todos os usuários.

O processo de edição e salvamento é totalmente automatizado, de modo que o administrador não precisa interagir diretamente com o Git.

---

## Fluxo de Funcionamento (3 Passos)

O processo, desde clicar em "Salvar" no painel de admin até o site ser atualizado, acontece em três etapas principais:

### 1. Painel de Edição (Cliente / Navegador)

-   **Onde:** Acontece no navegador do administrador, por exemplo, na página de gerenciamento de usuários.
-   **O que faz:** Um administrador preenche um formulário para adicionar ou editar um usuário.
-   **Ação:** Ao clicar em **"Salvar"**, o navegador **não** se comunica diretamente com o GitHub. Em vez disso, ele envia os dados (o conteúdo JSON atualizado do `banco.json`) para uma rota de API interna do nosso próprio aplicativo Next.js: `/api/save-content`.
-   **Por quê?** Esta é uma medida de segurança crucial. A chave de acesso ao GitHub (`GITHUB_TOKEN`) nunca é exposta no navegador, permanecendo segura em nosso servidor.

### 2. Nossa API Interna (Servidor)

-   **Onde:** A rota `/api/save-content` é executada no servidor (na Vercel ou durante o `npm run dev` local).
-   **O que faz:** Esta rota é a ponte entre nosso aplicativo e o GitHub. Ela realiza a "mágica":
    1.  **Recebe os Dados:** Pega o conteúdo JSON completo enviado pelo painel de edição.
    2.  **Lê as Chaves Secretas:** Acessa as variáveis de ambiente `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, e `GITHUB_REPO_NAME`, que só existem no servidor.
    3.  **Comunica-se com a API do GitHub:**
        -   Primeiro, ela **busca o arquivo atual** (`banco.json`) no repositório para obter um identificador único da versão dele, chamado `sha`. A API do GitHub exige esse `sha` para garantir que estamos atualizando a versão mais recente, evitando conflitos de edição.
        -   Em seguida, ela envia o **novo conteúdo** (codificado em Base64) para a API do GitHub, junto com o `sha` do arquivo antigo e uma mensagem de commit (ex: "CMS: Atualização em src/database/banco.json").
    4.  **Resultado:** O GitHub recebe essa requisição, cria um novo `commit` no repositório com as alterações e retorna uma resposta de sucesso para a nossa API.

### 3. Deploy Automático (Plataforma de Hospedagem)

-   **Onde:** Acontece na nossa plataforma de hospedagem (Vercel, Firebase App Hosting, etc.).
-   **O que faz:** A plataforma está configurada para "ouvir" qualquer `commit` novo na `branch` principal do nosso repositório.
-   **Ação:**
    1.  Ao detectar o novo `commit` feito pela nossa API, a plataforma automaticamente inicia um novo processo de **build** (recria o site do zero com os dados atualizados).
    2.  Após a conclusão do build, ela faz o **deploy**, colocando a nova versão do site no ar.

---

## Resumo Visual

`Painel Admin` ➡️ `POST para /api/save-content` ➡️ `API do GitHub (cria commit)` ➡️ `Hospedagem (detecta commit)` ➡️ `Novo Deploy do Site`

Este ciclo garante que o conteúdo do site seja sempre um reflexo direto do que está na `branch` principal do nosso repositório, com um processo de atualização seguro e automatizado.
