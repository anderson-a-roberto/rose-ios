const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Servir arquivos estáticos da pasta templates
app.use(express.static(path.join(__dirname)));

// Rota para visualizar templates dinâmicos
app.get('/preview/:template', (req, res) => {
  const templateName = req.params.template;
  const { generateEmailTemplate, emailExamples } = require('./EmailTemplate');
  
  if (emailExamples[templateName]) {
    const htmlContent = generateEmailTemplate(emailExamples[templateName]);
    res.send(htmlContent);
  } else {
    res.status(404).send('Template não encontrado');
  }
});

// Rota principal com links para todos os templates
app.get('/', (req, res) => {
  // Listar todos os arquivos HTML na pasta
  const htmlFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.html'))
    .map(file => `<li><a href="${file}">${file}</a></li>`);
  
  // Listar todos os templates dinâmicos
  const { emailExamples } = require('./EmailTemplate');
  const dynamicTemplates = Object.keys(emailExamples)
    .map(template => `<li><a href="/preview/${template}">${template}</a></li>`);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Visualizador de Templates de Email</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #682145; }
        ul { padding-left: 20px; }
        li { margin-bottom: 10px; }
        a { color: #E91E63; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Visualizador de Templates de Email</h1>
      
      <h2>Templates HTML Estáticos</h2>
      <ul>
        ${htmlFiles.join('')}
      </ul>
      
      <h2>Templates Dinâmicos</h2>
      <ul>
        ${dynamicTemplates.join('')}
      </ul>
    </body>
    </html>
  `;
  
  res.send(html);
});

app.listen(port, () => {
  console.log(`Servidor de visualização de emails rodando em http://localhost:${port}`);
});
