import { useState, useEffect } from 'react';

const useBankSearch = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBanks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch do arquivo CSV no Supabase Storage
      const response = await fetch(
        'https://gtnnuoyimddhbklrlpje.supabase.co/storage/v1/object/public/imagens/ParticipantesSTR%20(1).csv'
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar lista de bancos');
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      // Remove header se existir
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      const bankList = dataLines.map(line => {
        const [ispb, name, code] = line.split(',').map(field => 
          field.replace(/"/g, '').trim()
        );
        
        return {
          ispb: ispb?.trim(),
          name: name?.trim(),
          code: code?.trim()
        };
      }).filter(bank => bank.ispb && bank.name);

      setBanks(bankList);
      console.log(`Carregados ${bankList.length} bancos`);
    } catch (err) {
      console.error('Erro ao carregar bancos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  // Função para buscar banco por ISPB
  const getBankByISPB = (ispb) => {
    if (!ispb || !banks.length) return null;
    return banks.find(bank => bank.ispb === ispb.toString());
  };

  // Função para buscar banco por código
  const getBankByCode = (code) => {
    if (!code || !banks.length) return null;
    return banks.find(bank => bank.code === code.toString());
  };

  // Função para buscar banco por nome (busca parcial)
  const searchBanksByName = (searchTerm) => {
    if (!searchTerm || !banks.length) return [];
    
    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    return banks.filter(bank => {
      const normalizedName = bank.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return normalizedName.includes(normalizedSearch);
    }).slice(0, 10); // Limita a 10 resultados
  };

  // Função principal para converter ISPB em nome do banco
  const getBankNameByISPB = (ispb) => {
    const bank = getBankByISPB(ispb);
    return bank?.name || ispb; // Retorna o nome ou o ISPB original como fallback
  };

  return {
    banks,
    loading,
    error,
    getBankByISPB,
    getBankByCode,
    searchBanksByName,
    getBankNameByISPB,
    reload: loadBanks
  };
};

export default useBankSearch;
