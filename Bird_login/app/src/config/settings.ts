// BIRD System - Configurações Globais

export const SETTINGS = {
  // Nome do sistema
  APP_NAME: 'BIRD',
  
  // Versão
  VERSION: '1.0.0',
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: 'bird_token',
    USER_KEY: 'bird_user',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas em ms
  },
  
  // Configurações de API
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
  
  // Configurações de tema
  THEME: {
    PRIMARY_COLOR: '#3b82f6',
    SECONDARY_COLOR: '#10b981',
    DARK_MODE: false,
  },
} as const;

export default SETTINGS;
