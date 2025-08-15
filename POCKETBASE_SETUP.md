# Guia de Configuração do Backend PocketBase

Esta aplicação foi projetada para se conectar a um backend PocketBase.

## Testando a Conexão

Para garantir que o frontend possa se comunicar com seu backend, use a página de desenvolvedor da sua aplicação.

1.  **Inicie sua aplicação.**
2.  **Abra o painel do administrador** e clique no botão **"Desenvolvedor"**.
3.  Na página de desenvolvedor, use a ferramenta **"Teste de Conexão com API"**.

Se o teste de conexão falhar, verifique se a URL do seu backend PocketBase está acessível publicamente e se não há firewalls bloqueando a conexão.

**Observação sobre CORS:** As versões mais recentes do PocketBase vêm com configurações de CORS (`--origins="*"`) que permitem a conexão de qualquer origem por padrão. Se você estiver usando uma versão mais antiga ou tiver alterado essa configuração, certifique-se de que a origem da sua aplicação frontend esteja na lista de permissões.
