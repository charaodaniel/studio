# Guia de Configuração do Backend PocketBase

Para que este aplicativo possa se conectar ao seu servidor PocketBase, é essencial configurar o CORS (Cross-Origin Resource Sharing) corretamente e, se estiver usando um proxy reverso como o Nginx, configurá-lo adequadamente.

## Problema Comum #1: Erro de CORS

Se o aplicativo mostra um erro de conexão ("Falha ao conectar na API", "Erro de rede", ou "CORS"), mas você consegue acessar o painel do PocketBase diretamente no seu navegador, o problema é quase certamente o CORS.

Por padrão, o PocketBase bloqueia requisições de outros domínios (como o do nosso aplicativo) por segurança.

### Solução: Adicionar "Allowed Origins"

Você precisa dizer ao seu PocketBase para aceitar requisições vindas do nosso aplicativo.

1.  **Acesse o Admin UI do seu PocketBase:**
    Abra `http://<seu_ip_aqui>:8090/_/` no seu navegador.

2.  **Vá para as Configurações:**
    No menu lateral, clique em **Settings** e depois em **Application**.

3.  **Adicione as Origens Permitidas:**
    No campo **Allowed Origins**, cole os endereços **exatos** dos seus domínios Vercel. É importante adicionar todos, um por linha.

    **Copie e cole a lista abaixo:**
    ```
    https://studio-git-main-daniel-charao-machados-projects.vercel.app
    https://studio-dvqom9ok2-daniel-charao-machados-projects.vercel.app
    ```
    
    Se você também acessa o app localmente durante o desenvolvimento, adicione a URL local (geralmente `http://localhost:9002` ou `http://localhost:3000`).

4.  **Salve as alterações.**

## Problema Comum #2: Erro 404 (Not Found) com Nginx

Se você configurou o Nginx como proxy reverso e está recebendo erros `404 Not Found` da API, o problema geralmente está na diretiva `proxy_pass`.

### Solução: Ajustar o `proxy_pass`

No seu arquivo de configuração do Nginx (ex: `/etc/nginx/sites-available/meu-app`), encontre o bloco de localização para a sua API.

**É crucial que o endereço no `proxy_pass` NÃO termine com uma barra `/`:**

```nginx
location /api/ {
    # INCORRETO: proxy_pass http://127.0.0.1:8090/;
    
    # CORRETO (sem a barra no final):
    proxy_pass http://127.0.0.1:8090;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Depois de fazer a alteração, recarregue o Nginx com `sudo systemctl reload nginx`.

---

### Exemplo de Guia para Produção

Para um ambiente de produção, a abordagem mais segura e robusta é usar um proxy reverso como o Nginx. Isso permite usar um domínio personalizado (ex: `api.seusite.com`) e configurar HTTPS facilmente.

O time do PocketBase providenciou um guia excelente sobre isso:
**Consulte o guia oficial aqui:** [https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy](https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy)
