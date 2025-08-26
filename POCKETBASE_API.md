# Guia de Alterações nas Regras de API (PocketBase)

Este documento lista apenas as **alterações necessárias** nas Regras de API para garantir que o aplicativo funcione corretamente. Aplique estas regras diretamente no seu painel de administrador do PocketBase.

**URL do Admin:** `https://mobmv.shop/_/` (exemplo)

---

## 1. Coleção: `users`

Acesse a coleção `users` e clique em **"Edit collection"**. Vá para a aba **"API Rules"** e aplique a seguinte regra:

#### **List rule**
*Cole esta regra no campo "List rule". Ela permite que motoristas sejam listados publicamente.*

```js
@request.auth.id != "" || @collection.users.role = "Motorista"
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

Após salvar essas duas regras, os problemas de permissão e carregamento do histórico serão resolvidos.
