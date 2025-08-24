# Documentação da API e Schema do Banco de Dados - PocketBase

Este documento serve como guia para a configuração do backend no PocketBase.

**URL da API:** `https://mobmv.shop`

---

## Processo de Configuração Automatizado

Para garantir que o aplicativo funcione corretamente, criamos um script que automatiza toda a configuração do banco de dados. Isso elimina a necessidade de importação de JSON ou criação manual de coleções.

### Passo 1: Instale as Dependências do Projeto

Se você ainda não o fez, abra um terminal na pasta do projeto e instale todas as dependências necessárias.
```bash
pnpm install
```
Isso garantirá que a dependência `isomorphic-fetch`, necessária para o script, seja instalada.

### Passo 2: Configure o Script de Setup

1.  Abra o arquivo `src/scripts/setup-pocketbase.js` no seu editor de código.
2.  Localize a seção de **CONFIGURAÇÃO** no topo do arquivo.
3.  Preencha as três variáveis com os dados do **seu painel de administrador (Super-Admin)** do PocketBase:
    *   `POCKETBASE_URL`: A URL base do seu servidor (ex: `https://seu-dominio.com`).
    *   `POCKETBASE_ADMIN_EMAIL`: O email que você usa para fazer login no painel de admin.
    *   `POCKETBASE_ADMIN_PASSWORD`: A senha correspondente.

### Passo 3: Execute o Script

Com o arquivo configurado e salvo, execute o seguinte comando no seu terminal:

```bash
pnpm run setup:pb
```

O script irá se conectar ao seu PocketBase, criar todas as coleções necessárias (`rides`, `messages`, etc.), adicionar os campos personalizados à coleção `users`, e aplicar todas as regras de API.

**O que esperar no terminal:**
O script mostrará o progresso, indicando quais coleções estão sendo criadas ou puladas (se já existirem) e se a coleção `users` foi atualizada com sucesso.

Após a execução do script, seu backend estará totalmente configurado para funcionar com o aplicativo.
