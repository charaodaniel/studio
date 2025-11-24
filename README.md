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
-   **Backend:** [PocketBase](https://pocketbase.io/)
-   **Hospedagem de Backend (Grátis):** [PocketHost](https://pockethost.io/)
-   **Geração de Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes Node, como `npm`, `pnpm` ou `yarn`.

### 2. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Configurar o Backend (PocketBase com PocketHost - Grátis)

Este protótipo precisa de um backend PocketBase para funcionar. A maneira mais fácil, rápida e gratuita de fazer isso é usando o serviço **PocketHost.io**. Ele elimina a necessidade de gerenciar um servidor (VPS).

#### Passo 1: Crie seu Backend Gratuito no PocketHost

1.  Acesse [**pockethost.io**](https://pockethost.io/) e crie uma conta.
2.  No painel, clique em "**New Instance**".
3.  Dê um nome para sua instância (ex: `meu-app-ceolin`). O PocketHost gerará uma URL para você, como `https://meu-app-ceolin.pockethost.io`.
4.  **Esta URL é o endereço do seu backend.**

#### Passo 2: Configure a URL no seu Projeto

1.  Crie um novo arquivo na raiz do seu projeto chamado `.env.local`.
2.  Dentro deste arquivo, adicione a seguinte linha, substituindo pela URL que você obteve do PocketHost:

    ```env
    # Substitua pela sua URL do PocketHost
    NEXT_PUBLIC_API_BASE=https://meu-app-ceolin.pockethost.io
    ```
    **Importante:** Não adicione `/` ou `/_/` no final da URL.

#### Passo 3: Importe o Schema do Banco de Dados

1.  Abra o painel de administrador do seu PocketBase. A URL será `https://sua-url.pockethost.io/_/`.
2.  Vá para **Settings > Import collections**.
3.  Clique em **Load from file** e selecione o arquivo `pocketbase_schema.json` que está na raiz deste projeto.
4.  Clique em **Import**. Isso criará todas as tabelas (`users`, `rides`, etc.) automaticamente.

#### Passo 4: Aplique as Regras de Acesso (API Rules)

As regras de acesso não são importadas automaticamente. Você precisa configurá-las manualmente.
-   As instruções detalhadas para copiar e colar cada regra estão no arquivo: [**POCKETBASE_API.md**](./src/POCKETBASE_API.md). Siga este guia para cada coleção.

#### Passo 5: Crie seu Primeiro Administrador

1.  No painel do PocketBase, vá para a aba **Admins**.
2.  Clique em **+ New Admin** e crie sua conta de administrador.
3.  As instruções detalhadas estão no arquivo [**ADMIN_SETUP.md**](./ADMIN_SETUP.md).

#### Passo 6: Configure o Envio de E-mails (Opcional, para "Esqueci a Senha")
- Para que a recuperação de senha funcione, configure o serviço de e-mail em **Settings > Mail Settings** no seu painel PocketBase.

### 4. Executar o Projeto Localmente

Com o backend configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002`.

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
4.  **Notificações