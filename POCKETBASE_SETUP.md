# Guia de Configuração do Backend PocketBase

Para que seu aplicativo frontend (hospedado na Vercel, Netlify, etc.) possa se conectar ao seu servidor PocketBase, é essencial configurar o CORS (Cross-Origin Resource Sharing) e o seu proxy reverso (como Nginx) corretamente.

---

## Problema Comum #1: Erro de CORS no App Online

Se o aplicativo mostra um erro de conexão ("Falha ao conectar na API", "Erro de rede", ou "CORS") quando você o acessa por um link online (Vercel), o problema é quase sempre a configuração de CORS no seu PocketBase.

O navegador bloqueia requisições de um domínio (ex: `seu-app.vercel.app`) para outro (ex: `https://seu-servidor-pocketbase.com`) por segurança, a menos que o servidor da API permita explicitamente.

### Solução: Adicionar Domínios à Lista de Permissões (CORS)

Você precisa dizer ao seu servidor PocketBase para aceitar requisições vindas dos domínios onde o aplicativo está hospedado.

1.  **Acesse o Admin UI do seu PocketBase:**
    Abra o endereço do seu PocketBase (ex: `https://seu-servidor-pocketbase.com/_/`) no seu navegador.

2.  **Vá para as Configurações:**
    No menu lateral, clique em **Settings** e depois em **Application**.

3.  **Adicione as Origens Permitidas ("Allowed Origins"):**
    No campo **Allowed Origins**, cole os endereços **exatos** dos seus domínios da Vercel. É importante adicionar todos, um por linha.

    **Exemplos de URLs para adicionar:**
    ```
    http://localhost:9002
    https://seu-projeto.vercel.app
    https://seu-projeto-git-main-sua-conta.vercel.app
    https://seu-projeto-as8df9ad8-sua-conta.vercel.app
    ```
    
4.  **Salve as alterações.**

---

## Problema Comum #2: Tela do Nginx ou Erro 404

Se ao acessar `https://seu-servidor-pocketbase.com` você vê a tela de "Welcome to Nginx" ou se o aplicativo falha com erros **404 Not Found** em rotas como `/api/health` ou `/api/admins/auth-with-password`, o problema está na configuração do seu **proxy reverso**.

Isso significa que o Nginx está recebendo as requisições, mas não sabe que deve encaminhá-las para o serviço do PocketBase que está rodando em uma porta específica (geralmente `8090`).

### Solução: Configurar o Proxy Reverso (Nginx) Corretamente

Você precisa editar o arquivo de configuração do seu site no Nginx (geralmente em `/etc/nginx/sites-available/seu-dominio`) para incluir um bloco `location` que encaminhe o tráfego da API.

**Exemplo de Configuração Essencial para Nginx:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seu-servidor-pocketbase.com; # Substitua pelo seu domínio

    # Redireciona HTTP para HTTPS (Recomendado)
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name seu-servidor-pocketbase.com; # Substitua pelo seu domínio

    # Configurações de SSL (Caminhos dos seus certificados)
    # ssl_certificate /etc/letsencrypt/live/seu-dominio/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seu-dominio/privkey.pem;

    # Bloco mais importante: encaminha todas as requisições /api/ para o PocketBase
    location /api/ {
        # O PocketBase geralmente roda em localhost na porta 8090
        proxy_pass http://127.0.0.1:8090; 
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_redirect off;
    }

    # Bloco para o painel de administração (_/)
    location /_/ {
        proxy_pass http://127.0.0.1:8090;
        # ... (repita as mesmas configurações de proxy do bloco /api/)
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_redirect off;
    }

    # Opcional: Se você quiser servir algo na raiz (/)
    # location / {
    #     # Ex: mostra uma página estática ou a tela do Nginx
    #     try_files $uri $uri/ =404; 
    # }
}
```

**Pontos Chave:**

*   **`location /api/`**: Este bloco captura todas as chamadas da API do aplicativo.
*   **`proxy_pass http://127.0.0.1:8090;`**: Esta linha é o coração da configuração. Ela diz ao Nginx: "envie tudo que chegar em `/api/` para o serviço que está rodando no endereço `http://127.0.0.1:8090`".
*   **`location /_/`**: É necessário um bloco separado para o painel de administração do PocketBase.

Após fazer essas alterações, reinicie o serviço do Nginx (`sudo systemctl restart nginx`) para que elas entrem em vigor.
