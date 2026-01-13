# Guia para Criação de Diagrama UML (CEOLIN)

Este documento serve como um guia para a criação de diagramas UML, como o Diagrama de Classes, que representa a estrutura de dados e as relações entre as entidades do aplicativo.

---

## 1. Diagrama de Classes

O Diagrama de Classes é a base para entender a estrutura de dados. Cada "Classe" abaixo representa um tipo de objeto no nosso "banco de dados" (`src/database/banco.json`).

### Entidades (Classes)

1.  **User**: Representa todos os tipos de usuários da plataforma.
2.  **Ride**: Representa uma corrida, desde a solicitação até a finalização.
3.  **Chat**: Representa uma conversa entre dois ou mais usuários.
4.  **Message**: Representa uma única mensagem dentro de um chat.
5.  **DriverDocument**: Armazena os documentos enviados por um motorista.
6.  **DriverStatusLog**: Registra as mudanças de status de um motorista (online, offline, etc.).

---

### Atributos e Relacionamentos

#### **Classe: User**
Representa um usuário (Passageiro, Motorista, Admin ou Atendente).

**Atributos:**
- `id`: String (PK)
- `name`: String
- `email`: String
- `avatar`: String (Data URI)
- `phone`: String
- `role`: Array de Strings (`"Passageiro"`, `"Motorista"`, `"Admin"`, `"Atendente"`)
- `driver_status`: String (`"online"`, `"offline"`, `"urban-trip"`, `"rural-trip"`)
- `driver_vehicle_model`: String
- `driver_vehicle_plate`: String
- `driver_cnpj`: String
- `driver_pix_key`: String
- `driver_fare_type`: String (`"fixed"`, `"km"`)
- `driver_fixed_rate`: Number
- `driver_km_rate`: Number
- `driver_accepts_rural`: Boolean
- `disabled`: Boolean
- `password_placeholder`: String (Apenas para prototipagem)

---

#### **Classe: Ride**
Representa uma única corrida.

**Atributos:**
- `id`: String (PK)
- `origin_address`: String
- `destination_address`: String
- `status`: String (`"requested"`, `"accepted"`, `"in_progress"`, `"completed"`, `"canceled"`)
- `fare`: Number
- `is_negotiated`: Boolean
- `started_by`: String (`"passenger"`, `"driver"`)
- `passenger_anonymous_name`: String (Opcional)
- `scheduled_for`: DateTime (String ISO, Opcional)
- `created`: DateTime (String ISO)

**Relacionamentos:**
- **(passenger)** `1` Ride ------ `0..1` **User** (Um Ride tem um Passageiro, identificado por `passenger: id`)
- **(driver)** `1` Ride ------ `1` **User** (Um Ride tem um Motorista, identificado por `driver: id`)

---

#### **Classe: Chat**
Representa uma conversa.

**Atributos:**
- `id`: String (PK)
- `last_message`: String
- `updated`: DateTime (String ISO)

**Relacionamentos:**
- **(participants)** `1` Chat ------ `2..*` **User** (Um Chat tem 2 ou mais participantes, via um array de IDs)
- `1` Chat ------ `0..1` **Ride** (Um Chat pode estar associado a uma corrida, via `ride: id`)

---

#### **Classe: Message**
Representa uma mensagem.

**Atributos:**
- `id`: String (PK)
- `text`: String
- `created`: DateTime (String ISO)

**Relacionamentos:**
- `*` Message ------ `1` **Chat** (Muitas mensagens pertencem a um único Chat, via `chat: id`)
- **(sender)** `*` Message ------ `1` **User** (Muitas mensagens são enviadas por um único Usuário, via `sender: id`)

---

#### **Classe: DriverDocument**
Documentos do motorista.

**Atributos:**
- `id`: String (PK)
- `document_type`: String (`"CNH"`, `"CRLV"`, `"VEHICLE_PHOTO"`)
- `file`: String (Data URI)
- `is_verified`: Boolean

**Relacionamentos:**
- **(driver)** `*` DriverDocument ------ `1` **User** (Muitos documentos pertencem a um único Motorista, via `driver: id`)

---

## 2. Resumo Visual dos Relacionamentos

- `User` --1-- tem --0..*-- `Ride`s (como Passageiro)
- `User` --1-- tem --0..*-- `Ride`s (como Motorista)
- `User` --*-- participa de --0..*-- `Chat`s
- `User` --1-- envia --0..*-- `Message`s
- `User` (Motorista) --1-- tem --0..*-- `DriverDocument`s

- `Ride` --1-- pode ter --0..1-- `Chat`

- `Chat` --1-- contém --0..*-- `Message`s

Use este guia como base para desenhar seu diagrama em uma ferramenta de modelagem UML de sua preferência.
