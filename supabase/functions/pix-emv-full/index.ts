import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Interface para a resposta da API Celcoin
interface CelcoinResponse {
  status: string;
  data?: any;
  error?: {
    message: string;
    details?: any;
  };
}

// Função para obter token de acesso da Celcoin
async function getCelcoinToken(): Promise<string> {
  console.log('Obtendo token de acesso da Celcoin...');
  
  const clientId = Deno.env.get('CELCOIN_CLIENT_ID');
  const clientSecret = Deno.env.get('CELCOIN_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.error('Credenciais da Celcoin não configuradas');
    throw new Error('Credenciais da Celcoin não configuradas');
  }
  
  try {
    const tokenUrl = 'https://sandbox.openfinance.celcoin.dev/v5/token';
    const payload = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });
    
    console.log('Enviando requisição para obter token...');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });
    
    const data = await response.json();
    console.log('Resposta da requisição de token:', JSON.stringify(data, null, 2));
    
    if (!response.ok || !data.access_token) {
      console.error('Erro ao obter token:', data);
      throw new Error('Erro ao obter token de acesso');
    }
    
    console.log('Token obtido com sucesso');
    return data.access_token;
  } catch (error) {
    console.error('Exceção ao obter token:', error);
    throw new Error(`Erro ao obter token: ${error.message}`);
  }
}

// Função para decodificar o código EMV
async function decodeEmvCode(emvCode: string, token: string): Promise<any> {
  console.log('Decodificando código EMV...');
  console.log('Código EMV recebido:', emvCode.substring(0, 20) + '...');
  
  try {
    const emvUrl = 'https://sandbox.openfinance.celcoin.dev/pix/v1/brcode/static';
    
    const payload = {
      brcode: emvCode,
    };
    
    console.log('Payload para decodificação EMV:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(emvUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    console.log('Resposta da decodificação EMV:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Erro na decodificação EMV:', data);
      throw new Error(data.message || 'Erro ao decodificar código EMV');
    }
    
    // Detectar se é um QR code dinâmico ou estático
    const isDynamic = data.transactionIdentification !== undefined && data.transactionIdentification !== null;
    console.log(`Tipo de QR code detectado: ${isDynamic ? 'Dinâmico' : 'Estático'}`);
    
    // Adicionar campo para indicar o tipo de QR code
    data.isDynamicQrCode = isDynamic;
    
    // Adicionar campo para indicar o tipo de iniciação correto
    data.recommendedInitiationType = isDynamic ? 'MANUAL' : 'DICT';
    
    console.log('Dados EMV processados com sucesso');
    return data;
  } catch (error) {
    console.error('Exceção na decodificação EMV:', error);
    throw new Error(`Erro ao decodificar código EMV: ${error.message}`);
  }
}

// Handler principal da função edge
serve(async (req) => {
  console.log('Função pix-emv-full iniciada');
  console.log('Método da requisição:', req.method);
  
  // Lidar com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    console.log('Respondendo a requisição OPTIONS para CORS');
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Verificar método
    if (req.method !== 'POST') {
      console.error('Método não permitido:', req.method);
      return new Response(
        JSON.stringify({
          status: 'ERROR',
          error: { message: 'Método não permitido' },
        }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Extrair dados da requisição
    const requestData = await req.json();
    console.log('Dados da requisição recebidos:', JSON.stringify(requestData, null, 2));
    
    // Validar dados da requisição
    if (!requestData.emv) {
      console.error('Código EMV não fornecido');
      return new Response(
        JSON.stringify({
          status: 'ERROR',
          error: { message: 'Código EMV não fornecido' },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Obter token da Celcoin
    const token = await getCelcoinToken();
    
    // Decodificar o código EMV
    const emvData = await decodeEmvCode(requestData.emv, token);
    
    // Preparar resposta
    const response: CelcoinResponse = {
      status: 'SUCCESS',
      data: emvData,
    };
    
    console.log('Resposta final:', JSON.stringify(response, null, 2));
    
    // Retornar resposta
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função pix-emv-full:', error);
    
    // Preparar resposta de erro
    const errorResponse: CelcoinResponse = {
      status: 'ERROR',
      error: {
        message: error.message || 'Erro interno',
        details: error.stack,
      },
    };
    
    // Retornar resposta de erro
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
