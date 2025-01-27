const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatValue = (value, type) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

  return type === 'CREDIT' ? `+${formattedValue}` : `-${formattedValue}`;
};

const getTransactionType = (movementType) => {
  const types = {
    'TEFTRANSFERIN': 'Transferência TEF Recebida',
    'TEDTRANSFEROUT': 'Transferência TED Enviada',
    'TEFTRANSFEROUT': 'Transferência TEF Enviada',
    'ENTRYCREDIT': 'Depósito',
    'PIXCREDIT': 'PIX Recebido',
    'PIXDEBIT': 'PIX Enviado'
  };
  return types[movementType] || movementType;
};

export const generateReceiptHtml = (transaction) => {
  const isCredit = ['TEFTRANSFERIN', 'ENTRYCREDIT', 'PIXCREDIT'].includes(transaction.movementType);
  const valueColor = isCredit ? '#4CAF50' : '#F44336';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .receipt {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        .title {
          font-size: 24px;
          color: #333;
          margin: 0 0 10px;
        }
        .transaction-id {
          font-size: 12px;
          color: #666;
        }
        .row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .label {
          color: #666;
        }
        .value {
          font-weight: 500;
          color: #333;
        }
        .amount {
          color: ${valueColor};
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1 class="title">Comprovante ${isCredit ? 'de Depósito' : 'de Transferência'}</h1>
          <div class="transaction-id">ID: ${transaction.id}</div>
        </div>

        <div class="row">
          <span class="label">Data e Hora:</span>
          <span class="value">${formatDate(transaction.createDate)}</span>
        </div>

        <div class="row">
          <span class="label">Tipo de Operação:</span>
          <span class="value">${getTransactionType(transaction.movementType)}</span>
        </div>

        <div class="row">
          <span class="label">Valor:</span>
          <span class="amount">${formatValue(transaction.amount, isCredit ? 'CREDIT' : 'DEBIT')}</span>
        </div>

        ${transaction.description ? `
        <div class="row">
          <span class="label">Descrição:</span>
          <span class="value">${transaction.description}</span>
        </div>
        ` : ''}

        ${transaction.sender ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #333;">Dados do Remetente</h3>
          <div class="row">
            <span class="label">Nome:</span>
            <span class="value">${transaction.sender.name}</span>
          </div>
          <div class="row">
            <span class="label">CPF/CNPJ:</span>
            <span class="value">${transaction.sender.documentNumber}</span>
          </div>
          ${transaction.sender.bankName ? `
          <div class="row">
            <span class="label">Banco:</span>
            <span class="value">${transaction.sender.bankName}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}

        ${transaction.recipient ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #333;">Dados do Destinatário</h3>
          <div class="row">
            <span class="label">Nome:</span>
            <span class="value">${transaction.recipient.name}</span>
          </div>
          <div class="row">
            <span class="label">CPF/CNPJ:</span>
            <span class="value">${transaction.recipient.documentNumber}</span>
          </div>
          ${transaction.recipient.bankName ? `
          <div class="row">
            <span class="label">Banco:</span>
            <span class="value">${transaction.recipient.bankName}</span>
          </div>
          <div class="row">
            <span class="label">Agência:</span>
            <span class="value">${transaction.recipient.branch}</span>
          </div>
          <div class="row">
            <span class="label">Conta:</span>
            <span class="value">${transaction.recipient.account}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <p>Este documento é uma representação digital do comprovante.</p>
          <p>Guarde este documento para futuras referências.</p>
          <p style="font-family: monospace;">Validação Digital: ${transaction.id}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
