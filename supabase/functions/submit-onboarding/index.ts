import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CELCOIN_API_URL = 'https://sandbox.openfinance.celcoin.dev'
const CELCOIN_TOKEN = Deno.env.get('CELCOIN_TOKEN')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { body } = await req.json()

    // Chamar API da Celcoin
    const celcoinResponse = await fetch(
      `${CELCOIN_API_URL}/onboarding/v1/onboarding-proposal/legal-entity`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CELCOIN_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    const celcoinData = await celcoinResponse.json()

    // Se a resposta não for bem-sucedida, formatar o erro de maneira mais amigável
    if (!celcoinResponse.ok) {
      console.error('Erro na resposta da Celcoin:', celcoinData)
      
      // Verificar se é um erro conhecido da Celcoin
      if (celcoinData.error && celcoinData.error.errorCode) {
        return new Response(
          JSON.stringify({ 
            error: celcoinData.error,
            message: getReadableErrorMessage(celcoinData.error.errorCode, celcoinData.error.message)
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            status: celcoinResponse.status
          }
        )
      }
    }

    return new Response(
      JSON.stringify(celcoinData),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: celcoinResponse.status
      }
    )
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return new Response(
      JSON.stringify({ 
        error: { 
          message: error.message || 'Erro interno do servidor',
          details: error.toString()
        } 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 500 
      }
    )
  }
})

/**
 * Traduz códigos de erro da Celcoin para mensagens mais amigáveis
 */
function getReadableErrorMessage(errorCode: string, originalMessage: string): string {
  const errorMessages: Record<string, string> = {
    'OBE038': 'Não é possível cadastrar sócios com o mesmo CPF/CNPJ.',
    'OBE001': 'Dados de cadastro incompletos ou inválidos.',
    'OBE002': 'Não foi possível validar os dados do cadastro.',
    'OBE003': 'Erro na validação dos documentos.',
    'OBE004': 'Erro na validação do endereço.',
    'OBE005': 'Erro na validação dos dados bancários.',
    'OBE006': 'Erro na validação dos dados do sócio.',
    'OBE007': 'Erro na validação dos dados da empresa.',
    // Adicione mais códigos de erro conforme necessário
  }

  return errorMessages[errorCode] || originalMessage || 'Ocorreu um erro no processamento do cadastro.'
}
