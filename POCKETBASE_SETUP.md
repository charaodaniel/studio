# Guia de Configuração do Backend PocketBase

Esta aplicação foi projetada para se conectar a um backend PocketBase.

## Testando a Conexão

Para garantir que o frontend possa se comunicar com seu backend, use a página de desenvolvedor da sua aplicação.

1.  **Inicie sua aplicação.**
2.  **Abra o painel do administrador** e clique no botão **"Desenvolvedor"**.
3.  Na página de desenvolvedor, use a ferramenta **"Teste de Conexão com API"**.

Se o teste de conexão falhar, verifique se a URL do seu backend PocketBase está acessível publicamente e se não há firewalls bloqueando a conexão.

**Observação sobre CORS:** Versões recentes do PocketBase (v0.22+) vêm com configurações de CORS (`--origins="*"`) que permitem a conexão de qualquer origem por padrão ao iniciar o servidor. Se você estiver usando uma versão mais antiga ou tiver alterado essa configuração, certifique-se de que a origem da sua aplicação frontend esteja na lista de permissões.

## Usando um Proxy Reverso (Nginx) - Recomendado

Para ambientes de produção, é altamente recomendado rodar o PocketBase por trás de um proxy reverso como o Nginx.

**Vantagens:**
*   **Segurança:** Facilita a configuração de HTTPS com certificados SSL/TLS.
*   **Domínio Personalizado:** Permite que você acesse sua API através de um subdomínio (ex: `api.seusite.com`) em vez de um IP com uma porta.
*   **Performance:** O Nginx pode lidar com cache e balanceamento de carga.

O time do PocketBase providenciou um guia excelente sobre como fazer essa configuração.

**Consulte o guia oficial aqui:** [https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy](https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy)
