# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300/1E3A8A/FFFFFF?text=CEOLIN%20Mobilidade%20Urbana)

Bem-vindo ao repositório do protótipo funcional do aplicativo **CEOLIN Mobilidade Urbana**. Este projeto foi desenvolvido com tecnologias modernas para criar uma interface de usuário rica, responsiva e escalável.

Este documento serve como guia central para desenvolvedores, detalhando a arquitetura, configuração e funcionalidades implementadas no protótipo.

---

## 🚀 Tecnologias Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **UI Library:** [React](https://react.dev/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes:** [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend:** [GitHub as a Database](https://docs.github.com/en/rest) (usando a API do GitHub)
-   **API Wrapper:** [Octokit](https://github.com/octokit/octokit.js)
-   **Geração de Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente e em produção (Vercel).

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes Node, como `npm`.
-   Uma conta no [GitHub](https://github.com/).

### 2. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Configurar o Backend (GitHub as a Database)

Este protótipo usa a API do GitHub para ler e escrever dados em um arquivo `db.json` no próprio repositório. Para que isso funcione, você precisa gerar um Token de Acesso Pessoal (PAT) e configurar as variáveis de ambiente.

#### Passo 1: Gere um Token de Acesso Pessoal no GitHub

Siga as instruções detalhadas no arquivo `GITHUB_TOKEN_GUIDE.md` para criar um token com as permissões corretas (escopo `repo`). **Copie este token e guarde-o em um local seguro.**

#### Passo 2: Configure as Variáveis de Ambiente (Local)

Na raiz do seu projeto, crie um arquivo chamado `.env.local` e adicione as seguintes variáveis:

```bash
# .env.local

# Token de acesso pessoal do GitHub que você gerou
GITHUB_TOKEN="github_pat_..."

# O dono do repositório (seu nome de usuário no GitHub)
GITHUB_REPO_OWNER="seu-username"

# O nome do repositório
GITHUB_REPO_NAME="nome-do-seu-repositorio"
```

**Importante:** Nunca envie o arquivo `.env.local` para o GitHub. Ele já está no `.gitignore`.

### 4. Execute o Projeto Localmente

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002`.

### 5. Configurar para Produção (Vercel)

Para que o aplicativo funcione quando publicado na Vercel, você precisa adicionar as mesmas variáveis de ambiente lá.

1.  No painel do seu projeto na Vercel, vá para **Settings > Environment Variables**.
2.  Adicione cada uma das três variáveis do seu arquivo `.env.local`:
    *   `GITHUB_TOKEN`
    *   `GITHUB_REPO_OWNER`
    *   `GITHUB_REPO_NAME`
3.  **Não adicione o prefixo `NEXT_PUBLIC_`**. Como essas variáveis contêm segredos (o token), elas devem ser acessíveis apenas no lado do servidor, e a Vercel gerencia isso automaticamente.
4.  Salve as variáveis.
5.  Faça um **Redeploy** do seu projeto para que as novas variáveis sejam aplicadas.

---

## ✨ Funcionalidades (em desenvolvimento com a nova arquitetura)

A arquitetura está sendo adaptada para usar o GitHub como banco de dados. As funcionalidades existentes serão refatoradas para usar o novo `GithubService`.

-   **Passageiro**: Solicitação de corrida, agendamento, etc.
-   **Motorista**: Painel de solicitações, gerenciamento de status, etc.
-   **Administrador**: Gerenciamento de usuários e dados via `db.json`.
