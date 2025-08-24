# Documentação da API e Schema do Banco de Dados - PocketBase

Este documento serve como guia para a configuração do backend no PocketBase.

**URL da API:** `https://mobmv.shop`

---

## Passo a Passo para Configuração

Para garantir que o aplicativo funcione corretamente, você precisa configurar as coleções do banco de dados. O processo é feito em duas etapas para garantir a segurança e integridade dos seus dados de usuário.

### Etapa 1: Importar Coleções Não-Sistema

A maneira mais fácil de configurar as coleções de corridas, mensagens e documentos é importar um arquivo JSON.

1.  **Faça o Download do Schema:**
    *   Use o arquivo `pocketbase_schema.json` que está na raiz deste projeto.

2.  **Acesse seu Painel PocketBase:**
    *   Faça login no seu painel administrativo (ex: `https://mobmv.shop/_/`).

3.  **Vá para a Seção de Importação:**
    *   No menu lateral, clique em **Settings > Import collections**.

4.  **Importe o Arquivo:**
    *   Clique no botão **"Load from JSON"** e selecione o arquivo `pocketbase_schema.json` que você baixou.
    *   Confirme a importação. Isso irá criar as coleções: `rides`, `messages`, `driver_documents`, e `driver_status_logs`.

### Etapa 2: Configurar a Coleção `users` Manualmente

Como a coleção `users` já existe no seu sistema, vamos apenas adicionar os campos que faltam e ajustar as regras de acesso. **Isso preserva seus usuários existentes.**

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

4.  **Ajuste as Regras de Acesso:**
    Na mesma tela de edição da coleção `users`, vá para a aba **"API Rules"** e cole as seguintes regras:

    *   **List Rule**: `id = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
    *   **View Rule**: `id = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Atendente"`
    *   **Update Rule**: `id = @request.auth.id || @request.auth.role = "Admin"`
    *   **Delete Rule**: `@request.auth.role = "Admin"`
    
    > **Nota:** A regra de criação (Create Rule) pode ser deixada em branco para permitir o registro de novos usuários pelo formulário do app.

5.  Clique em **"Save changes"** para finalizar.

Com isso, seu backend estará totalmente configurado para funcionar com o aplicativo. Lembre-se de criar seu primeiro administrador seguindo o guia no arquivo `ADMIN_SETUP.md`.