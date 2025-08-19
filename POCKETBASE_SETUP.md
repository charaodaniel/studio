# Guia de Configuração do Backend PocketBase

Para que este aplicativo possa se conectar ao seu servidor PocketBase, é essencial configurar o CORS (Cross-Origin Resource Sharing) corretamente.

## Problema: Erro de Conexão no App Online (mas funciona localmente)

Se o aplicativo mostra um erro de conexão ("Falha ao conectar na API", "Erro de rede", ou "CORS") quando você o acessa pelo link do Firebase Studio, mas funciona no seu computador local, o problema é 99% das vezes o CORS.

Por padrão, o PocketBase bloqueia requisições de outros domínios (como o do nosso aplicativo online) por segurança.

### Solução: Adicionar os Domínios à Lista de Permissões

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
    ```
    
    Se você também acessa o app localmente durante o desenvolvimento, adicione a URL local também (geralmente `http://localhost:9002` ou `http://localhost:3000`).

4.  **Salve as alterações.**

Após salvar, o erro de conexão no ambiente online deverá ser resolvido.

---

## Outros Problemas Comuns

### Erro 404 (Not Found) com Nginx

Se você configurou o Nginx como proxy reverso e está recebendo erros `404 Not Found` da API, o problema geralmente está na diretiva `proxy_pass`. É crucial que o endereço no `proxy_pass` **NÃO** termine com uma barra `/`.

```nginx
location /api/ {
    # INCORRETO: proxy_pass http://127.0.0.1:8090/;
    
    # CORRETO (sem a barra no final):
    proxy_pass http://127.0.0.1:8090;

    # ...outras configurações...
}
```
Depois de fazer a alteração, recarregue o Nginx com `sudo systemctl reload nginx`.
