/**
 * Template para emails do aplicativo bancário
 * Mantém o padrão visual consistente com o aplicativo
 */

// Função para gerar o HTML do email
export const generateEmailTemplate = ({
  title,
  greeting,
  mainText,
  buttonText,
  buttonUrl,
  features = [],
  footerText
}) => {
  // Cores do aplicativo
  const colors = {
    primary: '#682145', // Roxo escuro
    secondary: '#E91E63', // Rosa
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    darkGray: '#333333',
    textColor: '#333333'
  };

  // Gerar itens de recursos/vantagens
  const featuresHtml = features.map(feature => `
    <tr>
      <td style="padding: 10px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="30" valign="top">
              <div style="background-color: ${colors.secondary}; color: ${colors.white}; width: 24px; height: 24px; border-radius: 12px; text-align: center; line-height: 24px;">
                <img src="${feature.icon || 'https://example.com/check-icon.png'}" alt="✓" width="14" height="14" style="margin-top: 5px;" />
              </div>
            </td>
            <td style="padding-left: 10px;">
              <p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-weight: 600; font-size: 14px; color: ${colors.textColor};">
                ${feature.title}
              </p>
              ${feature.description ? `<p style="margin: 5px 0 0 0; font-family: 'Raleway', Arial, sans-serif; font-size: 13px; color: ${colors.textColor}; opacity: 0.8;">
                ${feature.description}
              </p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Template HTML completo
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap');
        body { margin: 0; padding: 0; font-family: 'Raleway', Arial, sans-serif; }
        .button { background-color: ${colors.secondary}; color: ${colors.white}; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; text-align: center; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f0f0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: ${colors.white};">
        <!-- Header -->
        <tr>
          <td style="background-color: ${colors.primary}; padding: 20px 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <img src="https://example.com/logo.png" alt="Logo" width="50" height="30" style="display: block;" />
                </td>
                <td align="right" style="color: ${colors.white}; font-family: 'Raleway', Arial, sans-serif; font-size: 16px; font-weight: 600;">
                  O Banco das Mulheres
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Banner Image (opcional) -->
        ${title.image ? `
        <tr>
          <td>
            <img src="${title.image}" alt="Banner" width="100%" style="display: block;" />
          </td>
        </tr>
        ` : ''}
        
        <!-- Main Content -->
        <tr>
          <td style="padding: 30px 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <!-- Greeting -->
              <tr>
                <td style="padding-bottom: 20px;">
                  <p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 16px; color: ${colors.textColor};">
                    ${greeting}
                  </p>
                </td>
              </tr>
              
              <!-- Main Text -->
              <tr>
                <td style="padding-bottom: 30px;">
                  <p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: ${colors.textColor};">
                    ${mainText}
                  </p>
                </td>
              </tr>
              
              <!-- CTA Button -->
              ${buttonText ? `
              <tr>
                <td style="padding-bottom: 30px; text-align: center;">
                  <a href="${buttonUrl}" class="button" style="background-color: ${colors.secondary}; color: ${colors.white}; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; text-align: center; font-family: 'Raleway', Arial, sans-serif; font-size: 14px;">
                    ${buttonText}
                  </a>
                </td>
              </tr>
              ` : ''}
              
              <!-- Features/Benefits Section -->
              ${features.length > 0 ? `
              <tr>
                <td style="padding: 20px 0; border-top: 1px solid #eaeaea;">
                  <p style="margin: 0 0 15px 0; font-family: 'Raleway', Arial, sans-serif; font-size: 16px; font-weight: 600; color: ${colors.textColor};">
                    Veja as vantagens disponíveis:
                  </p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    ${featuresHtml}
                  </table>
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background-color: #f5f5f5; padding: 20px 24px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 12px; color: #666666;">
              ${footerText || '© 2025 O Banco das Mulheres. Todos os direitos reservados.'}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Exemplos de uso
export const emailExamples = {
  welcome: {
    title: 'Bem-vindo ao O Banco das Mulheres',
    greeting: 'Olá, João Silva!',
    mainText: 'Sua conta foi criada com sucesso. Agora você pode aproveitar todos os benefícios do nosso banco digital.',
    buttonText: 'ACESSAR MINHA CONTA',
    buttonUrl: 'https://example.com/login',
    features: [
      {
        title: 'Transferências gratuitas',
        description: 'Até 100 TEDs e DOCs sem custo por mês'
      },
      {
        title: 'PIX grátis',
        description: 'Ilimitado para qualquer banco'
      },
      {
        title: 'Cartão sem anuidade',
        description: 'Cartão virtual para compras online'
      }
    ]
  },
  
  transactionConfirmation: {
    title: 'Confirmação de Transação',
    greeting: 'Olá, João Silva!',
    mainText: 'Sua transação foi realizada com sucesso. Confira os detalhes abaixo.',
    features: [
      {
        title: 'Valor: R$ 500,00',
      },
      {
        title: 'Destinatário: Maria Oliveira',
      },
      {
        title: 'Data: 20/03/2025 às 16:30',
      }
    ],
    buttonText: 'VER COMPROVANTE',
    buttonUrl: 'https://example.com/receipt'
  },
  
  onboarding: {
    title: 'Complete seu cadastro',
    greeting: 'Olá, João Silva!',
    mainText: 'Falta pouco para liberar todas as funcionalidades da sua conta empresarial.',
    buttonText: 'CONTINUAR CADASTRO',
    buttonUrl: 'https://example.com/onboarding',
    features: [
      {
        title: 'PIX grátis e ilimitado',
        description: 'Cadastre seu CNPJ, e-mail ou telefone e aproveite transações sem custos'
      },
      {
        title: 'Cartão empresarial sem anuidade',
        description: 'Sujeito a análise'
      },
      {
        title: 'Crédito descomplicado',
        description: 'Empréstimo, cheque especial e antecipação de recebíveis'
      }
    ]
  }
};

// Função para enviar email (mock)
export const sendEmail = async (to, subject, emailType, customData = {}) => {
  try {
    // Obter template base
    const templateBase = emailExamples[emailType];
    
    // Mesclar dados customizados
    const templateData = {
      ...templateBase,
      ...customData
    };
    
    // Gerar HTML do email
    const htmlContent = generateEmailTemplate(templateData);
    
    // Aqui você integraria com seu serviço de email
    // Por exemplo: AWS SES, SendGrid, Mailgun, etc.
    console.log(`Email enviado para ${to} com assunto: ${subject}`);
    
    return {
      success: true,
      message: 'Email enviado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      message: 'Erro ao enviar email',
      error
    };
  }
};
