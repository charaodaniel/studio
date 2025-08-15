# Guia de Configuração do Backend PocketBase com Nginx

Esta aplicação foi projetada para se conectar a um backend PocketBase rodando por trás de um proxy reverso, como o Nginx. Esta é a abordagem recomendada para segurança e estabilidade em produção.

## Cenário Atual

Pela sua configuração (`systemctl status pocketbase`), seu servidor PocketBase está rodando corretamente, mas escutando apenas localmente em `127.0.0.1:8090`. Isso é ótimo para segurança!

O próximo passo é usar o Nginx para "expor" o PocketBase para a internet de forma segura.

## Usando Nginx como Proxy Reverso

Configurar o Nginx como um proxy reverso é a solução definitiva para a conexão.

**Vantagens:**
*   **Resolve CORS:** O Nginx lida com as permissões de CORS de forma correta e definitiva.
*   **Domínio Personalizado:** Permite que você acesse sua API através de um domínio (ex: `api.seusite.com`) em vez de um IP com uma porta.
*   **Segurança (HTTPS):** Facilita a configuração de certificados SSL/TLS, protegendo toda a comunicação.
*   **Performance:** O Nginx pode lidar com cache e otimizar o acesso à API.

O time do PocketBase providenciou um guia excelente e detalhado sobre como fazer essa configuração. **Siga as instruções do link abaixo.**

**Consulte o guia oficial aqui:** [https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy](https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy)

Após seguir o guia, seu Nginx irá receber as requisições do nosso aplicativo (em `http://62.72.9.108`) e as redirecionará para o seu serviço PocketBase (em `http://127.0.0.1:8090`).
