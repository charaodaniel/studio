# Guia de Configuração do Backend PocketBase

Este guia aborda as configurações mais comuns e importantes para conectar seu aplicativo ao backend PocketBase, seja em um servidor próprio (VPS) ou usando uma solução gerenciada como o PocketHost.

---

## Solução Recomendada (Grátis e Fácil): PocketHost.io

Se você não quer gerenciar um servidor, a maneira mais simples de ter seu backend PocketBase no ar é usando o [**PocketHost.io**](https://pockethost.io/).

-   **Custo:** Gratuito.
-   **Configuração:** Nenhuma. Você cria uma "instância" e recebe uma URL pronta para usar.
-   **CORS e Proxy:** Já vem tudo configurado. Você não precisa se preocupar com os erros abaixo.

**Como usar:**
1.  Crie uma conta no PocketHost.
2.  Crie uma nova instância (ex: `seu-app-ceolin`).
3.  Copie a URL gerada (ex: `https://seu-app-ceolin.pockethost.io`).
4.  Cole essa URL na sua variável de ambiente `NEXT_PUBLIC_API_BASE` na Vercel e no seu arquivo `.env.local`.
5.  Pronto! Seu backend está no ar.

---

## Solução Manual: Usando sua Própria VPS (Nginx)

Se você preferir gerenciar seu próprio servidor, os problemas a seguir são os mais comuns.

### Problema Comum #1: Erro de CORS no App Online

Se o aplicativo mostra um erro "Falha ao conectar na API" ou "Erro de rede (CORS)" quando acessado online (Vercel, Netlify), o problema é quase sempre a configuração de CORS no seu PocketBase.

O navegador bloqueia requisições de um domínio para outro por segurança. Você precisa autorizar o domínio do seu app a se comunicar com a API.

#### Solução: Adicionar Domínios à Lista de Permissões (CORS)

1.  **Acesse o Admin UI do seu PocketBase:**
    Abra o endereço `https://seu-servidor-pocketbase.com/_/`.

2.  **Vá para as Configurações:**
    No menu lateral, clique em **Settings > Application**.

3.  **Adicione as Origens Permitidas ("Allowed Origins"):**
    No campo **Allowed Origins**, cole os endereços **exatos** dos seus domínios, um por linha.

    **Exemplos de URLs para adicionar:**
    ```
    http://localhost:9002
    https://seu-projeto.vercel.app
    https://seu-projeto-git-main-sua-conta.vercel.app
    https://seu-projeto-as8df9ad8-sua-conta.vercel.app
    ```
    *É crucial adicionar a URL de preview gerada pela Vercel para cada novo commit.*

4.  **Salve as alterações.**

---

### Problema Comum #2: Tela do Nginx ou Erro 404 na API

Se ao acessar `https://seu-servidor-pocketbase.com` você vê a tela de "Welcome to Nginx" ou se o aplicativo falha com erros **404 Not Found** em rotas como `/api/health`, o problema está na configuração do seu **proxy reverso**.

Isso significa que o Nginx está recebendo as requisições, mas não sabe que deve encaminhá-las para o serviço do PocketBase (que geralmente roda na porta `8090`).

#### Solução: Configurar o Proxy Reverso (Nginx)

Edite o arquivo de configuração do seu site no Nginx (geralmente em `/etc/nginx/sites-available/seu-dominio`) para que ele encaminhe o tráfego das rotas `/api/` e `/_/` para o PocketBase.

**Exemplo de Configuração Essencial para Nginx:**

```nginx
server {
    listen 80;
    server_name seu-servidor-pocketbase.com;

    # Redireciona HTTP para HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name seu-servidor-pocketbase.com;

    # Configurações de SSL (caminhos dos seus certificados)
    # ssl_certificate /etc/letsencrypt/live/seu-dominio/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seu-dominio/privkey.pem;

    # Bloco que encaminha a API para o PocketBase
    location /api/ {
        proxy_pass http://127.0.0.1:8090/api/; 
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_redirect off;
    }

    # Bloco para o painel de administração
    location /_/ {
        proxy_pass http://127.0.0.1:8090/_/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_redirect off;
    }

    # Bloco opcional para a raiz do domínio
    # location / {
    #     root /var/www/html; # Ex: servir uma página estática
    # }
}
```

Após fazer essas alterações, reinicie o Nginx com `sudo systemctl restart nginx`.
