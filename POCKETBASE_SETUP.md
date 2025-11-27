# Guia de Setup do Backend (PocketBase) - LEGADO

**Este arquivo está desatualizado.**

O projeto foi migrado do PocketBase para o **Firebase**. Não é mais necessário configurar uma VPS ou o PocketHost.

A hospedagem do backend agora é gerenciada pelos serviços serverless do Firebase (Firestore, Authentication), que funcionam em conjunto com a hospedagem do frontend na Vercel.

**Para configurar o projeto corretamente, por favor, siga as instruções detalhadas no arquivo `README.md` principal.**

Não há mais necessidade de se preocupar com:
- Erros de CORS (o Firebase gerencia isso).
- Configuração de proxy reverso (Nginx).
- Gerenciamento de servidor.
