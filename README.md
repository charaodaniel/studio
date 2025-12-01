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
-   **Backend:** [PocketBase](https://pocketbase.io/) (via [PocketHost](https://pockethost.io/))
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

### 3. Configurar o Backend (PocketBase)

Este protótipo precisa de um backend PocketBase para funcionar. Recomendamos usar o **PocketHost**, que oferece uma camada gratuita e automatiza a hospedagem.

#### Passo 1: Obtenha seu Backend no PocketHost

1.  Acesse [**PocketHost.io**](https://pockethost.io/) e crie uma conta (você pode usar sua conta do GitHub).
2.  No painel, crie um novo projeto. O PocketHost irá gerar uma URL para a sua API (ex: `https://seu-app.pockethost.io`). **Copie esta URL.**
    *   *Se tiver dúvidas sobre como gerar o Token do GitHub necessário, consulte o guia `GITHUB_TOKEN_GUIDE.md`.*

#### Passo 2: Configure as Variáveis de Ambiente (Local)

1.  Na raiz do seu projeto, crie um arquivo chamado `.env.local`.
2.  Adicione a URL do seu backend PocketBase a este arquivo:

    ```bash
    # .env.local
    NEXT_PUBLIC_POCKETBASE_URL=https://seu-app.pockethost.io
    ```
    
    *Substitua `https://seu-app.pockethost.io` pela URL que você copiou.*

#### Passo 3: Configure o Banco de Dados no PocketBase

1.  Acesse o painel de administrador do seu PocketBase. A URL é a mesma da sua API, mas com `/_/` no final (ex: `https://seu-app.pockethost.io/_/`).
2.  Faça login com os dados de administrador que você configurou no PocketHost.
3.  Vá para **Settings > Import collections**.
4.  Clique em **Load from file** e selecione o arquivo `pocketbase_schema.json` que está na raiz deste projeto.
5.  Clique em **Import**.

Isso irá configurar todas as coleções (`users`, `rides`, `chats`, etc.) com os campos e regras necessários. **Nenhuma etapa manual de configuração de regras é necessária**, pois elas são importadas junto com o schema.

### 4. Executar o Projeto Localmente

Com o backend configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002`. Agora você pode criar usuários (passageiros, motoristas) e usar todas as funcionalidades.

### 5. Configurar para Produção (Vercel)

Para que o aplicativo publicado na Vercel se conecte ao backend, você precisa configurar a variável de ambiente lá também.

1.  No painel do seu projeto na Vercel, vá para **Settings > Environment Variables**.
2.  Adicione uma variável com o **Name** `NEXT_PUBLIC_POCKETBASE_URL` e o **Value** sendo a URL do seu PocketHost (a mesma do arquivo `.env.local`).
3.  Salve e faça um **Redeploy** do seu projeto para que a variável seja aplicada.

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
4.  **Notificações Push** (via OneSignal ou similar)
