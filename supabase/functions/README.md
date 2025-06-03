# Instruções para Implantação da Edge Function

Este documento contém instruções para implantar a Edge Function do projeto de onboarding com Asaas.

## Função Disponível

**asaas-onboarding**: Função para criar uma conta no Asaas, registrar o usuário no sistema e obter o link de onboarding.

## Implantação

### Pré-requisitos

- Supabase CLI instalado
- Acesso ao projeto Supabase (ID: farrdztansunfgcsrdno)

### Comando para Implantação

```bash
supabase functions deploy asaas-onboarding --project-ref farrdztansunfgcsrdno
```

## Uso da Função

### asaas-onboarding

Esta função cria uma conta no Asaas, registra o usuário no sistema e obtém o link de onboarding.

**Endpoint**: `https://farrdztansunfgcsrdno.supabase.co/functions/v1/asaas-onboarding`

**Método**: POST

**Corpo da requisição**:
```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com",
  "cpfCnpj": "123.456.789-00",
  "birthDate": "1990-01-01",
  "mobilePhone": "11999999999",
  "address": "Rua Exemplo",
  "addressNumber": "123",
  "complement": "Apto 123",
  "province": "Bairro",
  "postalCode": "12345-678",
  "state": "SP",
  "password": "senha123"
}
```

**Resposta**:
```json
{
  "success": true,
  "message": "Conta criada com sucesso no Asaas",
  "data": {
    "id": "asaas_account_id",
    "apiKey": "asaas_api_key",
    "walletId": "asaas_wallet_id",
    "accountNumber": "asaas_account_number"
  },
  "documents": {
    "data": [
      {
        "id": "document_id",
        "status": "NOT_SENT",
        "type": "IDENTIFICATION",
        "title": "Documentos de identificação",
        "onboardingUrl": "https://beta.cadastro.io/link_de_onboarding",
        "onboardingUrlExpirationDate": "2025-03-04 00:00:00"
      }
    ]
  },
  "onboardingUrl": "https://beta.cadastro.io/link_de_onboarding",
  "onboardingUrlExpirationDate": "2025-03-04 00:00:00"
}
```

## Fluxo de Integração

1. O frontend chama a função `asaas-onboarding` para criar a conta no Asaas.
2. A função aguarda 15 segundos (conforme recomendação da API do Asaas).
3. Após o tempo de espera, a função obtém automaticamente os documentos e o link de onboarding.
4. A função retorna todos os dados em uma única resposta, incluindo o link de onboarding.
5. O frontend exibe o link de onboarding para o usuário completar o processo.

## Observações Importantes

- A função inclui um tempo de espera de 15 segundos após a criação da conta antes de solicitar os documentos, conforme recomendação da API do Asaas.
- O cabeçalho correto para autenticação na API do Asaas é `access_token` (com underscore).
- O endpoint correto para obter os documentos é `/v3/myAccount/documents`.
- A função usa a API key da subconta recém-criada para acessar os documentos, não o token principal.
- A resposta da função pode demorar mais de 15 segundos devido ao tempo de espera necessário.
