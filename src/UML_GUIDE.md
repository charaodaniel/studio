# Guia para Criação de Diagrama UML (RideLink)

Este documento serve como um guia para a criação de diagramas UML, como o Diagrama de Classes, que representa a estrutura do banco de dados e as relações entre as entidades do aplicativo.

---

## 1. Diagrama de Classes

O Diagrama de Classes é a base para entender a estrutura de dados. Cada "Classe" abaixo representa uma coleção no nosso banco de dados PocketBase.

### Entidades (Classes)

1.  **User (Coleção `users`)**: Representa todos os tipos de usuários da plataforma.
2.  **Ride (Coleção `rides`)**: Representa uma corrida, desde a solicitação até a finalização.
3.  **Chat (Coleção `chats`)**: Representa uma conversa entre dois ou mais usuários.
4.  **Message (Coleção `messages`)**: Representa uma única mensagem dentro de um chat.
5.  **DriverDocument (Coleção `driver_documents`)**: Armazena os documentos enviados por um motorista.
6.  **DriverStatusLog (Coleção `driver_status_logs`)**: Registra as mudanças de status de um motorista (online, offline, etc.).

---

### Atributos e Relacionamentos

#### **Classe: User**
Representa um usuário (Passageiro, Motorista, Admin ou Atendente).

**Atributos:**
- `id`: String (PK)
- `name`: String
- `email`: String
- `avatar`: File
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
- `passenger_anonymous_name`: String
- `scheduled_for`: DateTime (Opcional)

**Relacionamentos:**
- **(passenger)** `1` Ride ------ `0..1` **User** (Um Ride tem um Passageiro opcional, para corridas anônimas)
- **(driver)** `1` Ride ------ `0..1` **User** (Um Ride tem um Motorista opcional, pois a corrida é atribuída depois)

---

#### **Classe: Chat**
Representa uma conversa.

**Atributos:**
- `id`: String (PK)
- `last_message`: String
- `updated`: DateTime

**Relacionamentos:**
- **(participants)** `1` Chat ------ `2..*` **User** (Um Chat tem 2 ou mais participantes)
- `1` Chat ------ `0..1` **Ride** (Um Chat pode estar associado a uma corrida específica)

---

#### **Classe: Message**
Representa uma mensagem.

**Atributos:**
- `id`: String (PK)
- `text`: String
- `created`: DateTime

**Relacionamentos:**
- `*` Message ------ `1` **Chat** (Muitas mensagens pertencem a um único Chat)
- **(sender)** `*` Message ------ `1` **User** (Muitas mensagens são enviadas por um único Usuário)

---

#### **Classe: DriverDocument**
Documentos do motorista.

**Atributos:**
- `id`: String (PK)
- `document_type`: String (`"CNH"`, `"CRLV"`, `"VEHICLE_PHOTO"`)
- `file`: File
- `is_verified`: Boolean

**Relacionamentos:**
- **(driver)** `*` DriverDocument ------ `1` **User** (Muitos documentos pertencem a um único Motorista)

---

#### **Classe: DriverStatusLog**
Logs de status do motorista.

**Atributos:**
- `id`: String (PK)
- `status`: String
- `created`: DateTime

**Relacionamentos:**
- **(driver)** `*` DriverStatusLog ------ `1` **User** (Muitos logs de status pertencem a um único Motorista)

---
## 2. Resumo Visual dos Relacionamentos

- `User` --1-- tem --0..*-- `Ride`s (como Passageiro)
- `User` --1-- tem --0..*-- `Ride`s (como Motorista)
- `User` --*-- participa de --0..*-- `Chat`s
- `User` --1-- envia --0..*-- `Message`s
- `User` (Motorista) --1-- tem --0..*-- `DriverDocument`s
- `User` (Motorista) --1-- tem --0..*-- `DriverStatusLog`s

- `Ride` --1-- pode ter --0..1-- `Chat`

- `Chat` --1-- contém --0..*-- `Message`s

Use este guia como base para desenhar seu diagrama em uma ferramenta de modelagem UML de sua preferência.