# Guia de Alterações nas Regras de API (PocketBase)

Este documento lista apenas as **alterações necessárias** nas Regras de API para garantir que o aplicativo funcione corretamente. Aplique estas regras diretamente no seu painel de administrador do PocketBase.

**URL do Admin:** `https://mobmv.shop/_/` (exemplo)

---

## 1. Coleção: `users`

Acesse a coleção `users` e clique em **"Edit collection"**. Vá para a aba **"API Rules"** e aplique a seguinte regra:

#### **View rule**
*Cole esta regra no campo "View rule". Ela permite que o nome e avatar de um usuário seja visto por outros, o que é necessário para o histórico de corridas.*

```js
id = @request.auth.id || name != ""
```

---

## 2. Coleção: `rides`

Acesse a coleção `rides` e clique em **"Edit collection"**. Vá para a aba **"API Rules"** e aplique a seguinte regra:


#### **List rule**
*Cole esta regra no campo "List rule". Ela corrige o erro ao carregar o histórico do motorista.*

```js
@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")
```
---

## 3. Coleção: `chats` (Nova)

Acesse a coleção `chats` e clique em **"Edit collection"**. Vá para a aba **"API Rules"** e aplique as seguintes regras:

#### **List rule**
*Permite listar apenas os chats em que o usuário atual é um participante, ou se for Admin/Atendente.*
```js
participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"
```

#### **View rule**
*Permite ver os detalhes de um chat se o usuário atual for um participante, ou se for Admin/Atendente.*
```js
participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"
```

#### **Create rule**
*Permite que um usuário crie um chat apenas se ele mesmo for um dos participantes.*
```js
participants.id ?= @request.auth.id
```

#### **Update rule**
*Permite que um participante ou um admin atualize um chat (ex: última mensagem).*
```js
participants.id ?= @request.auth.id || @request.auth.role = "Admin"
```

#### **Delete rule**
*Permite que apenas admins deletem chats.*
```js
@request.auth.role = "Admin"
```

---

## 4. Coleção: `messages`

Acesse a coleção `messages` e clique em **"Edit collection"**. Vá para a aba **"API Rules"** e aplique as seguintes regras:

#### **List rule**
*Permite listar mensagens de um chat se o usuário atual for um participante, ou se for Admin/Atendente.*
```js
chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"
```

#### **View rule**
*Permite ver uma mensagem individual se o usuário for um participante do chat ou um Admin.*
```js
chat.participants.id ?= @request.auth.id || @request.auth.role = "Admin"
```

#### **Create rule**
*Permite que um usuário crie uma mensagem apenas se for um participante do chat.*
```js
chat.participants.id ?= @request.auth.id
```

#### **Update rule**
*Permite que apenas admins editem mensagens (para moderação).*
```js
@request.auth.role = "Admin"
```

#### **Delete rule**
*Permite que apenas admins deletem mensagens.*
```js
@request.auth.role = "Admin"
```

---

Após salvar essas regras, os problemas de permissão e carregamento do histórico e do chat serão resolvidos.
