# Guia: Como Criar o Primeiro Administrador (PocketBase)

Para gerenciar sua aplicação, o primeiro passo é criar uma conta de **Administrador**. Diferente dos outros usuários, a criação do primeiro admin é um processo manual feito diretamente no painel do PocketBase. Isso garante que apenas você tenha o controle inicial da plataforma.

Este guia mostra como fazer isso.

---

## Passo a Passo

### 1. Acesse o Painel do PocketBase

1.  Vá para a URL do seu backend e acesse o painel de administração. O link geralmente termina com `/_/`.
    *   **Exemplo:** `https://seu-app.pockethost.io/_/`
2.  Na primeira vez que você acessa, o PocketBase pedirá para criar uma conta de administrador para o próprio painel. Crie essa conta.

### 2. Crie o Usuário na Coleção `users`

Agora, vamos criar o usuário do aplicativo que terá o perfil de "Admin".

1.  Dentro do painel do PocketBase, vá para **Collections > users**.
2.  Clique no botão **+ New record**.

    ![Botão New Record](https://placehold.co/400x150/E3F2FD/1E3A8A?text=Botão+New+Record)

3.  Preencha os campos essenciais:
    *   **email**: `daniel.kokynhw@gmail.com`
    *   **password**: `123456789`
    *   **passwordConfirm**: `123456789`
    *   **name**: `Daniel`
    *   **phone**: `55996393353`
    *   **role**: Clique no campo, digite `Admin` e selecione-o na lista.

4.  Clique em **Create**.

### 3. Faça Login e Crie Outros Usuários

Pronto! Seu administrador está criado.

1.  Acesse seu aplicativo.
2.  Use o formulário de **"Acesso Administrativo"** para fazer login com o email e a senha que você acabou de criar.
3.  Uma vez logado, navegue até o painel administrativo, onde você poderá usar a interface para adicionar facilmente outros usuários de teste (Passageiros, Motoristas, etc.) sem precisar repetir este processo manual.