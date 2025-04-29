# Inbox 24/7

Aplicação de gerenciamento de objetos para reserva. A aplicação permite criar grupos e registrar produtos para reserva por usuários.

## Funcionalidades

- Visualização de grupos
- Cadastro de novos grupos
- Listagem de produtos disponíveis para reserva
- Sistema de notificações
- Perfil do usuário com histórico de reservas

## Tecnologias Utilizadas

- Node.js
- Express.js
- EJS (Embedded JavaScript templates)
- HTML/CSS
- JavaScript

## Estrutura do Projeto

- `server.js` - Arquivo principal do servidor
- `views/` - Templates EJS para as páginas
- `public/` - Arquivos estáticos (CSS, JS, imagens)

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   npm start
   ```
   
   Ou, para desenvolvimento com reinicialização automática:
   ```
   npm run dev
   ```
4. Acesse a aplicação em `http://localhost:3000`

## Páginas

- **Página Inicial** - Exibe informações principais como objetos reservados e grupos
- **Produtos** - Lista produtos disponíveis para reserva
- **Notificações** - Exibe mensagens e notificações do sistema
- **Perfil** - Mostra informações do usuário e histórico de reservas 