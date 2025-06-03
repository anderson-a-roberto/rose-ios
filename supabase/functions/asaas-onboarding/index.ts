import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Obter as variáveis de ambiente para o cliente Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Criar o cliente Supabase com a service role key para ter permissões de escrita
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get Asaas API token from environment variable
    console.log('Checking environment variables...');
    const allEnvVars = Object.keys(Deno.env.toObject());
    console.log('Available environment variables:', allEnvVars);

    // Tente acessar o token de diferentes maneiras
    let asaasToken = Deno.env.get('ASAAS_API_TOKEN');
    if (!asaasToken) {
      // Tente usar o token diretamente
      asaasToken = '$aact_MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk4MmY1OGEwLTgzOGItNDcyNy04MmU2LTRiNWMyYmU2ZDY3Mjo6JGFhY2hfZDBmYTc5NDItODMyZi00NzdlLTg3NTAtYTYxOWIxZmMyOGZl';
      console.log('Using hardcoded token as fallback');
    }

    console.log('ASAAS_API_TOKEN exists:', asaasToken ? 'Yes' : 'No');
    if (!asaasToken) {
      console.error('ASAAS_API_TOKEN not configured');
      return new Response(JSON.stringify({
        error: 'API token not configured',
        availableEnvVars: allEnvVars
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get the current environment (sandbox or production)
    const isProduction = Deno.env.get('ASAAS_ENVIRONMENT') === 'production';
    const baseUrl = isProduction ? 'https://api.asaas.com' : 'https://api-sandbox.asaas.com';

    // Parse the request body
    const { body } = await req.json();
    console.log('Request body recebido:', body);

    if (!body) {
      return new Response(JSON.stringify({
        error: 'Request body is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Verificar se o documento é um CNPJ
    const isCNPJ = (document) => {
      if (!document) return false;
      const cleanDoc = document.replace(/\\D/g, '');
      console.log('Verificando se é CNPJ. Documento limpo:', cleanDoc, 'Tamanho:', cleanDoc.length);
      return cleanDoc.length === 14;
    };

    // Prepare the data for Asaas API
    const asaasPayload = {
      name: body.name,
      email: body.email,
      cpfCnpj: body.cpfCnpj,
      birthDate: body.birthDate,
      mobilePhone: body.mobilePhone,
      incomeValue: body.incomeValue,
      address: body.address,
      addressNumber: body.addressNumber,
      complement: body.complement || null,
      province: body.province,
      postalCode: body.postalCode.replace(/\\D/g, ''),
      state: body.state,
      // Incluir o campo companyType se estiver definido no body
      ...body.companyType ? {
        companyType: body.companyType
      } : {},
      // Configuração de webhooks para notificações de status da conta
      webhooks: [
        {
          events: [
            "ACCOUNT_STATUS_BANK_ACCOUNT_INFO_APPROVED",
            "ACCOUNT_STATUS_BANK_ACCOUNT_INFO_AWAITING_APPROVAL",
            "ACCOUNT_STATUS_BANK_ACCOUNT_INFO_PENDING",
            "ACCOUNT_STATUS_BANK_ACCOUNT_INFO_REJECTED",
            "ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED",
            "ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL",
            "ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING",
            "ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED",
            "ACCOUNT_STATUS_DOCUMENT_APPROVED",
            "ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL",
            "ACCOUNT_STATUS_DOCUMENT_PENDING",
            "ACCOUNT_STATUS_DOCUMENT_REJECTED",
            "ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED"
          ],
          name: "Supabase",
          url: "https://farrdztansunfgcsrdno.supabase.co/functions/v1/asaas-webhook-handler",
          email: "inovagroup00@gmail.com",
          enabled: true,
          apiVersion: 3,
          sendType: "NON_SEQUENTIALLY",
          interrupted: false,
          authToken: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcnJkenRhbnN1bmZnY3NyZG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MDE4MTUsImV4cCI6MjA1NDM3NzgxNX0.Q8-cyeFUZo5m8ZEI1YVI9d2nnGgwWAuxcGMkO4qrtQU"
        }
      ]
    };

    // Verificar explicitamente se é CNPJ para adicionar o campo companyType (obrigatório para CNPJ)
    const cpfCnpjClean = body.cpfCnpj ? body.cpfCnpj.replace(/\\D/g, '') : '';
    const isCnpjDocument = cpfCnpjClean.length === 14;

    // Verificar se é CNPJ e se o campo companyType está presente
    console.log('É CNPJ?', isCnpjDocument);
    console.log('Estrutura completa do body recebido:', JSON.stringify(body, null, 2));
    console.log('companyType recebido:', body.companyType);
    console.log('Tipo do companyType:', typeof body.companyType);

    if (isCnpjDocument) {
      // Forçar a inclusão do campo companyType para CNPJ
      if (!body.companyType || body.companyType === "") {
        console.log('companyType não está definido ou está vazio, definindo como MEI');
        asaasPayload.companyType = "MEI";
      } else {
        console.log('companyType já está definido como:', body.companyType);
        // Garantir que o companyType esteja no payload
        asaasPayload.companyType = body.companyType;
      }

      // Verificar se o campo foi adicionado corretamente
      console.log('companyType após ajuste:', asaasPayload.companyType);
      // Verificar se o campo está presente no payload final
      const payloadKeys = Object.keys(asaasPayload);
      console.log('Campos no payload:', payloadKeys);
      console.log('companyType está no payload?', payloadKeys.includes('companyType'));
    }

    console.log('Sending data to Asaas API:', JSON.stringify(asaasPayload, null, 2));
    console.log('companyType está presente no payload?', asaasPayload.hasOwnProperty('companyType'));
    console.log('companyType valor:', asaasPayload.companyType);

    try {
      // Make the API request to Asaas
      // Garantir que o campo companyType esteja presente no payload para CNPJ
      if (isCnpjDocument && !asaasPayload.companyType) {
        asaasPayload.companyType = "MEI";
      }

      // Converter o payload para string
      const payloadString = JSON.stringify(asaasPayload);
      console.log('Payload final (string):', payloadString);

      const response = await fetch(`${baseUrl}/v3/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasToken  // Corrigido: underscore em vez de hífen
        },
        body: payloadString
      });

      // Get the response data
      const data = await response.json();
      console.log('Asaas API response:', data);

      // Salvar os dados na tabela asaas_onboarding_v2
      if (response.status === 200 || response.status === 201) {
        try {
          // Extrair o user_id do cabeçalho de autorização, se disponível
          const authHeader = req.headers.get('authorization');
          let userId = null;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            // Tentar extrair o user_id do token JWT
            // Isso é apenas um placeholder, a implementação real dependeria da estrutura do seu token
            // userId = extractUserIdFromToken(authHeader.substring(7));
          }

          // Verificar os campos disponíveis no objeto data
          console.log('Campos disponíveis no objeto data:', Object.keys(data));

          // Preparar os dados para inserção na tabela com todos os campos
          const onboardingRecord = {
            user_id: userId,
            // Campos específicos do retorno da API Asaas
            object: data.object || null,
            asaas_id: data.id || null,
            name: data.name || null,
            email: data.email || null,
            login_email: data.loginEmail || null,
            phone: data.phone || null,
            mobile_phone: data.mobilePhone || null,
            address: data.address || null,
            address_number: data.addressNumber || null,
            complement: data.complement || null,
            province: data.province || null,
            postal_code: data.postalCode || null,
            cpf_cnpj: data.cpfCnpj || null,
            birth_date: data.birthDate || null,
            person_type: data.personType || null,
            company_type: data.companyType || null,
            city: data.city || null,
            state: data.state || null,
            country: data.country || null,
            site: data.site || null,
            wallet_id: data.walletId || null,
            api_key: data.apiKey || null,
            account_number: data.accountNumber || null,
            income_value: data.incomeValue || null,
            commercial_info_expiration: data.commercialInfoExpiration || null,
            // Campo para armazenar o JSON completo (para backup/referência)
            asaas_account: data,
            // Campos de controle
            status: 'active'
          };

          console.log('Dados preparados para inserção:', onboardingRecord);

          // Inserir os dados na tabela asaas_onboarding_v2
          const { data: insertedData, error: insertError } = await supabase.from('asaas_onboarding_v2').insert([
            onboardingRecord
          ]).select();

          if (insertError) {
            console.error('Erro ao inserir dados na tabela asaas_onboarding_v2:', insertError);
            throw insertError;
          }

          console.log('Dados inseridos com sucesso na tabela asaas_onboarding_v2:', insertedData);

          // Criar o usuário no sistema de autenticação do Supabase
          // Gerar uma senha aleatória para o usuário
          const generateRandomPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let password = '';
            for (let i = 0; i < 12; i++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
          };

          // Verificar se o usuário já existe
          const { data: existingUser, error: userCheckError } = await supabase.from('profiles').select('*').eq('document_number', body.cpfCnpj).maybeSingle();

          if (userCheckError) {
            console.error('Erro ao verificar se o usuário já existe:', userCheckError);
          }

          let newUserId = null;

          // Se o usuário não existir, criar um novo
          if (!existingUser) {
            const password = body.password || generateRandomPassword();

            // Criar o usuário no auth.users
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
              email: body.email,
              password: password,
              email_confirm: true,
              user_metadata: {
                full_name: body.name,
                document_number: body.cpfCnpj,
                document_type: isCnpjDocument ? 'CNPJ' : 'CPF'
              }
            });

            if (authError) {
              console.error('Erro ao criar usuário na autenticação:', authError);
              throw authError;
            }

            console.log('Usuário criado com sucesso na autenticação:', authUser);
            newUserId = authUser.user.id;

            // Criar o perfil do usuário na tabela profiles
            const profileData = {
              id: authUser.user.id,
              full_name: body.name,
              email: body.email,
              document_number: body.cpfCnpj,
              document_type: isCnpjDocument ? 'CNPJ' : 'CPF',
              phone_number: body.mobilePhone,
              birth_date: body.birthDate,
              address_postal_code: body.postalCode,
              address_street: body.address,
              address_number: body.addressNumber,
              address_complement: body.complement,
              address_neighborhood: body.province,
              address_state: body.state,
              asaas_id: data.id,
              api_key: data.apiKey,
              wallet_id: data.walletId,
              status: 'pending'
            };

            console.log('Tentando criar perfil na tabela profiles com dados:', JSON.stringify(profileData, null, 2));

            // Verificação simplificada da existência da tabela profiles
            console.log('Tentando criar perfil na tabela profiles...');
            const { data: profileInserted, error: profileError } = await supabase.from('profiles').insert([
              profileData
            ]).select();

            if (profileError) {
              console.error('Erro ao criar perfil do usuário:', profileError);
              console.error('Detalhes do erro:', JSON.stringify(profileError, null, 2));

              // Tentar uma abordagem alternativa se a inserção falhar
              console.log('Tentando abordagem alternativa com upsert...');
              try {
                const { data: upsertData, error: upsertError } = await supabase.from('profiles').upsert([
                  profileData
                ]).select();

                if (upsertError) {
                  console.error('Erro ao fazer upsert do perfil:', upsertError);
                  console.error('Detalhes do erro de upsert:', JSON.stringify(upsertError, null, 2));
                  throw upsertError;
                }

                console.log('Perfil do usuário criado com sucesso via upsert:', upsertData);
              } catch (upsertCatchError) {
                console.error('Erro capturado durante upsert:', upsertCatchError);
                throw upsertCatchError;
              }
            } else {
              console.log('Perfil do usuário criado com sucesso via insert:', profileInserted);
            }

            // Atualizar o registro de onboarding com o ID do usuário
            const { error: updateError } = await supabase.from('asaas_onboarding_v2').update({
              user_id: newUserId
            }).eq('asaas_id', data.id);

            if (updateError) {
              console.error('Erro ao atualizar registro de onboarding com o ID do usuário:', updateError);
            }
          } else {
            console.log('Usuário já existe:', existingUser);

            // Atualizar o perfil existente com os dados do Asaas
            console.log('Atualizando perfil existente com ID:', existingUser.id);
            const updateData = {
              asaas_id: data.id,
              api_key: data.apiKey,
              wallet_id: data.walletId,
              status: 'pending',
              document_type: isCnpjDocument ? 'CNPJ' : 'CPF',
              // Atualizar outros campos que possam ter mudado
              full_name: body.name,
              email: body.email,
              phone_number: body.mobilePhone,
              birth_date: body.birthDate,
              address_postal_code: body.postalCode,
              address_street: body.address,
              address_number: body.addressNumber,
              address_complement: body.complement,
              address_neighborhood: body.province,
              address_state: body.state
            };

            console.log('Dados para atualização:', JSON.stringify(updateData, null, 2));
            const { data: updateResult, error: updateProfileError } = await supabase.from('profiles').update(updateData).eq('id', existingUser.id).select();

            if (updateProfileError) {
              console.error('Erro ao atualizar perfil existente:', updateProfileError);
              console.error('Detalhes do erro de atualização:', JSON.stringify(updateProfileError, null, 2));

              // Tentar uma abordagem alternativa
              console.log('Tentando atualizar usando document_number em vez de id...');
              const { data: altUpdateResult, error: altUpdateError } = await supabase.from('profiles').update(updateData).eq('document_number', body.cpfCnpj).select();

              if (altUpdateError) {
                console.error('Erro na atualização alternativa:', altUpdateError);
              } else {
                console.log('Perfil atualizado com sucesso via document_number:', altUpdateResult);
              }
            } else {
              console.log('Perfil existente atualizado com sucesso:', updateResult);
            }

            // Atualizar o registro de onboarding com o ID do usuário existente
            const { error: updateError } = await supabase.from('asaas_onboarding_v2').update({
              user_id: existingUser.id
            }).eq('asaas_id', data.id);

            if (updateError) {
              console.error('Erro ao atualizar registro de onboarding com o ID do usuário existente:', updateError);
            }
          }

          // Fazer uma segunda requisição para obter os documentos e o link de onboarding
          try {
            console.log('Aguardando 15 segundos antes de obter documentos e link de onboarding...');
            
            // Aguardar 15 segundos conforme recomendado pela documentação
            await new Promise(resolve => setTimeout(resolve, 15000));
            
            console.log('Obtendo documentos e link de onboarding...');
            const documentsResponse = await fetch(`${baseUrl}/v3/myAccount/documents`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'access_token': data.apiKey // Usar a apiKey da conta recém-criada
              }
            });

            // Verificar se a resposta é JSON antes de tentar fazer o parse
            const contentType = documentsResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const textResponse = await documentsResponse.text();
              console.error('Resposta não-JSON recebida:', textResponse.substring(0, 200));
              throw new Error('Resposta não-JSON recebida da API do Asaas');
            }

            const documentsData = await documentsResponse.json();
            console.log('Documentos obtidos:', documentsData);

            // Extrair o link de onboarding e a data de expiração do primeiro documento
            let onboardingUrl = null;
            let onboardingUrlExpirationDate = null;

            if (documentsData && documentsData.data && documentsData.data.length > 0) {
              onboardingUrl = documentsData.data[0].onboardingUrl;
              onboardingUrlExpirationDate = documentsData.data[0].onboardingUrlExpirationDate;
            }

            // Atualizar o registro com os dados de documentos e o link de onboarding
            if (documentsData && onboardingUrl) {
              const documentUpdateData = {
                document_data: documentsData,
                onboarding_url: onboardingUrl,
                onboarding_url_expiration_date: onboardingUrlExpirationDate,
                documents_status: 'pending',
                updated_at: new Date().toISOString()
              };

              console.log('Atualizando registro com dados de documentos:', documentUpdateData);
              const { error: documentError } = await supabase.from('asaas_onboarding_v2').update(documentUpdateData).eq('asaas_id', data.id);

              if (documentError) {
                console.error('Erro ao atualizar registro com dados de documentos:', documentError);
              } else {
                console.log('Registro atualizado com sucesso com os dados de documentos');
              }
            }

            // Retornar uma resposta de sucesso com os dados da conta e o link de onboarding
            return new Response(JSON.stringify({
              success: true,
              message: 'Conta criada com sucesso no Asaas',
              data: data,
              documents: documentsData,
              onboardingUrl: onboardingUrl,
              onboardingUrlExpirationDate: onboardingUrlExpirationDate
            }), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              },
              status: 200
            });
          } catch (documentError) {
            console.error('Erro ao obter documentos:', documentError);
            // Mesmo que haja erro na segunda requisição, retornamos sucesso na criação da conta
            // mas indicamos que houve erro ao obter o link de onboarding
            return new Response(JSON.stringify({
              success: true,
              message: 'Conta criada com sucesso no Asaas, mas houve erro ao obter o link de onboarding',
              data: data,
              documentError: documentError.message
            }), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              },
              status: 200
            });
          }
        } catch (dbError) {
          console.error('Error in database operation:', dbError);
          // Retornar uma resposta de erro
          return new Response(JSON.stringify({
            success: false,
            message: 'Erro ao salvar dados no banco de dados',
            error: dbError.message,
            data: data
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: 500
          });
        }
      } else {
        // Retornar a resposta da API Asaas em caso de erro
        return new Response(JSON.stringify({
          success: false,
          message: 'Erro ao criar conta no Asaas',
          error: data
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: response.status
        });
      }
    } catch (error) {
      console.error('Error in Asaas onboarding:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Erro interno no servidor',
        error: error.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
  } catch (error) {
    console.error('Error in Asaas onboarding:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro interno no servidor',
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
