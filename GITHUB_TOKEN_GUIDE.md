# Guia: Como Gerar um Token de Acesso Pessoal no GitHub

Este guia detalha o passo a passo para criar um **Token de Acesso Pessoal (Clássico)** no GitHub. Este tipo de token é frequentemente usado para permitir que serviços de terceiros, como o **PocketHost.io**, acessem sua conta de forma segura para criar e gerenciar projetos.

---

## Passo a Passo

### 1. Acesse as Configurações de Desenvolvedor

1.  Faça login na sua conta do GitHub.
2.  Clique na sua foto de perfil no canto superior direito e, no menu, selecione **Settings**.

    ![Menu de Configurações do GitHub](https://placehold.co/400x250/E3F2FD/1E3A8A?text=1.+Clique+em+Settings)

3.  No menu lateral esquerdo, role para baixo e clique em **<> Developer settings**.

    ![Opção Developer Settings](https://placehold.co/400x250/E3F2FD/1E3A8A?text=2.+Clique+em+Developer+Settings)

### 2. Navegue para Tokens de Acesso Pessoal

1.  Dentro das Configurações de Desenvolvedor, clique em **Personal access tokens** no menu lateral.
2.  Selecione a opção **Tokens (classic)**.

    ![Opção Tokens (classic)](https://placehold.co/500x200/E3F2FD/1E3A8A?text=3.+Selecione+Tokens+(classic))

### 3. Gere um Novo Token

1.  Na página de Tokens, clique no botão **Generate new token** e depois em **Generate new token (classic)**.

    ![Botão para gerar novo token](https://placehold.co/600x200/E3F2FD/1E3A8A?text=4.+Clique+em+Generate+new+token+(classic))

2.  Você pode ser solicitado a confirmar sua senha do GitHub para continuar.

### 4. Configure as Permissões (Escopos) do Token

1.  **Note (Nota):** Dê um nome descritivo ao seu token para lembrar sua finalidade (ex: `PocketHost Service`).
2.  **Expiration (Validade):** Recomendamos selecionar `90 days` ou `No expiration` para evitar que seu serviço pare de funcionar inesperadamente.
3.  **Select scopes (Selecionar escopos/permissões):** Esta é a parte mais importante. Você precisa marcar as caixas de seleção para dar as permissões necessárias. Para o PocketHost, as permissões essenciais são:
    *   `repo` (controle total de repositórios privados)
    *   `read:user` (ler os dados do seu perfil de usuário)
    *   `user:email` (acessar seus endereços de e-mail)

    ![Seleção de escopos repo e read:user](https://placehold.co/700x350/E3F2FD/1E3A8A?text=5.+Marque+as+caixas+'repo',+'read:user'+e+'user:email')

4.  Role até o final da página e clique no botão verde **Generate token**.

### 5. Copie e Guarde seu Token

1.  **Atenção!** O token será exibido **apenas uma vez**. Assim que você sair desta página, não poderá mais vê-lo.
2.  Clique no ícone de cópia ao lado do token para copiá-lo para sua área de transferência.

    ![Copiar o token gerado](https://placehold.co/800x150/FFF9C4/B71C1C?text=6.+COPIE+O+TOKEN!+Ele+não+será+mostrado+novamente.)

3.  **Guarde-o em um local seguro.** Agora você pode colar este token no campo solicitado pelo PocketHost ou por qualquer outro serviço que o exija.

---

Com este token, você poderá autenticar sua conta e permitir a criação do seu backend.