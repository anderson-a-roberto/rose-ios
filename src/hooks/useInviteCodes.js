import { useState } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook para gerenciar a validação de códigos de convite
 * Implementa a mesma lógica do projeto web
 */
export const useInviteCodes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Valida um código de convite
   * @param {string} code - Código de convite a ser validado
   * @param {string} documentNumber - Número do documento (CPF/CNPJ) do usuário
   * @returns {Promise<{success: boolean, message: string, error?: string}>}
   */
  const validateInviteCode = async (code, documentNumber) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!code || !documentNumber) {
        throw new Error('Código de convite e documento são obrigatórios');
      }

      // 1. Buscar código (case-insensitive)
      const { data: inviteCode, error: fetchError } = await supabase
        .from('invite_codes')
        .select('*')
        .ilike('code', code)
        .maybeSingle();

      if (fetchError) {
        throw new Error('Erro ao buscar código de convite');
      }

      if (!inviteCode) {
        return {
          success: false,
          message: 'Código de convite não encontrado'
        };
      }

      // 2. Verificar se o código já foi usado pelo mesmo documento (reentrada permitida)
      if (inviteCode.used_by_document === documentNumber) {
        return {
          success: true,
          message: 'Acesso permitido (código já utilizado por você)'
        };
      }

      // 3. Verificar status do código
      if (inviteCode.status !== 'active') {
        return {
          success: false,
          message: 'Código de convite inválido'
        };
      }

      // 4. Verificar expiração
      if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
        return {
          success: false,
          message: 'Código de convite expirado'
        };
      }

      // 5. Verificar limite de usos
      if (inviteCode.max_uses && inviteCode.current_uses >= inviteCode.max_uses) {
        return {
          success: false,
          message: 'Código de convite esgotado (limite de usos atingido)'
        };
      }

      // 6. Verificar se já foi usado por outra pessoa
      if (inviteCode.used_by_document && inviteCode.used_by_document !== documentNumber) {
        return {
          success: false,
          message: 'Código já utilizado por outra pessoa'
        };
      }

      // 7. Atualizar contadores e status
      const now = new Date().toISOString();
      const updates = {
        current_uses: inviteCode.current_uses + 1,
        used_at: now,
        used_by_document: documentNumber
      };

      // Se atingiu o limite de usos, marcar como usado
      if (inviteCode.max_uses && inviteCode.current_uses + 1 >= inviteCode.max_uses) {
        updates.status = 'used';
      }

      const { error: updateError } = await supabase
        .from('invite_codes')
        .update(updates)
        .eq('id', inviteCode.id);

      if (updateError) {
        throw new Error('Erro ao atualizar código de convite');
      }

      return {
        success: true,
        message: 'Código de convite validado com sucesso'
      };
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        message: 'Erro ao validar código de convite',
        error: err.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { validateInviteCode, isLoading, error };
};

export default useInviteCodes;
