# Guia de Configuração da API (PocketBase)

Este documento detalha as **coleções** e **regras de API** necessárias para o funcionamento correto do aplicativo. Use este guia para configurar seu backend no painel de administrador do PocketBase.

**URL do Admin (Exemplo):** `https://mobmv.shop/_/`

---

## 1. Coleção: `users` (Auth)

Acesse a coleção `users` e clique em **"Edit collection"**. Vá para a aba **"API Rules"** e aplique as seguintes regras. Os campos desta coleção já são criados por padrão pelo PocketBase, mas adicione os campos personalizados do arquivo `pocketbase_schema.json`.

#### **Regras de API**

*   **View rule:**
    ```js
    id = @request.auth.id || name != ""
    ```
    *Permite que o nome e avatar de um usuário sejam vistos por outros, o que é necessário para o histórico de corridas e chats.*

*   **Update rule:**
    ```js
    id = @request.auth.id || @request.auth.role = "Admin"
    ```
    *Permite que um usuário edite seu próprio perfil, ou que um admin edite qualquer perfil.*

---

## 2. Coleção: `rides`

Acesse a coleção `rides` e clique em **"Edit collection"**. Adicione os seguintes campos ao schema para garantir a ordenação correta do histórico:

1.  **`created`**:
    *   Tipo: `Date`
    *   No painel do PocketBase, marque a opção para preencher este campo automaticamente na criação do registro.
2.  **`updated`**:
    *   Tipo: `Date`
    *   No painel do PocketBase, marque a opção para preencher este campo automaticamente na criação e atualização do registro.

Vá para a aba **"API Rules"** e aplique as seguintes regras.

#### **Regras de API**

*   **List rule:**
    ```js
    @request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")
    ```
    *Permite que um usuário liste apenas as corridas nas quais ele é passageiro ou motorista, ou se for Admin/Atendente.*

*   **View rule:**
    ```js
    @request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")
    ```
    *Permite a visualização dos detalhes de uma corrida sob as mesmas condições da `List rule`.*

---

## 3. Coleção: `chats` (Nova)

Crie uma **nova coleção** chamada `chats` (tipo "Base"). Adicione os campos abaixo e depois aplique as regras de API.

#### **Campos (Schema)**
1.  **`participants`**:
    *   Tipo: `Relation`
    *   Coleção Relacionada: `users`
    *   Max Select: `2`
    *   Required: `Não`
2.  **`ride`**:
    *   Tipo: `Relation`
    *   Coleção Relacionada: `rides`
    *   Required: `Não`
3.  **`last_message`**:
    *   Tipo: `Text`
    *   Required: `Não`

#### **Regras de API**
*   **List rule:**
    ```js
    participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"
    ```
    *Permite listar apenas os chats dos quais o usuário atual é participante, ou se for Admin/Atendente.*

*   **View rule:**
    ```js
    participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"
    ```
    *Permite ver os detalhes de um chat se o usuário atual for um participante, ou se for Admin/Atendente.*

*   **Create rule:**
    ```js
    participants.id ?= @request.auth.id
    ```
    *Permite que um usuário crie um chat apenas se ele mesmo for um dos participantes.*

*   **Update rule:**
    ```js
    participants.id ?= @request.auth.id || @request.auth.role = "Admin"
    ```
    *Permite que um participante ou um admin atualize um chat (ex: última mensagem).*

*   **Delete rule:**
    ```js
    @request.auth.role = "Admin"
    ```
    *Permite que apenas admins deletem chats.*

---

## 4. Coleção: `messages`

Crie uma **nova coleção** chamada `messages` (tipo "Base"). Adicione os campos abaixo e depois aplique as regras de API.

#### **Campos (Schema)**
1.  **`chat`**:
    *   Tipo: `Relation`
    *   Coleção Relacionada: `chats`
    *   Cascade Delete: `Sim` (para apagar as mensagens se o chat for deletado)
    *   Required: `Não`
2.  **`sender`**:
    *   Tipo: `Relation`
    *   Coleção Relacionada: `users`
    *   Required: `Não`
3.  **`text`**:
    *   Tipo: `Text`
    *   Required: `Não`

#### **Regras de API**
*   **List rule:**
    ```js
    chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"
    ```
    *Permite listar mensagens de um chat se o usuário atual for um participante, ou se for Admin/Atendente.*

*   **View rule:**
    ```js
    chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin"
    ```
    *Permite ver uma mensagem individual se o usuário for um participante do chat ou um Admin.*

*   **Create rule:**
    ```js
    chat.participants.id ?= @request.auth.id
    ```
    *Permite que um usuário crie uma mensagem apenas se for um participante do chat.*

*   **Update rule:**
    ```js
    @request.auth.role = "Admin"
    ```
    *Permite que apenas admins editem mensagens (para moderação).*

*   **Delete rule:**
    ```js
    @request.auth.role = "Admin"
    ```
    *Permite que apenas admins deletem mensagens.*

---

Após salvar essas coleções e regras, os problemas de permissão e carregamento do histórico e do chat serão resolvidos.
