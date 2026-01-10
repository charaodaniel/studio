# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300/1E3A8A/FFFFFF?text=CEOLIN%20Mobilidade%20Urbana)

Bem-vindo ao repositório do protótipo funcional do aplicativo **CEOLIN Mobilidade Urbana**.

---

## ⚠️ Importante: Sincronizando o Projeto

Este projeto utiliza um fluxo de trabalho onde as alterações de código são feitas diretamente no repositório do GitHub. Isso pode causar conflitos (`divergent branches`) se você tentar usar `git pull` normalmente.

**Para sincronizar seu ambiente local com as atualizações mais recentes, siga as instruções no guia abaixo:**

**➡️ [Guia de Sincronização (SYNC_GUIDE.md)](./docs/SYNC_GUIDE.md)**

Seguir este guia resolverá os erros e garantirá que seu código esteja sempre atualizado.

---

## 🚀 Conceito: "Git as a CMS"

Este protótipo usa uma abordagem de **"Git as a CMS"**. Isso significa que:

-   **O "banco de dados" é um arquivo JSON:** Todos os dados de usuários, corridas e documentos são armazenados no arquivo `src/database/banco.json`.
-   **As alterações são salvas como commits:** Quando um administrador edita ou adiciona dados através do painel de admin, o aplicativo cria um novo `commit` no repositório do GitHub, atualizando o arquivo `banco.json`.
-   **Deploy automático:** A plataforma de hospedagem (Vercel, Firebase App Hosting, etc.) detecta o novo commit e automaticamente faz o deploy de uma nova versão do site com os dados atualizados.

Consulte o [**Guia de Funcionamento do CMS**](./docs/painel-edicao-sem-banco.md) para mais detalhes técnicos.

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes, como `npm`.

### 2. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Configurar Variáveis de Ambiente

Para que o sistema de edição de conteúdo funcione, você precisa criar um arquivo chamado `.env.local` na raiz do projeto e adicionar as seguintes variáveis:

```bash
# .env.local

# Token de acesso pessoal do GitHub com permissão de "repo"
GITHUB_TOKEN="ghp_seu_token_aqui"

# Nome do seu usuário ou organização no GitHub
GITHUB_REPO_OWNER="seu-usuario"

# Nome exato deste repositório
GITHUB_REPO_NAME="nome-do-repositorio"
```

> **Nota de Segurança:** O arquivo `.env.local` não é enviado para o GitHub, mantendo seu token seguro. Você também precisará configurar essas mesmas variáveis de ambiente nas configurações do seu projeto na Vercel (ou outra plataforma de hospedagem).

### 4. Execute o Projeto Localmente

Com as dependências instaladas e as variáveis configuradas, execute o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em **`http://localhost:3000`**.

---

## ✨ Funcionalidades

-   **Painel do Administrador**: Gerenciamento de usuários, verificação de documentos e monitoramento de conversas, com todas as alterações salvas diretamente no repositório.
-   **Painel do Motorista**: Visualização de solicitações, gerenciamento de status, perfil, histórico e registro de corridas manuais.
-   **Painel do Passageiro**: Solicitação de corrida, visualização de motoristas e histórico.
-   **Painel do Atendente**: Focado em suporte, com acesso a listas de usuários e painel de conversas.
