# Documentação da API e Schema do Banco de Dados - PocketBase

Este documento serve como guia para a configuração do backend no PocketBase.

**URL da API:** `https://mobmv.shop`

---

## Configuração Rápida via Importação

A maneira mais fácil e recomendada de configurar as coleções é importar o arquivo de schema JSON. Isso elimina a necessidade de criação manual e garante que todos os campos e regras estejam corretos.

### Passos para Importar:

1.  **Faça o Download do Schema:**
    -   Baixe o arquivo `pocketbase_schema.json` que está na raiz deste projeto.

2.  **Acesse seu Painel PocketBase:**
    -   Faça login no seu painel administrativo (ex: `https://mobmv.shop/_/`).

3.  **Vá para a Seção de Importação:**
    -   No menu lateral, clique em **Settings > Import collections**.

4.  **Importe o Arquivo:**
    -   Clique no botão **"Load from JSON"** e selecione o arquivo `pocketbase_schema.json` que você baixou.
    -   Confirme a importação.

Isso irá criar e configurar automaticamente todas as coleções: `users` (com todos os campos personalizados), `rides`, `messages`, `driver_documents`, e `driver_status_logs`.
