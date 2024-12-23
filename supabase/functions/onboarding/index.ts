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
    const { userData } = await req.json()

    // Preparar payload para a Celcoin
    const payload = {
      address: {
        postalCode: userData.cep?.replace(/\D/g, '') || '',
        street: userData.rua || '',
        number: userData.numero || '',
        addressComplement: userData.complemento || '',
        neighborhood: userData.bairro || '',
        city: userData.cidade || '',
        state: userData.estado || ''
      },
      isPoliticallyExposedPerson: false,
      onboardingType: "BAAS",
      clientCode: "321654",
      documentNumber: userData.cpf?.replace(/\D/g, '') || '',
      phoneNumber: userData.telefone?.replace(/\D/g, '').startsWith('+') 
        ? userData.telefone.replace(/\D/g, '')
        : `+55${userData.telefone?.replace(/\D/g, '')}`,
      email: userData.email || '',
      motherName: userData.nomeMae || '',
      fullName: userData.nome || '',
      socialName: userData.nome?.split(' ')[0] || '',
      birthDate: userData.dataNascimento?.split('/').reverse().join('-') || ''
    }

    // Chamar API da Celcoin
    const celcoinResponse = await fetch(
      `${CELCOIN_API_URL}/onboarding/v1/onboarding-proposal/natural-person`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CELCOIN_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    const celcoinData = await celcoinResponse.json()

    // Se a chamada para a Celcoin foi bem sucedida, salvar no Supabase
    if (celcoinResponse.ok) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      const { error: supabaseError } = await supabase
        .from('cadastros')
        .insert([userData])

      if (supabaseError) {
        throw new Error(`Erro ao salvar no banco de dados: ${supabaseError.message}`)
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
    return new Response(
      JSON.stringify({ error: error.message }),
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