# Guia de Configuração da API (PocketBase)

Este documento detalha as **coleções** e **regras de API** necessárias para o funcionamento correto do aplicativo. Use este guia para configurar seu backend no painel de administrador do PocketBase.

**URL do Admin (Exemplo):** `https://seu-servidor-pocketbase.com/_/` ou `https://seu-app.pockethost.io/_/`

---

## 1. Importação Automática (Recomendado)

A maneira mais fácil de configurar seu banco de dados é importar o schema completo de uma só vez.

1.  **Acesse seu Painel Admin do PocketBase.**
2.  No menu lateral, vá para **Settings > Import collections**.
3.  Clique em **Load from file** e selecione o arquivo `pocketbase_schema.json` que está na raiz deste projeto.
4.  Clique em **Import**.

Isso criará todas as coleções (`users`, `rides`, `chats`, etc.) com todos os campos necessários. O próximo passo é apenas revisar e aplicar as regras de API abaixo, pois elas não são importadas.

---

## 2. Configuração das Regras de API (Crucial)

Após importar as coleções, você **precisa** aplicar as regras de acesso manualmente para cada uma.

### Coleção: `users` (Auth)
*   **List rule:** `@request.auth.id != "" && role = "Motorista"`
*   **View rule:** `id = @request.auth.id || role != ""`
*   **Update rule:** `id = @request.auth.id || @request.auth.role = "Admin"`
*   **Delete rule:** `@request.auth.role = "Admin"`

### Coleção: `rides`
*   **List rule:** `@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
*   **View rule:** `@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
*   **Create rule:** `@request.auth.id != "" || passenger_anonymous_name != ""`
*   **Update rule:** `@request.auth.id != "" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = "Admin")`
*   **Delete rule:** `@request.auth.role = "Admin"`

### Coleção: `chats`
*   **List rule:** `participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
*   **View rule:** `participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
*   **Create rule:** `participants.id ?= @request.auth.id`
*   **Update rule:** `participants.id ?= @request.auth.id || @request.auth.role = "Admin"`
*   **Delete rule:** `@request.auth.role = "Admin"`

### Coleção: `messages`
*   **List rule:** `chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
*   **View rule:** `chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin"`
*   **Create rule:** `chat.participants.id ?= @request.auth.id`
*   **Update rule:** `@request.auth.role = "Admin"`
*   **Delete rule:** `@request.auth.role = "Admin"`

### Coleção: `driver_documents`
*   **List rule:** `@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")`
*   **View rule:** `@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")`
*   **Create rule:** `@request.auth.id != "" && driver = @request.auth.id`
*   **Update rule:** `@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")`
*   **Delete rule:** `@request.auth.role = "Admin"`

### Coleção: `driver_status_logs`
*   **List rule:** `@request.auth.role = "Admin"`
*   **View rule:** `@request.auth.role = "Admin"`
*   **Create rule:** `@request.auth.id != "" && @request.auth.role = "Motorista"`
*   **Update rule:** `""` (ninguém pode atualizar)
*   **Delete rule:** `""` (ninguém pode deletar)

---

Após salvar essas regras, o aplicativo estará pronto para funcionar
