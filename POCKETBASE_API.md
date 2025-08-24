# Documentação da API e Schema do Banco de Dados - PocketBase

Este documento serve como guia para a configuração do backend no PocketBase.

**URL da API:** `https://mobmv.shop`

---

## Passo a Passo para Configuração

Para garantir que o aplicativo funcione corretamente, você precisa configurar as coleções do banco de dados. O processo agora é feito em **duas etapas** para garantir a segurança e integridade dos seus dados de usuário.

### Etapa 1: Importar Coleções

1.  **Faça o Download do Schema:**
    *   Use o arquivo `pocketbase_schema.json` que está na raiz deste projeto.

2.  **Acesse seu Painel PocketBase:**
    *   Faça login no seu painel administrativo (ex: `https://mobmv.shop/_/`).

3.  **Vá para a Seção de Importação:**
    *   No menu lateral, clique em **Settings > Import collections**.

4.  **Importe o Arquivo:**
    *   Clique no botão **"Load from JSON"** e selecione o arquivo `pocketbase_schema.json` que você baixou.
    *   **IMPORTANTE:** Certifique-se de que a opção **"Mesclar" (Merge) esteja ATIVADA**.
    *   Confirme a importação. Isso irá criar as coleções `rides`, `messages`, `driver_documents`, e `driver_status_logs` e/ou atualizar as regras de API se elas já existirem.

### Etapa 2: Configurar a Coleção `users` Manualmente

Como a coleção `users` já existe no seu sistema, vamos apenas adicionar os campos que faltam. **Isso preserva seus usuários existentes.**

1.  No painel do PocketBase, clique na coleção **users**.
2.  Clique em **"Edit collection"**.

3.  **Adicione os Seguintes Campos:**
    Clique em **"+ Add field"** e adicione os campos abaixo, um por um:

    | Nome do Campo              | Tipo (`Type`) | Opções e Observações                                                                                                       |
    | -------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | **role**                   | `Select`      | **Obrigatório**. Valores: `Passageiro`, `Motorista`, `Admin`, `Atendente`.                                                 |
    | `phone`                    | `Text`        | Telefone do usuário.                                                                                                       |
    | `driver_status`            | `Select`      | Status do motorista. Valores: `Online`, `Offline`, `Em Viagem (Urbano)`, `Em Viagem (Interior/Intermunicipal)`.             |
    | `driver_vehicle_model`     | `Text`        | Modelo do veículo. Ex: "Chevrolet Onix".                                                                                   |
    | `driver_vehicle_plate`     | `Text`        | Placa do veículo. Ex: "BRA2E19".                                                                                           |
    | `driver_vehicle_photo`     | `File`        | Foto do veículo. Tipo `Image`.                                                                                             |
    | `driver_cnpj`              | `Text`        | CNPJ do motorista (opcional).                                                                                              |
    | `driver_pix_key`           | `Text`        | Chave PIX do motorista.                                                                                                    |
    | `driver_fare_type`         | `Select`      | Tipo de tarifa. Valores: `fixed`, `km`.                                                                                    |
    | `driver_fixed_rate`        | `Number`      | Valor da tarifa fixa.                                                                                                      |
    | `driver_km_rate`           | `Number`      | Valor da tarifa por km.                                                                                                    |
    | `driver_accepts_rural`     | `Bool`        | Se o motorista aceita corridas para o interior/rurais.                                                                     |

4.  **Adicione as Regras de API:**
    *   Ainda em **"Edit collection"**, vá para a aba **"API Rules"** e cole as regras abaixo:
    *   **List Rule**: `@request.auth.id != "" && (@request.auth.id = id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
    *   **View Rule**: `@request.auth.id != "" && (@request.auth.id = id || @request.auth.role = "Admin" || @request.auth.role = "Atendente")`
    *   **Update Rule**: `@request.auth.id != "" && (@request.auth.id = id || @request.auth.role = "Admin")`
    *   **Delete Rule**: `@request.auth.role = "Admin"`

Com isso, seu backend estará totalmente configurado para funcionar com o aplicativo. Lembre-se de criar seu primeiro administrador seguindo o guia no arquivo `ADMIN_SETUP.md`.
