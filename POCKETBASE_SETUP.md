# Guia de Configuração do Backend PocketBase

Para que este aplicativo possa se conectar ao seu servidor PocketBase, é essencial configurar o CORS (Cross-Origin Resource Sharing) corretamente.

## Problema: Erro de Conexão no App Online (mas funciona localmente)

Se o aplicativo mostra um erro de conexão ("Falha ao conectar na API", "Erro de rede", ou "CORS") quando você o acessa pelo link do Firebase Studio, mas funciona no seu computador local, o problema é 99% das vezes o CORS ou uma configuração incorreta de proxy (Nginx).

### Solução 1: Adicionar os Domínios à Lista de Permissões (CORS)

Você precisa dizer ao seu servidor PocketBase para aceitar requisições vindas dos domínios onde o aplicativo está hospedado.

1.  **Acesse o Admin UI do seu PocketBase:**
    Abra `http://62.72.9.108:8090/_/` no seu navegador.

2.  **Vá para as Configurações:**
    No menu lateral, clique em **Settings** e depois em **Application**.

3.  **Adicione as Origens Permitidas ("Allowed Origins"):**
    No campo **Allowed Origins**, cole os endereços **exatos** dos seus domíniais do Firebase Studio (Vercel). É importante adicionar todos, um por linha.

    **Copie e cole a lista abaixo:**
    ```
    https://studio-git-main-daniel-charao-machados-projects.vercel.app
    https://studio-dvqom9ok2-daniel-charao-machados-projects.vercel.app
    https://studio-tau-umber.vercel.app
    ```
    
    Se você também acessa o app localmente durante o desenvolvimento, adicione a URL local também (geralmente `http://localhost:9002` ou `http://localhost:3000`).

4.  **Salve as alterações.**

Após salvar, o erro de conexão no ambiente online deverá ser resolvido.

---

### Solução 2: Corrigir Configuração do Proxy Reverso Nginx

Se você configurou o Nginx como proxy reverso e está recebendo erros de rede (`net::ERR_FAILED`) ou 404 da API, o problema geralmente está na diretiva `proxy_pass`. É crucial que o endereço no `proxy_pass` **NÃO** termine com uma barra `/`.

**Exemplo de configuração para o Nginx:**

Verifique seu arquivo de configuração do Nginx (ex: `/etc/nginx/sites-available/default`). A seção do proxy para a API deve se parecer com isto:

```nginx
location /api/ {
    # INCORRETO: proxy_pass http://127.0.0.1:8090/; (Com a barra no final)
    
    # CORRETO (sem a barra no final):
    proxy_pass http://127.0.0.1:8090;

    # Headers importantes para o proxy reverso funcionar corretamente
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_redirect off;
}
```
Depois de fazer a alteração no arquivo, recarregue as configurações do Nginx com o comando: `sudo systemctl reload nginx`.

Essa correção garante que o Nginx repasse as requisições para o PocketBase corretamente.
