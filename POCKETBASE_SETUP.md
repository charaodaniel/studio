# Guia de Configuração do Backend PocketBase

Esta aplicação foi projetada para se conectar a um backend PocketBase.

## Testando a Conexão

Para garantir que o frontend possa se comunicar com seu backend, use a página de desenvolvedor da sua aplicação.

1.  **Inicie sua aplicação.**
2.  **Abra o painel do administrador** e clique no botão **"Desenvolvedor"**.
3.  Na página de desenvolvedor, use a ferramenta **"Teste de Conexão com API"**. O teste deve usar a URL pública do seu servidor (ex: `http://SEU_IP_PUBLICO:8090`).

Se o teste de conexão falhar, verifique os seguintes pontos:

**1. Comando de Inicialização (CORS):**
Versões mais recentes do PocketBase (v0.22+) vêm com a configuração de CORS (`--origins="*"`) habilitada por padrão. Se você estiver usando uma versão mais antiga ou se o teste falhar, certifique-se de iniciar seu servidor com este parâmetro explícito:
`./pocketbase serve --http="0.0.0.0:8090" --origins="*"`

**2. Firewall:**
Verifique se a porta `8090` está liberada no firewall do seu servidor (`62.72.9.108`).

## Usando um Proxy Reverso (Nginx) - Altamente Recomendado

Para ambientes de produção, a melhor prática é rodar o PocketBase por trás de um proxy reverso como o Nginx. Isso resolve muitos problemas de conexão e segurança.

**Vantagens:**
*   **Segurança:** Facilita a configuração de HTTPS com certificados SSL/TLS.
*   **Domínio Personalizado:** Permite que você acesse sua API através de um subdomínio (ex: `api.seusite.com`) em vez de um IP com uma porta.
*   **Performance:** O Nginx pode lidar com cache e balanceamento de carga.

O time do PocketBase providenciou um guia excelente sobre como fazer essa configuração.

**Consulte o guia oficial aqui:** [https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy](https://pocketbase.io/docs/going-to-production/#using-a-reverse-proxy)
