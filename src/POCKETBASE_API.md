# Guia de Configuração da API (PocketBase)

Este documento detalha as **coleções** e **regras de API** necessárias para o funcionamento correto do aplicativo. Use este guia para configurar seu backend no painel de administrador do PocketBase.

**URL do Admin (Exemplo):** `https://seu-servidor-pocketbase.com/_/`

---

## 1. Coleção: `users` (Auth)

Acesse a coleção `users` e clique em **"Edit collection"**. Na aba "Schema", adicione todos os campos personalizados que estão no arquivo `pocketbase_schema.json` do projeto.

Depois, vá para a aba **"API Rules"** e aplique as seguintes regras.

#### **Regras de API**

*   **List rule:** `role = "Motorista"`
    *   **Motivo:** Permite que qualquer pessoa (logada ou não) possa listar os usuários que têm o perfil de "Motorista", essencial para o mapa e a seleção de motoristas na tela do passageiro.

*   **View rule:** `id = @request.auth.id || role != ""`
    *   **Motivo:** Permite que os dados públicos de um usuário (nome, avatar) sejam vistos por outros, necessário para o histórico de corridas, chats e para exibir os motoristas.

*   **Update rule:** `id = @request.auth.id || @request.auth.role = "Admin"`
    *   **Motivo:** Permite que um usuário edite seu próprio perfil, ou que um admin edite qualquer perfil.

---

## 2. Coleção: `rides`

Crie uma **nova coleção** chamada `rides`. Na aba "Schema", adicione todos os campos para esta coleção conforme o arquivo `pocketbase_schema.json`.

É **muito importante** configurar os campos `created` e `updated` para serem automáticos e evitar o erro "Invalid Date".

#### **Como Configurar `created` e `updated` para Auto-Date**

1.  **Acesse a coleção `rides`** e clique em **"Edit collection"**.
2.  **Clique na engrenagem (⚙️)** ao lado do campo `created`.
    ![Clique na Engrenagem](https://placehold.co/400x100/E3F2FD/1E3A8A?text=Clique+na+engrenagem+⚙️)
3.  No campo **"Type"**, mude de `Date` para `Auto-Date`.
    ![Mude para Auto-Date](https://placehold.co/400x150/E3F2FD/1E3A8A?text=Selecione+Auto-Date)
4.  Marque a opção **"On Create"**. Salve.
5.  Repita o processo para o campo `updated`: clique na engrenagem, mude o tipo para `Auto-Date`, e marque **ambas as opções**: **"On Create"** e **"On Update"**. Salve.

Após essa mudança, o servidor preencherá as datas automaticamente.

Vá para a aba **"API Rules"** e aplique as seguintes regras.

#### **Regras de API**

*   **List rule:** `@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
    *   **Motivo:** Permite que um usuário liste apenas as corridas nas quais ele é passageiro ou motorista, ou se for Admin/Atendente.

*   **View rule:** `@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
    *   **Motivo:** Permite a visualização dos detalhes de uma corrida sob as mesmas condições da `List rule`.

*   **Create rule:** `@request.auth.id != "" || passenger_anonymous_name != ""`
    *   **Motivo:** Permite que um usuário logado ou um usuário anônimo (corrida rápida) crie uma corrida.

*   **Update rule:** `@request.auth.id != "" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = "Admin")`
    *   **Motivo:** Permite que motorista ou passageiro atualizem o status da corrida (ex: aceitar, finalizar), e também que um admin possa editar.

---

## 3. Coleção: `chats`

Crie uma **nova coleção** chamada `chats`. Na aba "Schema", adicione os campos conforme o `pocketbase_schema.json`.

#### **Regras de API**
*   **List rule:** `participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
    *   **Motivo:** Permite listar apenas os chats dos quais o usuário atual é participante, ou se for Admin/Atendente.

*   **View rule:** `participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
    *   **Motivo:** Permite ver os detalhes de um chat se o usuário atual for um participante, ou se for Admin/Atendente.

*   **Create rule:** `participants.id ?= @request.auth.id`
    *   **Motivo:** Permite que um usuário crie um chat apenas se ele mesmo for um dos participantes.

*   **Update rule:** `participants.id ?= @request.auth.id || @request.auth.role = "Admin"`
    *   **Motivo:** Permite que um participante ou um admin atualize um chat (ex: última mensagem).

---

## 4. Coleção: `messages`

Crie uma **nova coleção** chamada `messages`. Na aba "Schema", adicione os campos conforme o `pocketbase_schema.json`. Ao criar o campo `chat` (relação), marque a opção **Cascade Delete** para apagar as mensagens se o chat for deletado.

#### **Regras de API**
*   **List rule:** `chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
    *   **Motivo:** Permite listar mensagens de um chat se o usuário atual for um participante, ou se for Admin/Atendente.

*   **View rule:** `chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin"`
    *   **Motivo:** Permite ver uma mensagem individual se o usuário for um participante do chat ou um Admin.

*   **Create rule:** `chat.participants.id ?= @request.auth.id`
    *   **Motivo:** Permite que um usuário crie uma mensagem apenas se for um participante do chat.

---

## 5. Outras Coleções

As coleções `driver_documents` e `driver_status_logs` também são necessárias. Importe o arquivo `pocketbase_schema.json` inteiro no painel do PocketBase (**Settings > Import collections**) para criar todas as coleções e campos de uma só vez, e depois apenas confira as regras de API acima.

Após salvar essas coleções e regras, o aplicativo estará pronto para funcionar corretamente.
