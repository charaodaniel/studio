# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300.png?text=CEOLIN+Mobilidade+Urbana)

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

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente em seu ambiente de desenvolvimento.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [pnpm](https://pnpm.io/) (recomendado, mas `npm` ou `yarn` também funcionam)

### 2. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 3. Instalar Dependências

```bash
pnpm install
```

### 4. Configurar o Backend (PocketBase)

Este protótipo foi projetado para se conectar a um backend **PocketBase**.

1.  **Guia de Schema e API:** Toda a estrutura de banco de dados necessária (coleções, campos, regras de acesso) está detalhada no arquivo [**POCKETBASE_API.md**](./POCKETBASE_API.md). Use este guia para configurar suas coleções no painel do PocketBase.

2.  **Configuração de Ambiente:**
    -   Renomeie o arquivo `.env.example` para `.env.local` (se existir) ou crie um novo.
    -   Abra o arquivo `.env.local` e insira a URL do seu servidor PocketBase. **É crucial que a URL comece com `https://`**.

    ```env
    # Substitua pelo seu domínio do PocketBase
    NEXT_PUBLIC_POCKETBASE_URL=https://sua-api.seudominio.com
    ```

    Isso garantirá que o aplicativo saiba onde encontrar a API do seu backend.

3.  **Configurações de CORS e HTTPS (IMPORTANTE):** Para que a comunicação entre o frontend (Next.js na Vercel) e o backend (PocketBase) funcione, é crucial configurar o CORS na sua instância do PocketBase. As instruções detalhadas estão no arquivo [**POCKETBASE_SETUP.md**](./POCKETBASE_SETUP.md).

### 5. Executar o Projeto

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:9002` (ou outra porta, se a 9002 estiver em uso).

---

## 📜 Scripts Disponíveis

-   `pnpm dev`: Inicia o servidor de desenvolvimento com Fast Refresh.
-   `pnpm build`: Compila o aplicativo para produção.
-   `pnpm start`: Inicia o servidor de produção após o build.
-   `pnpm lint`: Executa o linter para verificar a qualidade do código.

---

## ✨ Funcionalidades do Protótipo (Frontend)

O protótipo atual possui a interface completa e a lógica visual para as seguintes funcionalidades, aguardando a conexão com o backend.

### Para o Passageiro

-   **Interface de Solicitação de Corrida** (Urbana e Interior).
-   **Visualização de Motoristas** em um mapa simulado.
-   **Formulários de Login e Cadastro**.
-   **Painel de Perfil** com abas para Histórico, Conversas e Segurança.

### Para o Motorista

-   **Painel de Controle Completo** com abas para:
    -   **Solicitações:** Receber e gerenciar novas corridas.
    -   **Conversas:** Histórico de chats com passageiros.
    -   **Histórico:** Lista de corridas realizadas com opções avançadas.
    -   **Perfil:** Gerenciamento de dados pessoais, veículo, documentos e configurações de tarifa.
-   **Gerenciamento de Status** (Online, Offline, Em Viagem).
-   **Registro de Corridas Manuais**.
-   **Exportação de Relatórios** em PDF e CSV.
-   **Upload de Documentos** (CNH, CRLV) e fotos (perfil, veículo) via câmera ou arquivo.

### Para o Administrador

-   **Painel de Gerenciamento** com abas para:
    -   **Gerenciar:** Uma tabela completa de usuários com filtros e ações (editar, desativar, etc.).
    -   **Conversas:** Interface para visualizar e participar de conversas de suporte.
    -   **Listas de Usuários:** Visualização rápida de Passageiros, Motoristas, Atendentes e Admins.
-   **Painel do Desenvolvedor** para monitoramento (simulado) da saúde do sistema.

---

## ➡️ Próximos Passos

O próximo grande passo é conectar todas as funcionalidades do frontend às suas respectivas coleções e lógicas no backend PocketBase. A documentação em `POCKETBASE_API.md` é a referência principal para esta fase.