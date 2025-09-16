# Guia de Funcionalidades para o Aplicativo Móvel (Motorista)

Este documento detalha os requisitos funcionais para a criação do aplicativo móvel nativo destinado aos **motoristas**, **administradores** e **atendentes** da plataforma CEOLIN Mobilidade Urbana.

O objetivo é traduzir as funcionalidades existentes no protótipo web para uma experiência otimizada para dispositivos móveis (iOS e Android).

---

## 1. Painel do Motorista (Foco Principal)

O aplicativo móvel deve replicar e otimizar todas as funcionalidades do painel do motorista, garantindo uma experiência fluida e intuitiva.

### 1.1. Autenticação e Perfil
- **Login e Cadastro:** Formulários para entrar ou criar uma conta de motorista.
- **Recuperação de Senha:** Fluxo para redefinir a senha via e-mail.
- **Gerenciamento de Perfil:**
    - **Dados Pessoais:** Visualizar e editar nome, CNPJ e chave PIX.
    - **Veículo:** Visualizar e editar modelo e placa.
    - **Documentos:**
        - Fazer upload de CNH, CRLV e foto do veículo usando a câmera ou a galeria do celular.
        - Visualizar o status de verificação dos documentos (Pendente, Aprovado, Rejeitado).
    - **Segurança:** Alterar senha.
- **Configurações de Tarifa:**
    - Definir o tipo de tarifa (fixa ou por km) e os valores correspondentes.
    - Ativar/desativar a opção de aceitar corridas negociáveis para o interior.

### 1.2. Tela Principal (Dashboard de Corridas)
- **Gerenciamento de Status:**
    - Um seletor proeminente para alterar o status: **Online**, **Offline**, **Em Viagem**. O status deve ser persistido e visível em todo o app.
- **Recebimento de Solicitações:**
    - **Notificação Sonora e Visual:** O app deve tocar o som `olha-a-mensagem.mp3` em loop e exibir um alerta visual claro quando uma nova corrida for solicitada.
    - **Lista de Solicitações:** Exibir cards com as corridas pendentes, mostrando:
        - Nome e avaliação do passageiro.
        - Endereços de partida e destino.
        - Valor (para corridas locais) ou indicação "A Negociar".
        - Indicação clara se é uma **corrida agendada**, mostrando data e hora.
- **Aceite e Rejeição:**
    - Botões para "Aceitar" ou "Rejeitar" a corrida diretamente no card.

### 1.3. Gerenciamento da Corrida em Andamento
- **Interface Pós-Aceite:** Após aceitar, a tela principal deve mudar para uma interface de "Corrida em Andamento", mostrando:
    - Informações do passageiro.
    - Endereço de destino.
    - Botão **"Ir até Passageiro"** (abre Waze/Google Maps com o endereço de partida).
    - Botão **"Passageiro a Bordo"**: Ao ser pressionado, muda o estado da viagem.
- **Interface Pós-Embarque:** Após o embarque, a interface deve exibir:
    - Botão **"Navegar para Destino"** (abre Waze/Google Maps com o endereço final).
    - Botão **"Finalizar Viagem"**.
- **Botão de Imprevisto/Cancelar:** Uma opção para cancelar a corrida em caso de emergência, com uma caixa de diálogo para confirmação.

### 1.4. Conversas e Negociação
- **Lista de Conversas:** Uma aba para listar todos os chats com passageiros, ordenados pelo mais recente.
- **Interface de Chat:**
    - Troca de mensagens em tempo real.
    - **Para corridas negociáveis:** Interface para enviar uma contraproposta de valor. O passageiro deve poder aceitar essa proposta no app dele.
    - O chat deve ser acessível tanto da lista de conversas quanto diretamente do card da corrida em andamento.

### 1.5. Histórico e Relatórios
- **Lista de Corridas Realizadas:** Uma aba para visualizar o histórico de todas as corridas, com filtros por período.
- **Registro de Corrida Manual:** Um formulário para que o motorista possa registrar corridas combinadas diretamente com o passageiro, incluindo a opção de **agendamento futuro**.
- **Exportação de Relatórios:** Funcionalidade para gerar e compartilhar (ou salvar) relatórios de corridas em formato **PDF** e **CSV**, com filtros por período ou relatório completo.

---

## 2. Acesso do Administrador (Visão Simplificada)

Para o app móvel, o administrador não precisa de todas as ferramentas da versão web. O foco é no monitoramento e gerenciamento rápido.

### 2.1. Funcionalidades Essenciais
- **Login Seguro:** Acesso via e-mail e senha de administrador.
- **Dashboard Simplificado:** Uma visão geral com números chave (motoristas online, corridas em andamento).
- **Gerenciamento de Usuários:**
    - Listar todos os usuários (motoristas, passageiros, etc.).
    - Visualizar o perfil de um usuário.
    - **Ações Rápidas:** Ligar, iniciar uma conversa de suporte ou desativar/ativar um usuário diretamente da lista.
- **Verificação de Documentos:**
    - Uma interface para visualizar documentos pendentes.
    - Botões para **aprovar** ou **rejeitar** documentos com um toque.
- **Conversas de Suporte:**
    - Acesso a todas as conversas da plataforma para poder intervir quando necessário.

---

## 3. Acesso do Atendente (Foco em Suporte)

O atendente é a linha de frente do suporte. O app móvel deve ser sua principal ferramenta de trabalho.

### 3.1. Funcionalidades Essenciais
- **Login Seguro:** Acesso via e-mail e senha de atendente.
- **Dashboard de Monitoramento:**
    - **Status dos Motoristas:** Uma lista em tempo real mostrando quais motoristas estão online, offline ou em viagem.
- **Listas de Usuários:**
    - Abas para visualizar rapidamente listas de **passageiros** e **motoristas**.
    - **Ação Principal:** Tocar em um usuário para iniciar imediatamente uma conversa de suporte.
- **Painel de Conversas:**
    - A interface principal do atendente.
    - Deve permitir visualizar todas as conversas de suporte, responder a usuários e gerenciar múltiplos atendimentos simultaneamente.