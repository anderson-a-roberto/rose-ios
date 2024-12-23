# Banco Rose

Um aplicativo bancário desenvolvido com React Native e Supabase, oferecendo funcionalidades de autenticação, KYC (Know Your Customer) e gerenciamento de conta.

## Funcionalidades

- Autenticação de usuários com CPF e senha
- Processo de KYC integrado com Celcoin
- Dashboard com informações da conta
- Fluxo de cadastro completo com validações
- Integração com Supabase para backend

## Tecnologias Utilizadas

- React Native
- Expo
- Supabase (Autenticação e Banco de Dados)
- React Native Paper (UI Components)
- Celcoin API (KYC)

## Como Executar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente (veja seção abaixo)
4. Execute o projeto:
```bash
npx expo start
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
```

## Estrutura do Projeto

```
src/
  ├── screens/         # Telas do aplicativo
  ├── components/      # Componentes reutilizáveis
  ├── services/       # Serviços e integrações
  └── utils/          # Funções utilitárias
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
