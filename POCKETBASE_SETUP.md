# Guia de Configuração do Backend PocketBase

Para que esta aplicação frontend consiga se conectar com sucesso ao seu backend PocketBase, é crucial configurar o CORS (Cross-Origin Resource Sharing) corretamente. Siga os passos abaixo.

## O Que é CORS?

CORS é um mecanismo de segurança que os navegadores usam para impedir que um site (Ex: `https://meu-app.com`) faça requisições para um domínio diferente (Ex: `http://62.72.9.108:8090`). Por padrão, o PocketBase bloqueia essas requisições. Precisamos dizer a ele para aceitar requisições vindas da nossa aplicação.

## Passo a Passo para Configurar o CORS

1.  **Acesse o Painel de Administração do PocketBase:**
    *   Abra seu navegador e vá para a URL do seu painel de administrador. Baseado na sua configuração, é:
    *   `http://62.72.9.108:8090/_/`

2.  **Faça Login:**
    *   Entre com seu email e senha de administrador que você configurou no PocketBase.

3.  **Vá para Configurações (Settings):**
    *   No menu lateral esquerdo, clique em **Settings**.

4.  **Acesse as Configurações de CORS:**
    *   Na tela de configurações, clique em **CORS**.

5.  **Adicione a URL do Frontend:**
    *   No campo **Allowed Origins** (Origens Permitidas), você precisa adicionar a URL exata da sua aplicação frontend.
    *   Para o ambiente de desenvolvimento do Firebase Studio, adicione a seguinte URL:
        ```
        *
        ```
    *   **Importante:** Usar o `*` (asterisco) permite a conexão de **qualquer** origem. Isso é ótimo para desenvolvimento e testes, pois resolve o problema de conexão imediatamente.
    *   **Para Produção:** Quando for hospedar sua aplicação em um domínio real (ex: `https://meu-app-incrivel.com`), você deve substituir o `*` por essa URL específica para manter a segurança.

6.  **Salve as Alterações:**
    *   Clique no botão **Save changes** no canto superior direito.

Após salvar, volte para a [página do desenvolvedor](/admin/developer) da sua aplicação e tente o teste de conexão novamente. O erro deve ser resolvido!
