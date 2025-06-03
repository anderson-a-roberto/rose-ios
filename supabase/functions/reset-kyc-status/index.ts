import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentNumber } = await req.json()
    
    if (!documentNumber) {
      return new Response(
        JSON.stringify({ error: 'Document number is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Iniciando processo de reset KYC para documento: ${documentNumber}`)

    // 1. Buscar o perfil
    const { data: profileData, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, document_number, celcoin_status')
      .eq('document_number', documentNumber)
      .single()

    if (profileFetchError) {
      console.error('Erro ao buscar perfil:', profileFetchError)
      throw new Error(`Erro ao buscar perfil: ${profileFetchError.message}`)
    }

    if (!profileData) {
      throw new Error(`Perfil não encontrado para o documento: ${documentNumber}`)
    }

    console.log(`Perfil encontrado: ${JSON.stringify(profileData)}`)

    // 2. Buscar a proposta mais recente
    const { data: proposalData, error: proposalFetchError } = await supabaseAdmin
      .from('kyc_proposals_v2')
      .select('proposal_id, document_number, status')
      .eq('document_number', documentNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (proposalFetchError && proposalFetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar proposta:', proposalFetchError)
      throw new Error(`Erro ao buscar proposta: ${proposalFetchError.message}`)
    }

    if (!proposalData) {
      throw new Error(`Proposta não encontrada para o documento: ${documentNumber}`)
    }

    console.log(`Proposta encontrada: ${JSON.stringify(proposalData)}`)

    // 3. Atualizar o status do perfil
    const { data: updatedProfile, error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ celcoin_status: 'failed' })
      .eq('id', profileData.id)
      .select()

    if (profileUpdateError) {
      console.error('Erro ao atualizar perfil:', profileUpdateError)
      throw new Error(`Erro ao atualizar perfil: ${profileUpdateError.message}`)
    }

    console.log(`Perfil atualizado: ${JSON.stringify(updatedProfile)}`)

    // 4. Atualizar o status da proposta
    const { data: updatedProposal, error: proposalUpdateError } = await supabaseAdmin
      .from('kyc_proposals_v2')
      .update({ status: 'inactive' })
      .eq('proposal_id', proposalData.proposal_id)
      .select()

    if (proposalUpdateError) {
      console.error('Erro ao atualizar proposta:', proposalUpdateError)
      throw new Error(`Erro ao atualizar proposta: ${proposalUpdateError.message}`)
    }

    console.log(`Proposta atualizada: ${JSON.stringify(updatedProposal)}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: updatedProfile, 
        proposal: updatedProposal 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na função reset-kyc-status:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno no servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
