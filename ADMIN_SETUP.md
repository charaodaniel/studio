# Guia: Como Criar o Primeiro Administrador (Firebase)

Para gerenciar sua aplicação, o primeiro passo é criar uma conta de **Administrador**. Diferente dos outros usuários, a criação do primeiro admin é um processo manual feito diretamente no painel do Firebase. Isso garante que apenas você tenha o controle inicial da plataforma.

Este guia mostra como fazer isso.

---

## Passo a Passo

### 1. Crie o Usuário na Autenticação Firebase

1.  Acesse o [**Firebase Console**](https://console.firebase.google.com/) e navegue até o seu projeto.
2.  No menu lateral (seção **Build**), clique em **Authentication**.
3.  Vá para a aba **Users** e clique no botão **+ Add user**.

    ![Botão Add User](https://placehold.co/400x150/E3F2FD/1E3A8A?text=Botão+Add+User)

4.  Preencha os campos:
    *   **Email**: `seu-email-de-admin@exemplo.com`
    *   **Password**: Crie uma senha forte (mínimo 6 caracteres).
    *   Clique em **Add user**.

    O Firebase criará o usuário e atribuirá a ele um **User UID** (Identificador Único de Usuário). **Copie este UID**, pois você precisará dele na próxima etapa.

### 2. Crie o Documento do Administrador no Firestore

Agora, vamos dar a esse usuário o perfil de Administrador no banco de dados.

1.  No menu lateral (seção **Build**), clique em **Firestore Database**.
2.  Se a coleção `users` ainda não existir, clique em **+ Start collection** e nomeie-a como `users`.
3.  Clique em **+ Add document**.
4.  No campo **Document ID**, **cole o UID** que você copiou no passo anterior.
5.  Agora, adicione os seguintes campos ao documento:

| Field (Campo) | Type (Tipo) | Value (Valor) |
| :--- | :--- | :--- |
| `name` | `string` | Seu Nome de Admin |
| `email` | `string` | `seu-email-de-admin@exemplo.com` |
| `role` | `array` | `["Admin"]` (Escreva Admin e clique "Add") |
| `disabled` | `boolean` | `false` |
| `createdAt` | `timestamp` | Escolha a data e hora atuais |
| `uid` | `string` | Cole o mesmo UID novamente |

6.  Clique em **Save**.

### 3. Faça Login e Crie Outros Usuários

Pronto! Seu administrador está criado.

1.  Acesse seu aplicativo.
2.  Use o formulário de **"Acesso Administrativo"** para fazer login com o email e a senha que você acabou de criar.
3.  Uma vez logado, navegue até o painel administrativo, onde você poderá usar a interface para adicionar facilmente outros usuários de teste (Passageiros, Motoristas, etc.) sem precisar repetir este processo manual.
