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
-   **Backend:** [Firebase](https://firebase.google.com/) (Authentication e Firestore)
-   **Geração de Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes Node, como `npm`, `pnpm` ou `yarn`.
-   Uma conta Google para usar o Firebase.

### 2. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Configurar o Backend (Firebase)

Este protótipo precisa de um backend Firebase para funcionar. A configuração é gratuita e não exige um cartão de crédito para os recursos que utilizamos.

#### Passo 1: Crie seu Projeto no Firebase

1.  Acesse o [**Firebase Console**](https://console.firebase.google.com/) e faça login com sua conta Google.
2.  Clique em "**Adicionar projeto**" e siga as instruções para criar um novo projeto (ex: `meu-app-ceolin`).

#### Passo 2: Crie um Aplicativo Web e Obtenha a Configuração

1.  Dentro do seu projeto Firebase, clique no ícone de engrenagem ao lado de "**Visão geral do projeto**" e vá para "**Configurações do projeto**".
2.  Na aba "**Geral**", role para baixo até a seção "**Seus apps**".
3.  Clique no ícone **</>** para criar um novo aplicativo Web.
4.  Dê um nome ao seu app (ex: "Ceolin App Web") e clique em "**Registrar app**".
5.  O Firebase exibirá o objeto `firebaseConfig`. **Copie este objeto inteiro.**

#### Passo 3: Adicione a Configuração ao Projeto

1.  Abra o arquivo `src/lib/firebase.ts` no seu editor de código.
2.  **Substitua** o objeto `firebaseConfig` existente pelo que você copiou do Firebase Console.

    ```typescript
    // src/lib/firebase.ts

    // Cole sua configuração do Firebase aqui
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      projectId: "SEU_PROJECT_ID",
      // ...e assim por diante
    };

    // ...o resto do arquivo permanece o mesmo
    ```

#### Passo 4: Ative os Serviços no Firebase

1.  No menu lateral do Firebase Console, vá para a seção **Build**.
2.  Clique em **Authentication**:
    *   Vá para a aba **"Sign-in method"**.
    *   Clique em **"E-mail/senha"** e ative-o.
3.  Clique em **Firestore Database**:
    *   Clique em **"Criar banco de dados"**.
    *   Selecione **"Iniciar em modo de produção"** e clique em "Avançar".
    *   Escolha uma localização para o seu banco de dados (pode ser a padrão) e clique em **"Ativar"**.

#### Passo 5: Aplique as Regras de Segurança do Firestore

Esta é a etapa mais importante para que o aplicativo funcione.

1.  No Firebase Console, dentro do **Firestore Database**, vá para a aba **"Regras"**.
2.  Copie **todo o conteúdo** do arquivo `firestore.rules` que está na raiz deste projeto.
3.  Cole o conteúdo na caixa de texto das regras no Firebase, substituindo qualquer regra existente.
4.  Clique em **"Publicar"**.

### 4. Executar o Projeto Localmente

Com o backend configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002`. Agora você pode criar usuários (passageiros, motoristas) e usar todas as funcionalidades.

---

## ✨ Funcionalidades Implementadas

O protótipo atual é um MVP (Produto Mínimo Viável) robusto, com a interface completa e a lógica funcional para as seguintes funcionalidades:

### Para o Passageiro
-   Interface de Solicitação de Corrida (Urbana e Interior), com opção de **agendamento**.
-   Visualização e seleção de motoristas disponíveis.
-   Formulários de Login, Cadastro e Recuperação de Senha.
-   Painel de Perfil com Histórico, Conversas e Segurança.
-   Acompanhamento do Status da Corrida.
-   Comunicação via Chat.

### Para o Motorista
-   Painel completo com abas para Solicitações, Conversas, Histórico e Perfil.
-   Gerenciamento de Status (Online, Offline, Em Viagem).
-   **Registro de Corridas Manuais** e **Corridas Rápidas**.
-   Exportação de Relatórios em PDF e CSV.
-   Upload de Documentos (CNH, CRLV) e fotos.
-   Navegação via Waze/Google Maps.
-   Chat de Negociação para corridas de interior.

### Para o Administrador e Atendente
-   Painel de Gerenciamento de usuários, documentos e conversas de suporte.
-   Listas rápidas de usuários com atalhos para iniciar conversas.
-   Painel do Desenvolvedor para monitoramento da saúde da API.

---

## ➡️ Próximos Passos para Produção

1.  **Integração com Gateway de Pagamento (Crítico)**
2.  **Integração com API de Mapas Real** (Google Maps, Mapbox)
3.  **Sistema de Avaliação (Estrelas)**
4.  **Notificações Push** (via Firebase Cloud Messaging)
