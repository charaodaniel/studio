# Guia de Setup do Backend (PocketHost)

Este guia detalha o passo a passo para configurar e hospedar seu backend **PocketBase** de forma gratuita usando o serviço **PocketHost.io**. Isso elimina a necessidade de gerenciar um servidor próprio e simplifica a implantação.

---

## 1. Crie uma Conta no PocketHost

1.  Acesse [**PocketHost.io**](https://pockethost.io/).
2.  Clique em **"Sign in with GitHub"** para criar ou acessar sua conta. Você precisará autorizar o PocketHost a acessar sua conta do GitHub.

## 2. Gere um Token de Acesso no GitHub

O PocketHost precisa de um token para criar um repositório onde os dados do seu backend serão salvos.

1.  Siga o guia detalhado em `GITHUB_TOKEN_GUIDE.md` para gerar um **Token de Acesso Pessoal (Clássico)**.
2.  **Copie o token gerado.** Você precisará dele no próximo passo.

## 3. Crie uma Nova Instância (Pocket)

1.  No painel do PocketHost, clique em **"+ New Pocket"**.
2.  Preencha o formulário:
    *   **Name:** Dê um nome único para o seu backend (ex: `ceolin-mobilidade`). Este nome fará parte da sua URL.
    *   **GitHub Token:** **Cole o token** que você gerou no passo anterior.
    *   **Region:** Escolha a região mais próxima de você ou de seus usuários (ex: `America/Sao_Paulo`).
    *   **Version:** Mantenha como `latest`.
3.  Clique em **"Create"**.

    O PocketHost levará alguns minutos para provisionar seu servidor. Seja paciente.

## 4. Obtenha a URL da sua API

1.  Após a criação, sua nova instância aparecerá no painel.
2.  **Copie a URL** exibida no card da sua instância. Ela será algo como:
    `https://ceolin-mobilidade.pockethost.io`

    ![Copiar URL do PocketHost](https://placehold.co/600x200/E3F2FD/1E3A8A?text=Copie+a+URL+da+sua+instância)

3.  **Esta é a URL do seu backend.** Guarde-a para usar nas variáveis de ambiente do seu projeto.

## 5. Configure as Variáveis de Ambiente

Agora, informe ao seu aplicativo Next.js onde o backend está.

1.  Na raiz do seu projeto, crie um arquivo chamado `.env.local`.
2.  Adicione a seguinte linha, substituindo pela sua URL:

    ```bash
    # .env.local
    NEXT_PUBLIC_POCKETBASE_URL="https://sua-instancia.pockethost.io"
    ```

## 6. Configure o Banco de Dados no PocketBase

Com o backend no ar, você precisa configurar as tabelas (coleções) e as regras de segurança.

1.  Acesse o painel de administrador do seu PocketBase, que fica em:
    `https://sua-instancia.pockethost.io/_/`
2.  Siga as instruções detalhadas no arquivo `POCKETBASE_API.md` para:
    *   Importar o schema de coleções.
    *   Aplicar as regras da API.

---

Após seguir todos esses passos, seu backend estará configurado e pronto para ser usado pelo aplicativo.
