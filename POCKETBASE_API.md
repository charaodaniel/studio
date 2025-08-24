# Documentação da API e Schema do Banco de Dados - PocketBase

Este documento serve como guia para a configuração do backend no PocketBase, detalhando as coleções (schemas), os campos necessários e as regras de API para cada recurso do aplicativo CEOLIN Mobilidade Urbana.

**URL da API:** `https://mobmv.shop`

**IMPORTANTE:** As regras de acesso (`API Rules`) foram corrigidas para usar a sintaxe correta e mais segura do PocketBase para campos de relacionamento. Em vez de `campo ?= @request.auth.id`, o correto é `campo = @request.auth.id` quando o relacionamento não permite múltiplos valores. Use as regras abaixo.

---

## 1. Coleção: `users`

Armazena os dados de todos os tipos de usuários da plataforma.

**Nome da Coleção:** `users`
**Tipo:** `Auth`

### Campos

| Nome do Campo              | Tipo         | Obrigatório? | Descrição                                                                         |
| -------------------------- | ------------ | ------------ | --------------------------------------------------------------------------------- |
| `name`                     | `text`       | Sim          | Nome completo do usuário.                                                         |
| `email`                    | `email`      | Sim          | Email de login. Deve ser único.                                                   |
| `avatar`                   | `file`       | Não          | Foto de perfil do usuário (1 arquivo, máx 1MB).                                   |
| `phone`                    | `text`       | Não          | Número de telefone do usuário.                                                    |
| `role`                     | `select`     | Sim          | Perfil do usuário. **Opções:** `Passageiro`, `Motorista`, `Admin`, `Atendente`.   |
| **-- Campos de Motorista --** |              |              | (Preenchidos apenas se `role` = `Motorista`)                                      |
| `driver_status`            | `select`     | Não          | Status atual. **Opções:** `Online`, `Offline`, `Em Viagem (Urbano)`, `Em Viagem (Rural)`. |
| `driver_vehicle_model`     | `text`       | Não          | Ex: "Chevrolet Onix".                                                             |
| `driver_vehicle_plate`     | `text`       | Não          | Placa do veículo.                                                                 |
| `driver_vehicle_photo`     | `file`       | Não          | Foto do veículo do motorista (1 arquivo).                                         |
| `driver_cnpj`              | `text`       | Não          | CNPJ do motorista, se aplicável (MEI, etc.).                                      |
| `driver_pix_key`           | `text`       | Não          | Chave PIX para pagamentos.                                                        |
| `driver_fare_type`         | `select`     | Não          | **Opções:** `fixed` (Fixo), `km` (Por KM). Default: `fixed`.                       |
| `driver_fixed_rate`        | `number`     | Não          | Valor da tarifa fixa para corridas urbanas.                                       |
| `driver_km_rate`           | `number`     | Não          | Valor por KM rodado.                                                              |
| `driver_accepts_rural`     | `bool`       | Não          | Se aceita corridas para zona rural/intermunicipal. Default: `true`.               |

### Regras da API (API Rules)

```json
// Qualquer um pode criar um usuário (se registrar)
@api.create: ""

// Usuários logados podem ver a lista de outros usuários.
// Admins e Atendentes podem ver todos
@api.list: @request.auth.id != ""

// Usuários podem ver seu próprio perfil.
// Admins, Atendentes e Motoristas podem ver o perfil de outros (para chat e detalhes da corrida)
@api.view: @request.auth.id = id || @request.auth.role = "Admin" || @request.auth.role = "Atendente" || @request.auth.role = "Motorista"

// Usuários podem atualizar seu próprio perfil. Admins podem atualizar qualquer perfil.
@api.update: @request.auth.id = id || @request.auth.role = "Admin"

// Apenas Admins podem deletar usuários.
@api.delete: @request.auth.role = "Admin"
```

---

## 2. Coleção: `rides`

Armazena os dados de todas as corridas, desde a solicitação até a conclusão.

**Nome da Coleção:** `rides`
**Tipo:** `Base`

### Campos

| Nome do Campo     | Tipo       | Obrigatório? | Descrição                                                                                             |
| ----------------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| `passenger`       | `relation` | Sim          | Relacionamento com o usuário (`users`) que solicitou a corrida. (Não permitir múltiplos).             |
| `driver`          | `relation` | Não          | Relacionamento com o usuário (`users`) motorista. Preenchido quando a corrida é aceita.               |
| `origin_address`  | `text`     | Sim          | Endereço de partida.                                                                                  |
| `destination_address`| `text`     | Sim          | Endereço de destino.                                                                                  |
| `status`          | `select`   | Sim          | Status da corrida. **Opções:** `requested`, `accepted`, `in_progress`, `completed`, `canceled`.       |
| `fare`            | `number`   | Sim          | Valor final da corrida.                                                                               |
| `is_negotiated`   | `bool`     | Sim          | `true` se for corrida rural/intermunicipal (negociada), `false` se for urbana (fixa).                |
| `started_by`      | `select`   | Sim          | Quem iniciou. **Opções:** `passenger` (pelo app), `driver` (manual).                                    |

### Regras da API (API Rules)

```json
// Passageiros logados podem criar corridas. Admins podem criar (ex: suporte).
@api.create: @request.auth.role = "Passageiro" || @request.auth.role = "Admin"

// Passageiros, Motoristas e Atendentes podem ver corridas em que estão envolvidos. Admins podem ver todas.
@api.list: (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = "Atendente") || @request.auth.role = "Admin"
@api.view: (passenger = @request.auth.id || driver = @request.auth.id) || @request.auth.role = "Admin"

// Motoristas podem atualizar corridas para aceitá-las. Passageiros podem cancelar. Admins podem editar tudo.
@api.update: driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = "Admin"

// Admins podem deletar registros de corrida.
@api.delete: @request.auth.role = "Admin"
```

---

## 3. Coleção: `messages`

Armazena as mensagens dos chats entre passageiros e motoristas.

**Nome da Coleção:** `messages`
**Tipo:** `Base`

### Campos

| Nome do Campo | Tipo       | Obrigatório? | Descrição                                                                      |
| ------------- | ---------- | ------------ | ------------------------------------------------------------------------------ |
| `ride`        | `relation` | Sim          | Relacionamento com a corrida (`rides`) à qual a mensagem pertence.              |
| `sender`      | `relation` | Sim          | Relacionamento com o usuário (`users`) que enviou a mensagem.                  |
| `text`        | `text`     | Sim          | Conteúdo da mensagem.                                                          |

### Regras da API (API Rules)

```json
// Apenas o passageiro ou motorista da corrida associada podem criar mensagens.
@api.create: ride.passenger = @request.auth.id || ride.driver = @request.auth.id

// Apenas os participantes da corrida e administradores/atendentes podem ver as mensagens.
@api.list: (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = "Atendente") || @request.auth.role = "Admin"
@api.view: (ride.passenger = @request.auth.id || ride.driver = @request.auth.id) || @request.auth.role = "Admin"

// Mensagens não podem ser editadas ou deletadas pelos usuários.
@api.update: @request.auth.role = "Admin"
@api.delete: @request.auth.role = "Admin"
```

---

## 4. Coleção: `driver_documents`

Armazena os arquivos de documentos dos motoristas (CNH, CRLV).

**Nome da Coleção:** `driver_documents`
**Tipo:** `Base`

### Campos

| Nome do Campo   | Tipo       | Obrigatório? | Descrição                                                           |
| --------------- | ---------- | ------------ | ------------------------------------------------------------------- |
| `driver`        | `relation` | Sim          | Relacionamento com o usuário (`users`) motorista.                   |
| `document_type` | `select`   | Sim          | Tipo do documento. **Opções:** `CNH`, `CRLV`.                       |
| `file`          | `file`     | Sim          | O arquivo do documento (PDF ou Imagem).                             |
| `is_verified`   | `bool`     | Não          | Marcado como `true` por um Admin após verificação. Default: `false`.|

### Regras da API (API Rules)

```json
// O motorista pode enviar seus próprios documentos.
@api.create: driver = @request.auth.id

// O motorista pode ver seus próprios documentos. Admins podem ver todos.
@api.list: driver = @request.auth.id || @request.auth.role = "Admin"
@api.view: driver = @request.auth.id || @request.auth.role = "Admin"

// O motorista pode atualizar (reenviar) seus documentos. Admins podem atualizar (ex: para verificar).
@api.update: driver = @request.auth.id || @request.auth.role = "Admin"

// Apenas Admins podem deletar documentos.
@api.delete: @request.auth.role = "Admin"
```

---

## 5. Coleção: `driver_status_logs` (Para Auditoria)

Registra cada mudança de status de um motorista para fins de auditoria pelo Admin.

**Nome da Coleção:** `driver_status_logs`
**Tipo:** `Base`

### Campos

| Nome do Campo | Tipo       | Obrigatório? | Descrição                                       |
| ------------- | ---------- | ------------ | ----------------------------------------------- |
| `driver`      | `relation` | Sim          | Relacionamento com o usuário (`users`) motorista. |
| `status`      | `text`     | Sim          | O novo status (ex: "Online", "Offline").        |

### Regras da API (API Rules)

Esta coleção deve ser escrita apenas pelo backend ou por um usuário com privilégios de Admin para garantir a integridade dos logs.

```json
// Apenas Admins (ou o sistema via Admin API) podem criar logs.
@api.create: @request.auth.role = "Admin"

// Apenas Admins podem ver os logs.
@api.list: @request.auth.role = "Admin"
@api.view: @request.auth.role = "Admin"

// Logs são imutáveis.
@api.update: false
@api.delete: false
```

    