# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300/1E3A8A/FFFFFF?text=CEOLIN%20Mobilidade%20Urbana)

Bem-vindo ao repositório do protótipo funcional do aplicativo **CEOLIN Mobilidade Urbana**. Este projeto demonstra uma aplicação web completa com painéis para administradores, motoristas, passageiros e atendentes.

---

## 🚀 Conceito: "Git as a CMS" (Sistema de Gerenciamento de Conteúdo)

Este protótipo utiliza uma abordagem inovadora de **"Git as a CMS"**. Isso significa que o aplicativo não precisa de um banco de dados tradicional. Em vez disso:

-   **O "Banco de Dados" é um Arquivo JSON:** Todos os dados da aplicação (usuários, corridas, documentos, etc.) são armazenados em um único arquivo: `src/database/banco.json`.
-   **Alterações são Salvas como Commits:** Quando um administrador edita ou adiciona dados através do painel de admin (por exemplo, ao criar um novo usuário), o aplicativo usa a API do GitHub para criar um novo `commit` no repositório, atualizando o arquivo `banco.json`.
-   **Deploy Automático:** A plataforma de hospedagem (como Vercel ou Firebase App Hosting) detecta o novo commit e automaticamente faz o deploy de uma nova versão do site com os dados atualizados.

Este método simplifica a infraestrutura, elimina a necessidade de gerenciar um banco de dados externo e fornece um histórico de versões natural para todo o conteúdo da aplicação.

Para mais detalhes técnicos, consulte o [**Guia de Funcionamento do CMS**](./docs/painel-edicao-sem-banco.md).

---

## 🛠️ Configuração e Instalação Local

Siga os passos abaixo para executar o projeto em seu ambiente de desenvolvimento.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes, como `npm`.
-   Uma conta no [GitHub](https://github.com/).

### 2. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 3. Instalar as Dependências

```bash
npm install
```

### 4. Configurar Variáveis de Ambiente

Para que o sistema de edição de conteúdo via GitHub funcione, você precisa criar um **Token de Acesso Pessoal** no GitHub.

1.  **Crie um Token no GitHub:**
    *   Vá para **GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)**.
    *   Clique em **"Generate new token"**.
    *   Dê um nome ao token (ex: `ceolin-cms`).
    *   Selecione o escopo (permissão) `repo`.
    *   Clique em **"Generate token"** e copie o token gerado (ex: `ghp_...`).

2.  **Preencha o Arquivo `.env`:**
    *   Na raiz do seu projeto, edite o arquivo chamado `.env`.
    *   Adicione as seguintes variáveis, substituindo pelos seus próprios valores:

    ```bash
    # .env

    # Token de acesso pessoal do GitHub que você acabou de criar
    GITHUB_TOKEN="ghp_seu_token_aqui"

    # Seu nome de usuário ou organização no GitHub
    GITHUB_REPO_OWNER="seu-usuario-github"

    # O nome exato deste repositório
    GITHUB_REPO_NAME="nome-do-repositorio"
    ```

> **Nota de Segurança:** O arquivo `.env` geralmente é ignorado pelo Git, mantendo seu token seguro. Ao fazer o deploy para produção (ex: Vercel), você precisará configurar essas mesmas variáveis de ambiente nas configurações do seu projeto na plataforma de hospedagem.

### 5. Execute o Projeto

Com tudo configurado, execute o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em **`http://localhost:3000`**.

---

## ✨ Funcionalidades

-   **Painel do Administrador**: Gerenciamento de usuários e verificação de documentos, com todas as alterações salvas diretamente no repositório.
-   **Painel do Motorista**: Visualização de solicitações, gerenciamento de status, perfil e histórico.
-   **Painel do Passageiro**: Solicitação de corrida, visualização de motoristas e histórico.
-   **Painel do Atendente**: Focado em suporte, com acesso a listas de usuários e painel de conversas.
