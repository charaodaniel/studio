# Guia de Configuração do Backend PocketBase

Para que seu aplicativo frontend (hospedado na Vercel, Netlify, etc.) possa se conectar ao seu servidor PocketBase, é essencial configurar o CORS (Cross-Origin Resource Sharing) corretamente.

## Problema: Erro de Conexão no App Online

Se o aplicativo mostra um erro de conexão ("Falha ao conectar na API", "Erro de rede", ou "CORS") quando você o acessa por um link online (Vercel), o problema é quase sempre a configuração de CORS no seu PocketBase.

O navegador bloqueia requisições de um domínio (ex: `seu-app.vercel.app`) para outro (ex: `https://mobmv.shop`) por segurança, a menos que o servidor da API permita explicitamente.

### Solução: Adicionar Domínios à Lista de Permissões (CORS)

Você precisa dizer ao seu servidor PocketBase para aceitar requisições vindas dos domínios onde o aplicativo está hospedado.

1.  **Acesse o Admin UI do seu PocketBase:**
    Abra o endereço do seu PocketBase (ex: `https://mobmv.shop/_/`) no seu navegador.

2.  **Vá para as Configurações:**
    No menu lateral, clique em **Settings** e depois em **Application**.

3.  **Adicione as Origens Permitidas ("Allowed Origins"):**
    No campo **Allowed Origins**, cole os endereços **exatos** dos seus domínios da Vercel. É importante adicionar todos, um por linha.

    **Exemplos de URLs para adicionar:**
    ```
    https://seu-projeto.vercel.app
    https://seu-projeto-git-main-sua-conta.vercel.app
    https://seu-projeto-as8df9ad8-sua-conta.vercel.app
    ```

    **Dica:** A Vercel gera várias URLs (produção, preview, etc.). Uma forma fácil de permitir todas é usar um wildcard, se você se sentir confortável com isso:
    ```
    https://seu-projeto-*.vercel.app
    ```
    
    Se você também acessa o app localmente durante o desenvolvimento, adicione a URL local também (geralmente `http://localhost:9002`).

4.  **Salve as alterações.**

---

### Nota Importante sobre Proxy Reverso (Nginx, Caddy, etc.)

Se você usa um proxy reverso na frente do seu PocketBase (o que é comum em produção), certifique-se de que ele está encaminhando **todo** o tráfego que chega em `/api/` para o seu servidor PocketBase.

Alguns erros, como `404 Not Found` em rotas de login de administrador (`/api/admins/...`), podem ocorrer se o proxy estiver configurado para encaminhar apenas `/api/collections/`.

**Exemplo para Nginx:**

```nginx
# Configuração INCOMPLETA (pode causar erros)
location /api/collections/ {
    proxy_pass http://127.0.0.1:8090;
    # ... outras configurações
}

# Configuração CORRETA (abrange todas as rotas da API)
location /api/ {
    proxy_pass http://127.0.0.1:8090;
    # ... outras configurações
}
```

Isso deve resolver os erros de CORS e de rotas não encontradas, permitindo que seu app na Vercel se conecte perfeitamente ao seu backend PocketBase.
