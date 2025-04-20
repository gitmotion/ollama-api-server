export const config = {
  port: process.env.PORT || 7777,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiKeys: (process.env.API_KEYS || '').split(',').filter(key => key.length > 0)
};