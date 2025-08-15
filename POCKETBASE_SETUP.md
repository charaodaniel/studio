# Guia de Configuração do Backend PocketBase

Para que esta aplicação frontend consiga se conectar com sucesso ao seu backend PocketBase, é crucial configurar o CORS (Cross-Origin Resource Sharing) corretamente. Siga os passos abaixo para resolver erros de conexão.

## O Que é CORS e Por Que é Importante?

CORS é um mecanismo de segurança que os navegadores usam para impedir que um site faça requisições para um domínio diferente. Por padrão, o PocketBase bloqueia essas requisições. Precisamos dizer a ele para aceitar requisições vindas da nossa aplicação. **Se isso não for feito, você verá erros como "Failed to fetch" no frontend.**

## Passo a Passo para Configurar o CORS

1.  **Acesse o Painel de Administração do PocketBase:**
    *   Abra seu navegador e vá para a URL do seu painel de administrador. Baseado na sua configuração, é:
    *   `http://62.72.9.108:8090/_/`

2.  **Faça Login:**
    *   Entre com seu email e senha de administrador.

3.  **Encontre as Configurações da Aplicação:**
    *   No menu lateral esquerdo, clique em **Settings** (Configurações).
    *   Procure por uma seção chamada **Application** ou similar.

4.  **Adicione a URL ao Campo "Allowed Origins":**
    *   Dentro das configurações da aplicação, procure pelo campo de texto chamado **Allowed Origins** (Origens Permitidas).
    *   Neste campo, digite um asterisco (`*`).
    *   ```
        *
        ```
    *   **Importante:** Usar o `*` (asterisco) permite a conexão de **qualquer** origem. Isso é ideal para o ambiente de desenvolvimento, pois resolve o problema de conexão imediatamente.
    *   **Para Produção:** Quando for hospedar sua aplicação em um domínio real (ex: `https://meu-app-incrivel.com`), você deve substituir o `*` por essa URL específica para manter a segurança.

5.  **Salve as Alterações:**
    *   Clique no botão **Save changes** no canto superior direito para aplicar a nova configuração.

Após salvar, volte para a [página do desenvolvedor](/admin/developer) da sua aplicação e tente o teste de conexão novamente. O erro de CORS deve ser resolvido!