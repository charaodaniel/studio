# Guia de Configuração do Backend PocketBase

Esta aplicação foi projetada para se conectar a um backend PocketBase.

## Testando a Conexão

Para garantir que o frontend possa se comunicar com seu backend, use a página de desenvolvedor da sua aplicação.

1.  **Inicie sua aplicação.**
2.  **Abra o painel do administrador** e clique no botão **"Desenvolvedor"**.
3.  Na página de desenvolvedor, use a ferramenta **"Teste de Conexão com API"**. O teste deve usar a URL pública do seu servidor (ex: `http://SEU_IP_PUBLICO:8090`).

Se o teste de conexão falhar, a causa mais provável é a configuração de rede ou CORS. A solução mais robusta é usar um proxy reverso.

## Usando um Proxy Reverso (Nginx) - Altamente Recomendado

Para ambientes de produção e para resolver problemas complexos de conexão, a melhor prática é rodar o PocketBase por trás de um proxy reverso como o Nginx.

**Vantagens:**
*   **Resolve CORS:** O Nginx pode ser configurado para lidar com as permissões de CORS de forma correta e definitiva.
*   **Domínio Personalizado:** Permite que você acesse sua API através de um subdomínio (ex: `api.seusite.com`) em vez de um IP com uma porta.
*   **Segurança:** Facilita a configuração de HTTPS com certificados SSL/TLS, protegendo a comunicação.
*   **Performance:** O Nginx pode lidar com cache e balanceamento de carga, otimizando o acesso à API.

O time do PocketBase providenciou um guia excelente e detalhado sobre como fazer essa configuração.

**Consulte o guia oficial aqui:** [https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy](https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy)

Seguir este guia é o caminho mais seguro para garantir que sua aplicação se conecte ao PocketBase sem problemas.
