# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300/1E3A8A/FFFFFF?text=CEOLIN%20Mobilidade%20Urbana)

Bem-vindo ao repositório do protótipo funcional do aplicativo **CEOLIN Mobilidade Urbana**. Este projeto foi desenvolvido com tecnologias modernas para criar uma interface de usuário rica, responsiva e escalável.

Este documento serve como guia central para desenvolvedores, detalhando a arquitetura, configuração e funcionalidades implementadas no protótipo.

---

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://react.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [ShadCN/UI](https://ui.shadcn.com/)
- **Backend:** [PocketBase](https://pocketbase.io/)
- **Hospedagem de Backend (Sugerida):** [PocketHost.io](https://pockethost.io/) (Serviço gratuito para hospedar PocketBase) ou servidor próprio.
- **Geração de Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente e em produção (Vercel).

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Um gerenciador de pacotes Node, como `npm`.
- Uma conta no [GitHub](https://github.com/) (para clonar e hospedar o código).

### 2. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Configurar o Backend (PocketBase)

Este aplicativo precisa de um backend PocketBase para funcionar. 

#### Opção A: Usar um Servidor Próprio (Ex: `https://meu-servidor.com`)
Se você já tem o PocketBase rodando em um servidor, você só precisa da URL dele.

#### Opção B: Rodar o PocketBase Localmente (Para Desenvolvimento)
1.  Baixe o executável do [PocketBase](https://pocketbase.io/docs/) para o seu sistema operacional.
2.  Descompacte e execute o arquivo.
3.  Abra seu terminal e rode o comando: `./pocketbase serve`
4.  O servidor estará disponível em `http://127.0.0.1:8090`.

### 4. Configurar as Variáveis de Ambiente

**Este é o passo mais importante.** Na raiz do seu projeto, crie um arquivo chamado `.env.local` e adicione a URL do seu backend PocketBase.

```bash
# .env.local

# Para produção, use seu domínio.
NEXT_PUBLIC_POCKETBASE_URL="https://seu-servidor-pocketbase.com"

# Para rodar localmente, comente a linha de cima e descomente a de baixo.
# NEXT_PUBLIC_POCKETBASE_URL="http://127.0.0.1:8090"
```

**Importante:** Nunca envie o arquivo `.env.local` para o GitHub. Ele já está no `.gitignore`.

### 5. Configurar as Coleções e Regras no PocketBase

Seja no seu servidor ou localmente, você precisa configurar o banco de dados.

1.  Acesse o painel de administrador do seu PocketBase.
    *   **Produção:** `https://seu-servidor-pocketbase.com/_/`
    *   **Local:** `http://127.0.0.1:8090/_/`
2.  Siga as instruções detalhadas no arquivo `POCKETBASE_API.md` para importar as coleções e configurar as regras de acesso.

### 6. Crie seu Primeiro Usuário Administrador

Para gerenciar o sistema, você precisa criar um usuário Admin manualmente. Siga o passo a passo em `ADMIN_SETUP.md`.

### 7. Execute o Projeto Localmente

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

### 8. Configurar para Produção (Vercel)

1.  Publique seu projeto na Vercel.
2.  No painel do seu projeto na Vercel, vá para **Settings > Environment Variables**.
3.  Adicione a variável de ambiente com a URL do seu servidor de produção:
    *   `NEXT_PUBLIC_POCKETBASE_URL` = `https://seu-servidor-pocketbase.com`
4.  Faça um **Redeploy** para aplicar as variáveis.

---

## ✨ Funcionalidades

- **Passageiro**: Solicitação de corrida, agendamento, negociação de valor, histórico e chat.
- **Motorista**: Painel de solicitações em tempo real, gerenciamento de status (online/offline), chat, registro de corridas manuais e geração de relatórios.
- **Administrador**: Gerenciamento completo de usuários (motoristas, passageiros), verificação de documentos e monitoramento de conversas.
- **Atendente**: Painel focado em suporte, com acesso às conversas e status dos motoristas.
