/**
 * Utilitário para traduzir mensagens de erro técnicas em mensagens amigáveis para o usuário
 */

/**
 * Mapeia códigos de erro do banco de dados para mensagens amigáveis
 */
const dbErrorMessages = {
  // Erros de restrição de chave única
  '23505': {
    'profiles_document_number_key': 'Este CPF/CNPJ já está cadastrado no sistema.',
    'profiles_email_key': 'Este e-mail já está cadastrado no sistema.',
    'profiles_phone_number_key': 'Este número de telefone já está cadastrado no sistema.',
    'default': 'Este registro já existe no sistema.'
  },
  // Erros de violação de restrição
  '23503': {
    'default': 'Não foi possível completar a operação devido a uma restrição no sistema.'
  },
  // Erros de tipo de dados
  '22P02': {
    'default': 'Formato de dados inválido.'
  },
  // Erro padrão
  'default': 'Ocorreu um erro ao processar sua solicitação.'
};

/**
 * Mapeia erros de autenticação para mensagens amigáveis
 */
const authErrorMessages = {
  'invalid_credentials': 'E-mail ou senha incorretos.',
  'email_not_confirmed': 'Por favor, confirme seu e-mail antes de fazer login.',
  'user_not_found': 'Usuário não encontrado.',
  'user_already_registered': 'Este e-mail já está cadastrado. Por favor, faça login ou use outro e-mail.',
  'default': 'Erro de autenticação. Por favor, tente novamente.'
};

/**
 * Mapeia erros de API para mensagens amigáveis
 */
const apiErrorMessages = {
  'network_error': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'timeout': 'O servidor demorou muito para responder. Por favor, tente novamente.',
  'default': 'Ocorreu um erro ao se comunicar com o servidor.'
};

/**
 * Mapeia códigos de erro da Celcoin para mensagens amigáveis
 */
const celcoinErrorMessages = {
  'OBE038': 'Não é possível cadastrar sócios com o mesmo CPF/CNPJ.',
  'OBE001': 'Dados de cadastro incompletos ou inválidos.',
  'OBE002': 'Não foi possível validar os dados do cadastro.',
  'OBE003': 'Erro na validação dos documentos.',
  'OBE004': 'Erro na validação do endereço.',
  'OBE005': 'Erro na validação dos dados bancários.',
  'OBE006': 'Erro na validação dos dados do sócio.',
  'OBE007': 'Erro na validação dos dados da empresa.',
  'default': 'Ocorreu um erro no processamento do cadastro.'
};

/**
 * Traduz um erro do Supabase para uma mensagem amigável
 * @param {Object} error - Objeto de erro do Supabase
 * @returns {String} Mensagem de erro amigável
 */
export const getReadableError = (error) => {
  if (!error) return 'Ocorreu um erro desconhecido.';

  // Se for um erro simples com apenas uma mensagem
  if (typeof error === 'string') {
    return error;
  }

  // Verificar se é um erro da Celcoin
  if (error.message && error.message.includes('Edge Function returned a non-2xx status code')) {
    // Tentar extrair o erro da Celcoin do objeto de erro
    try {
      if (error.data && error.data.error) {
        const celcoinError = error.data.error;
        if (celcoinError.errorCode && celcoinErrorMessages[celcoinError.errorCode]) {
          return celcoinErrorMessages[celcoinError.errorCode];
        }
        if (celcoinError.message) {
          return celcoinError.message;
        }
      }
    } catch (e) {
      console.error('Erro ao processar erro da Celcoin:', e);
    }
    
    return 'Erro no processamento do cadastro. Por favor, verifique os dados e tente novamente.';
  }

  // Se for um erro com uma mensagem formatada
  if (error.message) {
    // Verificar se é um erro de duplicação de chave
    if (error.message.includes('duplicate key value violates unique constraint')) {
      // Extrair o nome da constraint
      const constraintMatch = error.message.match(/constraint "([^"]+)"/);
      const constraint = constraintMatch ? constraintMatch[1] : 'default';
      
      if (error.code && dbErrorMessages[error.code]) {
        return dbErrorMessages[error.code][constraint] || dbErrorMessages[error.code]['default'];
      }
      
      return 'Este registro já existe no sistema.';
    }

    // Verificar outros tipos de erros conhecidos
    if (error.message.includes('network error')) {
      return apiErrorMessages.network_error;
    }
    
    if (error.message.includes('timeout')) {
      return apiErrorMessages.timeout;
    }
  }

  // Verificar se é um erro de banco de dados com código
  if (error.code && dbErrorMessages[error.code]) {
    return dbErrorMessages[error.code]['default'];
  }

  // Se for um erro de autenticação
  if (error.error_description) {
    const errorType = error.error_description.toLowerCase();
    
    for (const [key, message] of Object.entries(authErrorMessages)) {
      if (errorType.includes(key)) {
        return message;
      }
    }
    
    return authErrorMessages.default;
  }

  // Verificar se é um erro de autenticação específico
  if (error.name === 'AuthApiError' && error.message) {
    if (error.message.includes('User already registered')) {
      return authErrorMessages.user_already_registered;
    }
  }

  // Erro genérico
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
};

export default {
  getReadableError
};
