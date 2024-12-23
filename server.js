const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const CELCOIN_API_URL = 'https://sandbox.openfinance.celcoin.dev';
const CELCOIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiI3Mzg3YmU1Y2RiLnJvc2UuY2VsY29pbmFwaS52NSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJyb3NlIiwidGVuYW50X3VzZXIiOiJ0aUlSSXIrcng4SFBOSHVtUmNFeVE1d3NBcU1XYVZOek5FbkMvajM5cEpYdmlmYVRDK3c1M25OVDFkTHBRbVoxMTBNNURyZklxWEZTSStCcGRPVVZGQWhJQzdDYkFseVRuL3dBNXEzS09VdllRSmoyanYxOGJ5VmwxK3l4U01qMmd6cXk5UVBudUk2emJaeEhXbXNtSGRiVHcyUFN1Uk1YSTVRZlU2R0Y4b0JRVUNvQmVXRG5BYy9PVTNZNy9yenFTU3RITE1HUjBrUU04YTdycC9jbFdBQ29VcWMzRC9xN1JxeENXbFlOdFVnNEs2L29FOTU3a1hOVDE3ZTE4UThqMUx6R1hYaC8xUkZ3OHNOb3h0U1Y5RnZlS2gwMWpFaHRFZ0JSZEtBTmtCb29Ia0NmNzEwWk1TOEtCSjJma2lOUkZpSDRjdU1DbkZTWGNqM3FuZGVDSGV3cTlLM0pmNVFmbDMxYlhrVVVXc3RadkpYcThMalF4YlhzZEJscDhFczlrNldrL0ROdHZ5ZFR2QUx6NVg1Mi82ek5qVjlXWUlDTVVzTjR4YTlHNUJCSVZKMERXNXl0VWdnZWJRU2g5RDJsQzB3bEVyMitYY09oejNFZ1J3cE95UVRHWkFqSkZBZzBRVUZUTHlaTGU2dGZlSGZyUTMwWHBJTXJuWFkrcXZDNndNOUNQWXM2UW00Q1JBNjBVYnFvUDBlVmdNcktUcjI0TE8xUmY5TWYyazJmNS82eEZWWnJhYVVSM0srZWt2R3RTZXM5eDUvSS9CODN1WEF6b1IxWHdhaHlUQTh1djV3aXVtOHlXL3ROdy9tNUdYWG1oSU96dHJBMmNuRVZQZkVYWGpGQTA3VGs4b1ZneGIxQnRKamI0L3RMaFRKbG1LWlB5N2MzM2UyWmdSRT0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiNWZlOGM4NzdjNTI3NGNhNDk3YWYiLCJleHAiOjE3MzQwMjgzNTAsImlzcyI6IkNlbGNvaW5BUEkiLCJhdWQiOiJDZWxjb2luQVBJIn0.tjGXyaDMxo2bBf9Ln77RGwpPATDePX90Z0FhUYhqPZM';

// Rota raiz para teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor proxy está funcionando!' });
});

app.post('/onboarding/v1/onboarding-proposal/natural-person', async (req, res) => {
  try {
    console.log('Recebendo requisição de onboarding:', JSON.stringify(req.body, null, 2));
    
    const headers = {
      'Authorization': `Bearer ${CELCOIN_TOKEN}`,
      'accept': 'application/json',
      'content-type': 'application/json'
    };
    
    console.log('Headers da requisição:', {
      ...headers,
      'Authorization': headers.Authorization.substring(0, 40) + '...'
    });
    console.log('URL da requisição:', `${CELCOIN_API_URL}/onboarding/v1/onboarding-proposal/natural-person`);
    
    const response = await axios.post(
      `${CELCOIN_API_URL}/onboarding/v1/onboarding-proposal/natural-person`,
      req.body,
      { headers }
    );
    
    console.log('Resposta da Celcoin:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Erro detalhado no proxy:');
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', error.response?.data);
    console.error('Mensagem:', error.message);
    
    res.status(error.response?.status || 500).json({
      error: true,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor proxy rodando em http://localhost:${port}`);
  console.log('Configurações:');
  console.log('- URL da API:', CELCOIN_API_URL);
  console.log('- Token configurado:', CELCOIN_TOKEN.substring(0, 20) + '...');
}); 