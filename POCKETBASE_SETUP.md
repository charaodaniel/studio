# Guia de Configuração do Backend PocketBase

Para que este aplicativo possa se conectar ao seu servidor PocketBase, é essencial configurar o CORS (Cross-Origin Resource Sharing) corretamente.

## O Problema: Erro de CORS

Se o aplicativo mostra um erro de conexão ("Falha ao conectar na API", "Erro de rede", ou "CORS"), mas você consegue acessar o painel do PocketBase diretamente no seu navegador, o problema é quase certamente o CORS.

Por padrão, o PocketBase bloqueia requisições de outros domínios (como o do nosso aplicativo) por segurança.

## Solução: Adicionar "Allowed Origins"

Você precisa dizer ao seu PocketBase para aceitar requisições vindas do nosso aplicativo.

1.  **Acesse o Admin UI do seu PocketBase:**
    Abra `http://<seu_ip_aqui>:8090/_/` no seu navegador.

2.  **Vá para as Configurações:**
    No menu lateral, clique em **Settings** e depois em **Application**.

3.  **Adicione a Origem Permitida:**
    No campo **Allowed Origins**, cole o endereço **exato** que você usa no navegador para acessar este aplicativo.
    
    - **Se você acessa este app pelo IP:**
      ```
      http://62.72.9.108
      ```
    - **Se você usa um domínio com Nginx:**
      Cole o seu domínio. Por exemplo:
      ```
      https://meuapp.com
      ```
      ou
      ```
      http://meuapp.com
      ```
    
    Se você tiver outras origens, pode adicioná-las em linhas separadas. Para permitir todas as origens (não recomendado para produção), você pode usar `*`.

4.  **Salve as alterações.**

Depois de salvar, volte para o aplicativo e tente o teste de conexão no "Painel do Desenvolvedor" novamente. O erro deverá ter desaparecido.

---

### Para Produção: Usando um Proxy Reverso (Nginx)

Para um ambiente de produção, a abordagem mais segura e robusta é usar um proxy reverso como o Nginx. Isso permite usar um domínio personalizado (ex: `api.seusite.com`) e configurar HTTPS facilmente.

O time do PocketBase providenciou um guia excelente sobre isso:
**Consulte o guia oficial aqui:** [https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy](https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy)