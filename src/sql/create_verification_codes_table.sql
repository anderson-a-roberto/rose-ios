-- Criação da tabela verification_codes para armazenar códigos de verificação de dois fatores
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  
  -- Índices para melhorar a performance das consultas
  CONSTRAINT verification_codes_user_id_code_idx UNIQUE (user_id, code)
);

-- Adicionar coluna two_factor_enabled à tabela profiles se ainda não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Criar políticas de segurança RLS (Row Level Security)
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios códigos
CREATE POLICY verification_codes_select_policy ON verification_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios códigos
CREATE POLICY verification_codes_insert_policy ON verification_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios códigos
CREATE POLICY verification_codes_update_policy ON verification_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE verification_codes IS 'Tabela para armazenar códigos de verificação para autenticação de dois fatores';
COMMENT ON COLUMN verification_codes.user_id IS 'ID do usuário associado ao código de verificação';
COMMENT ON COLUMN verification_codes.code IS 'Código de verificação de 6 dígitos';
COMMENT ON COLUMN verification_codes.created_at IS 'Data e hora de criação do código';
COMMENT ON COLUMN verification_codes.expires_at IS 'Data e hora de expiração do código';
COMMENT ON COLUMN verification_codes.is_used IS 'Indica se o código já foi utilizado';
