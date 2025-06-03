import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../config/supabase';
import * as RootNavigation from '../navigation/RootNavigation';

// Importar o cliente de query se estiver usando React Query
// import { queryClient } from '../config/queryClient';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [hasTransactionPin, setHasTransactionPin] = useState(false);
  const lastActive = useRef(Date.now());
  const isAuthenticatedRef = useRef(false); // Ref para rastrear o estado de autenticação imediatamente
  const timeoutRef = useRef(null); // Ref para o timer de inatividade
  const appStateRef = useRef('active'); // Ref para o estado atual do app
  
  // Tempo de inatividade em milissegundos (3 minutos)
  const INACTIVITY_TIMEOUT = 3 * 60 * 1000;
  
  // Função para resetar o timer de inatividade
  const resetActivity = () => {
    // Limpar o timer existente, se houver
    if (timeoutRef.current) {
      console.log('[TIMER] Limpando timer de inatividade existente');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Configurar novo timer se o usuário estiver autenticado
    if (isAuthenticatedRef.current) {
      console.log(`[TIMER] Configurando novo timer de inatividade: ${INACTIVITY_TIMEOUT/1000} segundos`);
      timeoutRef.current = setTimeout(() => {
        console.log('[TIMER] Timer de inatividade acionado! Iniciando logout...');
        logout();
      }, INACTIVITY_TIMEOUT);
    } else {
      console.log('[TIMER] Usuário não está autenticado. Timer não configurado.');
    }
  };
  
  // Função de logout com limpeza completa do estado
  const logout = async () => {
    console.log('[LOGOUT] Iniciando processo de logout completo');
    try {
      // 1. Limpar qualquer timer existente sem criar um novo
      console.log('[LOGOUT] Limpando timers existentes');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        console.log('[LOGOUT] Timer limpo com sucesso');
      }
      
      // 2. Fazer logout no Supabase
      console.log('[LOGOUT] Chamando supabase.auth.signOut()');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[LOGOUT] Erro retornado pelo Supabase:', error);
      } else {
        console.log('[LOGOUT] Logout do Supabase realizado com sucesso');
      }
      
      // 3. Limpar caches de dados (React Query)
      // Se estiver usando React Query, descomente a linha abaixo
      // queryClient.clear();
      console.log('[LOGOUT] Caches de dados limpos');
      
      // 4. Limpar quaisquer tokens armazenados localmente
      // AsyncStorage.removeItem('celcoinToken');
      // AsyncStorage.removeItem('outroToken');
      
      // 5. Resetar estados globais específicos
      // setChargeState(null);
      // setPixState(null);
      console.log('[LOGOUT] Estados globais resetados');
      
      // 6. Forçar reset da navegação para a tela inicial usando a mesma abordagem do logout manual
      console.log('[LOGOUT] Resetando navegação para Welcome');
      if (RootNavigation.navigationRef.current) {
        RootNavigation.navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
        console.log('[LOGOUT] Navegação resetada com sucesso');
      } else {
        console.error('[LOGOUT] Referência de navegação não disponível');
      }
      
      // 7. Atualizar o estado de autenticação por último
      console.log('[LOGOUT] Atualizando estado local para deslogado');
      isAuthenticatedRef.current = false; // Atualizar a ref imediatamente
      setIsAuthenticated(false);
      setUser(null);
      console.log('[LOGOUT] Estado atualizado: isAuthenticated =', isAuthenticatedRef.current);
    } catch (error) {
      console.error('[LOGOUT] Erro ao fazer logout:', error);
      // Mesmo com erro, atualizar o estado local e forçar navegação
      console.log('[LOGOUT] Forçando atualização do estado local após erro');
      
      // Limpar timer em caso de erro
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Forçar navegação mesmo em caso de erro
      if (RootNavigation.navigationRef.current) {
        RootNavigation.navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
        console.log('[LOGOUT] Navegação resetada após erro');
      } else {
        console.error('[LOGOUT] Referência de navegação não disponível após erro');
      }
      
      // Atualizar estado
      isAuthenticatedRef.current = false;
      setIsAuthenticated(false);
      setUser(null);
      
      // Re-throw para permitir tratamento específico em outros lugares
      throw error;
    }
  };
  
  // Verificar sessão atual
  const checkSession = async () => {
    console.log('[SESSION] Verificando sessão inicial...');
    try {
      // Verificar sessão no Supabase
      console.log('[SESSION] Chamando supabase.auth.getSession()');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[SESSION] Erro ao obter sessão:', error);
      }
      
      const session = data?.session;
      console.log(`[SESSION] Sessão válida encontrada: ${!!session}`);
      
      if (session) {
        console.log('[SESSION] Atualizando estado para autenticado');
        isAuthenticatedRef.current = true; // Atualizar a ref imediatamente
        setIsAuthenticated(true);
        setUser(session.user);
        setSession(session);
        console.log('[SESSION] Estado atualizado. Usuário autenticado.');
        
        // Se o usuário está autenticado, verificar se tem PIN configurado
        console.log('[SESSION] Usuário autenticado, verificando PIN após checkSession...');
        checkTransactionPin(session.user, true); // Passando true para isUserAuthenticated
      } else {
        console.log('[SESSION] Nenhuma sessão válida. Definindo estado como deslogado.');
        isAuthenticatedRef.current = false; // Atualizar a ref imediatamente
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('[SESSION] Erro ao verificar sessão:', error);
      console.log('[SESSION] Definindo estado como deslogado após erro.');
      isAuthenticatedRef.current = false; // Atualizar a ref imediatamente
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    }
  };
  
  // A verificação de PIN foi movida para o TransactionPasswordContext
  
  // Monitorar mudanças no estado do aplicativo
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      console.log(`[APPSTATE] Mudou de ${appStateRef.current} para ${nextAppState}`);
      
      if (nextAppState.match(/inactive|background/)) {
        // App foi para background - fazer logout imediatamente se estiver autenticado
        console.log(`[APPSTATE] App foi para background. isAuthenticated = ${isAuthenticatedRef.current}`);
        if (isAuthenticatedRef.current) {
          console.log('[APPSTATE] Iniciando logout por segurança (background)');
          try {
            await logout();
            console.log('[APPSTATE] Logout por background concluído com sucesso');
            // Verificar se o estado foi realmente atualizado
            console.log(`[APPSTATE] Estado após logout: isAuthenticated = ${isAuthenticatedRef.current}`);
          } catch (error) {
            console.error('[APPSTATE] Erro ao fazer logout durante mudança de estado:', error);
            // Forçar atualização do estado mesmo se o logout falhar
            console.log('[APPSTATE] Forçando atualização do estado após erro');
            
            // Limpar timer em caso de erro
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            
            // Forçar navegação mesmo em caso de erro
            if (RootNavigation.navigationRef.current) {
              RootNavigation.navigationRef.current.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
              console.log('[APPSTATE] Navegação resetada após erro');
            } else {
              console.error('[APPSTATE] Referência de navegação não disponível após erro');
            }
            
            // Atualizar estado
            isAuthenticatedRef.current = false;
            setIsAuthenticated(false);
            setUser(null);
            
            // Re-throw para permitir tratamento específico em outros lugares
            throw error;
          }
        }
      } else if (nextAppState === 'active' && appStateRef.current.match(/inactive|background/)) {
        // App voltou para o foreground - verificar sessão e resetar timer
        console.log('[APPSTATE] App voltou para o foreground. Verificando sessão...');
        try {
          // Verificar se a sessão ainda é válida
          console.log('[APPSTATE] Chamando supabase.auth.getSession()');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[APPSTATE] Erro ao obter sessão:', error);
          }
          
          const session = data?.session;
          console.log(`[APPSTATE] Sessão válida: ${!!session}`);
          
          if (session) {
            console.log('[APPSTATE] Sessão válida encontrada. Atualizando estado.');
            isAuthenticatedRef.current = true; // Atualizar a ref imediatamente
            setIsAuthenticated(true);
            setUser(session.user);
            setSession(session);
            console.log('[APPSTATE] Resetando timer de inatividade...');
            resetActivity();
          } else if (isAuthenticatedRef.current) {
            // Se não há sessão válida mas o estado ainda indica autenticado
            console.log('[APPSTATE] Sessão inválida detectada, mas estado indica autenticado. Fazendo logout local.');
            isAuthenticatedRef.current = false; // Atualizar a ref imediatamente
            setIsAuthenticated(false);
            setUser(null);
            setSession(null);
          } else {
            console.log('[APPSTATE] Usuário já está deslogado. Nenhuma ação necessária.');
          }
        } catch (error) {
          console.error('[APPSTATE] Erro ao verificar sessão após retorno ao foreground:', error);
          // Em caso de erro, melhor fazer logout por segurança
          console.log('[APPSTATE] Forçando logout local após erro de verificação de sessão');
          isAuthenticatedRef.current = false; // Atualizar a ref imediatamente
          setIsAuthenticated(false);
          setUser(null);
          setSession(null);
        }
      }
      
      appStateRef.current = nextAppState;
    };
    
    // Registrar o listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      handleAppStateChange(nextAppState);
    });
    
    // Iniciar o timer de inatividade se o usuário estiver autenticado
    if (isAuthenticatedRef.current) {
      resetActivity();
    }
    
    // Verificar sessão inicial
    checkSession();
    
    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Função para lidar com mudanças no estado de autenticação
  const handleAuthChange = async (event, session) => {
    const newAuthState = !!session?.user;
    console.log(`[AUTH] Evento de autenticação: ${event}`);
    console.log(`[AUTH] Estado atualizado: isAuthenticated = ${newAuthState}`);
    
    // Atualizar o estado
    isAuthenticatedRef.current = newAuthState;
    setIsAuthenticated(newAuthState);
    setUser(session?.user || null);
    setSession(session);
    
    // Se o usuário acabou de fazer login, resetar o timer de inatividade
    if (newAuthState && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      console.log('[AUTH] Usuário autenticado');
      
      // Resetar o timer de inatividade
      resetActivity();
    } else if (!newAuthState && timeoutRef.current) {
      // Se o usuário deslogou, limpar o timer
      console.log('[AUTH] Usuário deslogado, limpando timer');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  useEffect(() => {
    console.log('[SESSION] Verificando sessão inicial...');
    checkSession();

    // Configurar listener para eventos de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH] Evento de autenticação:', event);
      handleAuthChange(event, session);
    });

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Sincronizar o estado do React com a ref quando o estado muda
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    console.log(`[STATE] Estado de autenticação atualizado: ${isAuthenticated}`);
  }, [isAuthenticated]);

  // Exportar funções e estado
  const value = {
    isAuthenticated,
    isLoading,
    user,
    session,
    hasTransactionPin,
    setHasTransactionPin,
    logout,
    checkSession,
  };
  
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
