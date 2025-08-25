# Guia de Schema e Regras de API - PocketBase

Este documento é a referência técnica completa para configurar manualmente o banco de dados no PocketBase. Siga estes passos para garantir que o aplicativo funcione corretamente.

**URL da API (Exemplo):** `https://seu-dominio.com`

---

## Passo a Passo da Configuração Manual

Para cada coleção listada abaixo (`users`, `rides`, `messages`, etc.), siga estes passos no seu painel de administrador do PocketBase:

1.  **Acesse a Coleção**: Clique na coleção no menu lateral. Se ela não existir, crie uma com o nome exato.
2.  **Edite a Coleção**: Clique em **"Edit collection"**.
3.  **Adicione os Campos (Schema)**:
    *   Na aba **"Schema"**, clique em **"+ New field"** para cada campo que estiver faltando na sua coleção.
    *   Use os detalhes exatos (Nome, Tipo) fornecidos abaixo. A maioria das opções pode ser mantida como padrão, a menos que especificado.
4.  **Aplique as Regras de API**:
    *   Vá para a aba **"API Rules"**.
    *   Copie e cole as regras (`List rule`, `View rule`, etc.) exatamente como estão listadas abaixo.
    *   **Importante**: Aplique as regras de API **depois** de ter adicionado todos os campos da coleção para evitar erros de validação.
5.  **Salve as Alterações**.

---

### 1. Coleção: `users` (Coleção de Autenticação)

Esta é a coleção de usuários padrão do PocketBase (`_pb_users_auth_`). Você só precisa adicionar os campos que faltam.

**Nome da Coleção:** `users`

#### Campos a Adicionar/Verificar:

| Nome do Campo            | Tipo       | Opções (se necessário)                                      |
| ------------------------ | ---------- | ----------------------------------------------------------- |
| `name`                   | `text`     | -                                                           |
| `avatar`                 | `file`     | Mime Types: `image/jpeg`, `image/png`, `image/webp`         |
| `phone`                  | `text`     | -                                                           |
| `role`                   | `select`   | Values: `Passageiro`, `Motorista`, `Atendente`, `Admin`     |
| `driver_status`          | `select`   | Values: `online`, `offline`, `urban-trip`, `rural-trip`     |
| `driver_vehicle_model`   | `text`     | -                                                           |
| `driver_vehicle_plate`   | `text`     | -                                                           |
| `driver_vehicle_photo`   | `file`     | Mime Types: `image/jpeg`, `image/png`, `image/webp`         |
| `driver_cnpj`            | `text`     | -                                                           |
| `driver_pix_key`         | `text`     | -                                                           |
| `driver_fare_type`       | `select`   | Values: `fixed`, `km`                                       |
| `driver_fixed_rate`      | `number`   | -                                                           |
| `driver_km_rate`         | `number`   | -                                                           |
| `driver_accepts_rural`   | `bool`     | -                                                           |
| `disabled`               | `bool`     | (Pode ser adicionado para desativar usuários)                |


#### Regras de API:

-   **List rule**: `@request.auth.id != ""`
-   **View rule**: `id = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
-   **Create rule**: `(deixe em branco)`
-   **Update rule**: `id = @request.auth.id || @request.auth.role = "Admin"`
-   **Delete rule**: `@request.auth.role = "Admin"`

---

### 2. Coleção: `rides`

**Nome da Coleção:** `rides`
**Tipo:** `base`

#### Campos a Adicionar:

| Nome do Campo           | Tipo       | Opções (se necessário)                                     |
| ----------------------- | ---------- | ---------------------------------------------------------- |
| `passenger`             | `relation` | collectionId: `_pb_users_auth_`, maxSelect: 1, required: true |
| `driver`                | `relation` | collectionId: `_pb_users_auth_`, maxSelect: 1                        |
| `origin_address`        | `text`     | required: true                                             |
| `destination_address`   | `text`     | required: true                                             |
| `status`                | `select`   | Values: `requested`, `accepted`, `in_progress`, `completed`, `canceled`, required: true |
| `fare`                  | `number`   | required: true                                             |
| `is_negotiated`         | `bool`     | required: true                                             |
| `started_by`            | `select`   | Values: `passenger`, `driver`, required: true             |

#### Regras de API:

-   **List rule**: `@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
-   **View rule**: `@request.auth.id != "" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Admin")`
-   **Create rule**: `@request.auth.id != ""`
-   **Update rule**: `@request.auth.id != "" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = "Admin")`
-   **Delete rule**: `@request.auth.role = "Admin"`

---

### 3. Coleção: `messages`

**Nome da Coleção:** `messages`
**Tipo:** `base`

#### Campos a Adicionar:

| Nome do Campo | Tipo       | Opções (se necessário)         |
| ------------- | ---------- | ------------------------------ |
| `ride`        | `relation` | collectionId: `rides`, maxSelect: 1, required: true |
| `sender`      | `relation` | collectionId: `_pb_users_auth_`, maxSelect: 1, required: true |
| `text`        | `text`     | required: true                 |

#### Regras de API:

-   **List rule**: `@request.auth.id != "" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
-   **View rule**: `@request.auth.id != "" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = "Admin")`
-   **Create rule**: `@request.auth.id != "" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id)`
-   **Update rule**: `@request.auth.role = "Admin"`
-   **Delete rule**: `@request.auth.role = "Admin"`

---

### 4. Coleção: `driver_documents`

**Nome da Coleção:** `driver_documents`
**Tipo:** `base`

#### Campos a Adicionar:

| Nome do Campo     | Tipo       | Opções (se necessário)         |
| ----------------- | ---------- | ------------------------------ |
| `driver`          | `relation` | collectionId: `_pb_users_auth_`, maxSelect: 1, required: true |
| `document_type`   | `select`   | Values: `CNH`, `CRLV`, required: true |
| `file`            | `file`     | maxSelect: 1, required: true   |
| `is_verified`     | `bool`     | -                              |

#### Regras de API:

-   **List rule**: `@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")`
-   **View rule**: `@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")`
-   **Create rule**: `@request.auth.id != "" && driver = @request.auth.id`
-   **Update rule**: `@request.auth.id != "" && (driver = @request.auth.id || @request.auth.role = "Admin")`
-   **Delete rule**: `@request.auth.role = "Admin"`

---

### 5. Coleção: `driver_status_logs`

**Nome da Coleção:** `driver_status_logs`
**Tipo:** `base`

#### Campos a Adicionar:

| Nome do Campo | Tipo       | Opções (se necessário)         |
| ------------- | ---------- | ------------------------------ |
| `driver`      | `relation` | collectionId:`_pb_users_auth_`,maxSelect: 1, required: true |
| `status`      | `text`     | required: true                 |

#### Regras de API:

-   **List rule**: `@request.auth.role = "Admin"`
-   **View rule**: `@request.auth.role = "Admin"`
-   **Create rule**: `@request.auth.id != ""`
-   **Update rule**: `""` (Ninguém pode atualizar)
-   **Delete rule**: `""` (Ninguém pode deletar)
