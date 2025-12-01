# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300/1E3A8A/FFFFFF?text=CEOLIN%20Mobilidade%20Urbana)

Bem-vindo ao repositório do protótipo funcional do aplicativo **CEOLIN Mobilidade Urbana**. Este projeto foi desenvolvido com tecnologias modernas para criar uma interface de usuário rica, responsiva e escalável, servindo como uma base sólida para a implementação do produto final.

Este documento serve como guia central para desenvolvedores, detalhando a arquitetura, configuração e funcionalidades implementadas no protótipo.

---

## 🚀 Tecnologias Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **UI Library:** [React](https://react.dev/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes:** [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
-   **Geração de Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes Node, como `npm`.
-   Uma conta Google para usar o Firebase.

### 2. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Configurar o Backend (Firebase)

Este protótipo usa o Firebase como backend. A configuração é gratuita e não exige cartão de crédito.

#### Passo 1: Crie um Projeto no Firebase

1.  Acesse o [**Firebase Console**](https://console.firebase.google.com/) e faça login com sua conta Google.
2.  Clique em **"Adicionar projeto"** e siga as instruções para criar um novo projeto. Não é necessário ativar o Google Analytics.

#### Passo 2: Configure seu Aplicativo Web no Firebase

1.  Dentro do seu novo projeto, clique no ícone da web **</>** para "Adicionar um app da Web".
2.  Dê um nome ao seu aplicativo (ex: "CEOLIN Web") e clique em **"Registrar app"**.
3.  O Firebase exibirá um objeto de configuração chamado `firebaseConfig`. **Copie este objeto inteiro.**

    ![Configuração do Firebase](https://placehold.co/800x400/E3F2FD/1E3A8A?text=Copie+o+objeto+firebaseConfig)

#### Passo 3: Configure as Variáveis de Ambiente (Local)

1.  Na raiz do seu projeto, crie um arquivo chamado `.env.local`.
2.  Cole as chaves do objeto `firebaseConfig` neste arquivo, adicionando o prefixo `NEXT_PUBLIC_` a cada uma:

    ```bash
    # .env.local
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu-projeto"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:123...:web:..."
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-..."
    ```

#### Passo 4: Ative os Serviços do Firebase

1.  No console do Firebase, no menu lateral (seção **Build**), clique em **Authentication**.
2.  Clique em **"Primeiros passos"** e, na aba **"Provedores de login"**, ative o provedor **"E-mail/senha"**.
3.  Volte ao menu lateral, clique em **Firestore Database**.
4.  Clique em **"Criar banco de dados"**, escolha o modo de **Produção** e selecione um local para o servidor (recomendo `southamerica-east1` para o Brasil).

#### Passo 5: Configure as Regras de Segurança do Firestore

1.  Ainda no Firestore, vá para a aba **"Regras"**.
2.  Apague todo o conteúdo existente e cole o conteúdo do arquivo `firestore.rules` (que está na raiz deste projeto) no editor.
3.  Clique em **"Publicar"**.

### 4. Crie o Primeiro Administrador

Para gerenciar o sistema, você precisa criar o primeiro administrador manualmente. Siga as instruções detalhadas no arquivo `ADMIN_SETUP.md`.

### 5. Execute o Projeto Localmente

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002`.

### 6. Configurar para Produção (Vercel)

1.  No painel do seu projeto na Vercel, vá para **Settings > Environment Variables**.
2.  Adicione cada uma das variáveis do seu arquivo `.env.local` (com o mesmo nome `NEXT_PUBLIC_...` e valor).
3.  Salve e faça um **Redeploy** do seu projeto.

---

## ✨ Funcionalidades Implementadas

O protótipo é um MVP robusto com lógica funcional para:

-   **Passageiro**: Solicitação de corrida, agendamento, login/cadastro, perfil, chat.
-   **Motorista**: Painel de solicitações, gerenciamento de status, registro de corridas, exportação de relatórios, upload de documentos, chat.
-   **Administrador e Atendente**: Gerenciamento de usuários, documentos, e conversas de suporte.
