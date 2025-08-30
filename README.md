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
-   **Backend (Alvo):** [PocketBase](https://pocketbase.io/)
-   **Geração de Relatórios:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
-   **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente em seu ambiente de desenvolvimento.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes Node, como `npm`, `pnpm` ou `yarn`.

### 2. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 3. Instalar Dependências

Use o gerenciador de pacotes de sua preferência. Por exemplo, com `npm`:
```bash
npm install
```

### 4. Configurar o Backend (PocketBase)

Este protótipo foi projetado para se conectar a um backend **PocketBase**. A configuração correta do backend é **essencial** para que o aplicativo funcione.

1.  **Criação do Primeiro Administrador:** O passo mais importante é criar seu acesso de administrador. As instruções estão no arquivo [**ADMIN_SETUP.md**](./ADMIN_SETUP.md).

2.  **Guia de Schema e API:** Toda a estrutura de banco de dados necessária (coleções, campos, regras de acesso) está detalhada no arquivo [**POCKETBASE_API.md**](./POCKETBASE_API.md). Use este guia para configurar suas coleções no painel do PocketBase.

3.  **Configuração de Ambiente:**
    -   Renomeie o arquivo `.env.example` para `.env.local` (se existir) ou crie um novo.
    -   Abra o arquivo `.env.local` e insira a URL do seu servidor PocketBase. **É crucial que a URL comece com `https://` e não contenha a parte `/_/` no final**.

    ```env
    # Substitua pelo seu domínio do PocketBase
    NEXT_PUBLIC_API_BASE=https://seu-servidor-pocketbase.com
    ```

    Isso garantirá que o aplicativo saiba onde encontrar a API do seu backend.

4.  **Configurações de CORS e HTTPS (IMPORTANTE):** Para que a comunicação entre o frontend (Next.js na Vercel) e o backend (PocketBase) funcione, é crucial configurar o CORS na sua instância do PocketBase. As instruções detalhadas estão no arquivo [**POCKETBASE_SETUP.md**](./POCKETBASE_SETUP.md).

5. **Configuração de E-mail (SMTP) para Recuperação de Senha:**
    - Para que a funcionalidade "Esqueceu sua senha?" funcione, você precisa configurar o servidor de e-mail no seu painel PocketBase.
    - Acesse **Settings > Mail Settings** e preencha com os dados do seu provedor de SMTP.

### 5. Executar o Projeto

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:9002` (ou outra porta, se a 9002 estiver em uso).

---

## 📜 Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento com Fast Refresh.
-   `npm run build`: Compila o aplicativo para produção.
-   `npm run start`: Inicia o servidor de produção após o build.
-   `npm run lint`: Executa o linter para verificar a qualidade do código.

---

## ✨ Funcionalidades Implementadas

O protótipo atual é um MVP (Produto Mínimo Viável) robusto, com a interface completa e a lógica funcional para as seguintes funcionalidades:

### Para o Passageiro

-   **Interface de Solicitação de Corrida** (Urbana e Interior).
-   **Visualização de Motoristas** disponíveis em cartões com status em tempo real.
-   **Formulários de Login e Cadastro**.
-   **Recuperação de Senha** via e-mail.
-   **Painel de Perfil** com abas para Histórico de Corridas, Conversas e Segurança (alteração de senha e avatar).
-   **Acompanhamento do Status da Corrida** (Aceita, A Caminho, Finalizada).
-   **Comunicação via Chat** com o motorista.

### Para o Motorista

-   **Painel de Controle Completo** com abas para:
    -   **Solicitações:** Receber e gerenciar novas corridas em tempo real.
    -   **Conversas:** Histórico de chats com passageiros.
    -   **Histórico:** Lista de corridas realizadas com opções avançadas.
    -   **Perfil:** Gerenciamento de dados pessoais, veículo, documentos e configurações de tarifa.
-   **Gerenciamento de Status** (Online, Offline, Em Viagem).
-   **Registro de Corridas Manuais**.
-   **Exportação de Relatórios** em PDF e CSV.
-   **Upload de Documentos** (CNH, CRLV) e fotos (perfil, veículo) via câmera ou arquivo.
-   **Navegação via Waze** para buscar o passageiro e levá-lo ao destino.
-   **Chat de Negociação** para corridas de interior.

### Para o Administrador e Atendente

-   **Painel de Gerenciamento** com abas para:
    -   **Gerenciar:** Uma tabela completa de usuários com filtros e ações (editar, desativar, etc.).
    -   **Verificação de Documentos:** Aprovar ou rejeitar documentos enviados pelos motoristas.
    -   **Conversas:** Interface para visualizar e participar de conversas de suporte com usuários.
    -   **Listas de Usuários:** Visualização rápida de Passageiros, Motoristas, Atendentes e Admins com atalho para iniciar conversa.
    -   **Ações Rápidas:** Ligar para o usuário, gerar relatório de conversas e ver logs de status.
-   **Painel do Desenvolvedor** para monitoramento da saúde da API e logs.

---

## ➡️ Próximos Passos para Produção

Embora o protótipo seja robusto, algumas funcionalidades são essenciais para que o aplicativo seja lançado em um ambiente de produção real.

1.  **Integração com Gateway de Pagamento (Crítico):**
    -   Implementar um sistema de pagamento (ex: Stripe, Mercado Pago) para processar as transações das corridas.
    -   Isso envolve a criação de uma lógica para cobrança do passageiro e repasse para o motorista.

2.  **Integração com API de Mapas Real:**
    -   Substituir o mapa de placeholder por uma solução como Google Maps API ou Mapbox.
    -   **Funcionalidades:** Mostrar a localização dos motoristas em tempo real, traçar rotas, calcular distância e tempo de chegada (ETA) com precisão.

3.  **Sistema de Avaliação (Estrelas):**
    -   Criar uma funcionalidade para que passageiros e motoristas possam se avaliar mutuamente após cada corrida. Isso é fundamental para a confiança e segurança da plataforma.

4.  **Notificações Push:**
    -   Implementar um serviço de notificações push (ex: Firebase Cloud Messaging) para alertar usuários sobre eventos importantes (corrida aceita, nova mensagem no chat, etc.), mesmo quando o aplicativo está fechado.

5.  **Testes Abrangentes e Segurança:**
    -   Realizar testes de ponta a ponta (end-to-end) para garantir que todos os fluxos funcionem sem falhas.
    -   Revisar e fortalecer a segurança, especialmente em relação à validação de dados de entrada e proteção de rotas de API.
