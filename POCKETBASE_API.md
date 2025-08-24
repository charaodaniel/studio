# Documentação da API e Schema do Banco de Dados - PocketBase

Este documento serve como guia para a configuração do backend no PocketBase.

**URL da API:** `https://mobmv.shop`

---

## Processo de Configuração Automatizado

Para garantir que o aplicativo funcione corretamente, criamos um script em Python que automatiza toda a configuração do banco de dados. Isso elimina a necessidade de importação de JSON ou criação manual de coleções.

### Passo 1: Instale as Dependências do Projeto

Se você ainda não o fez, abra um terminal na pasta do projeto e instale todas as dependências necessárias.
```bash
pnpm install
```
Isso garantirá que as dependências do frontend sejam instaladas.

### Passo 2: Instale o Cliente Python do PocketBase

O script de setup usa uma biblioteca Python. Você precisa instalá-la globalmente ou em um ambiente virtual.
```bash
pip install pocketbase-client
```

### Passo 3: Configure o Script de Setup

1.  Abra o arquivo `src/scripts/setup_pocketbase.py` no seu editor de código.
2.  Localize a seção de **CONFIGURAÇÃO** no topo do arquivo.
3.  Preencha as três variáveis com os dados do **seu painel de administrador (Super-Admin)** do PocketBase:
    *   `POCKETBASE_URL`: A URL base do seu servidor (ex: `https://seu-dominio.com`). **Não adicione a parte `/_/` ou `/api/` no final.**
    *   `POCKETBASE_ADMIN_EMAIL`: O email que você usa para fazer login no painel de admin.
    *   `POCKETBASE_ADMIN_PASSWORD`: A senha correspondente.
    *   *Dica: Você também pode usar variáveis de ambiente para maior segurança.*

### Passo 4: Execute o Script

Com o arquivo configurado e salvo, execute o seguinte comando no seu terminal:

```bash
pnpm run setup:pb
```

O script irá se conectar ao seu PocketBase. Ele verificará cada coleção e cada campo, adicionando apenas o que estiver faltando e aplicando as regras de API corretas no final. Ele pode ser executado várias vezes com segurança, pois não irá duplicar coleções ou campos.

**O que esperar no terminal:**
O script mostrará o progresso, indicando quais coleções e campos estão sendo criados ou atualizados e se as regras de API foram aplicadas com sucesso.

Após a execução do script, seu backend estará totalmente configurado para funcionar com o aplicativo.
