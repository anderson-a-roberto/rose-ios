# Configuração Web do Projeto

Este documento mantém as informações necessárias para reativar a funcionalidade web do projeto.

## Dependências Removidas
```json
{
  "dependencies": {
    "@expo/webpack-config": "^19.0.1",
    "react-dom": "18.2.0",
    "react-native-web": "^0.19.13"
  }
}
```

## Scripts Removidos
```json
{
  "scripts": {
    "web": "expo start --web"
  }
}
```

## Como Restaurar a Funcionalidade Web

1. Instale as dependências necessárias:
```bash
npm install @expo/webpack-config@latest react-dom react-native-web
```

2. Adicione o script web no package.json:
```json
{
  "scripts": {
    "web": "expo start --web"
  }
}
```

3. Execute o comando para iniciar o projeto web:
```bash
npm run web
```

## Notas Importantes
- Certifique-se de usar versões compatíveis com a versão atual do Expo
- Se encontrar conflitos de dependências, consulte a documentação do Expo para as versões corretas
- Atual versão do Expo quando web foi removido: 52.0.35
