# CEOLIN Mobilidade Urbana - Protótipo Funcional

![CEOLIN](https://placehold.co/1200x300/1E3A8A/FFFFFF?text=CEOLIN%20Mobilidade%20Urbana)

Bem-vindo ao repositório do protótipo funcional do aplicativo **CEOLIN Mobilidade Urbana**. Este projeto foi desenvolvido para demonstrar as principais funcionalidades da plataforma em um ambiente local, sem a necessidade de um banco de dados externo.

---

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://react.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [ShadCN/UI](https://ui.shadcn.com/)
- **Fonte de Dados (Protótipo):** Arquivo JSON local (`/src/database/banco.json`)
- **Notificações Sonoras:** [Howler.js](https://howlerjs.com/)

---

## ⚠️ Modo de Protótipo (Funcionamento Local)

Atualmente, este projeto está configurado para rodar em **modo de protótipo**. Isso significa que:

-   **Não é necessário um banco de dados externo.** Todos os dados de usuários, corridas e documentos são lidos do arquivo estático `/src/database/banco.json`.
-   **Ações de escrita são simuladas.** Qualquer tentativa de criar, editar ou deletar dados (como enviar uma mensagem, aprovar um documento ou registrar uma corrida) será apenas simulada na interface e não alterará o arquivo `banco.json`.
-   **Login de teste:** A autenticação é feita com base nos usuários definidos no `banco.json`. A verificação de senha é desativada, então qualquer senha funcionará para um usuário existente.

**Exemplo de Login (Admin):**
- **Email:** `daniel.kokynhw@gmail.com`
- **Senha:** `123456789` (ou qualquer outra)

---

## 🛠️ Configuração e Instalação

Siga os passos abaixo para executar o projeto localmente.

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   Um gerenciador de pacotes Node, como `npm`.

### 2. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
npm install
```

### 3. Execute o Projeto Localmente

Com as dependências instaladas, basta executar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em **`http://localhost:3000`**. Não é necessário configurar nenhuma variável de ambiente para este modo de protótipo.

---

## ✨ Funcionalidades

-   **Painel do Passageiro**: Solicitação de corrida, visualização de motoristas e histórico.
-   **Painel do Motorista**: Visualização de solicitações, gerenciamento de status, perfil, histórico e registro de corridas manuais.
-   **Painel do Administrador**: Gerenciamento de usuários, verificação de documentos e monitoramento de conversas de suporte.
-   **Painel do Atendente**: Focado em suporte, com acesso a listas de usuários e painel de conversas.

---

## 🔮 Transição para Backend Real (PocketBase)

Embora o projeto rode localmente com um arquivo JSON, ele foi estruturado para ser facilmente migrado para um backend real com **PocketBase**.

A documentação para essa transição está incluída no projeto:
-   **`POCKETBASE_SETUP.md`**: Guia para hospedar um backend PocketBase no serviço gratuito PocketHost.
-   **`POCKETBASE_API.md`**: Detalhes sobre as coleções e regras de API necessárias.
-   **`ADMIN_SETUP.md`**: Como criar o primeiro usuário administrador no PocketBase.

Para ativar a conexão, você precisaria criar um arquivo `.env.local` e configurar a variável `NEXT_PUBLIC_POCKETBASE_URL` com a URL do seu servidor.
