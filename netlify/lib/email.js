const https = require('https');

function getEmailConfig() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Envio de email não configurado. Configure RESEND_API_KEY no Netlify e publique novamente.');
  }

  return {
    apiKey,
    from: (process.env.EMAIL_FROM || '').trim() || 'PoweringEG Platform <noreply@poweringeg.pt>',
    to: ((process.env.ADMIN_EMAIL || '').trim() || 'mamorim@expressglass.pt')
      .split(',').map(address => address.trim()).filter(Boolean)
  };
}

async function sendEmail(pdfBuffer, data) {
  const config = getEmailConfig();
  const totalKM = data.deslocacoes.reduce((sum, d) => sum + parseFloat(d.klm), 0);
  const totalDespesas = (totalKM * 0.36).toFixed(2);
  const localidades = data.deslocacoes.map(d => d.localidade).join(', ');
  const body = JSON.stringify({
    from: config.from,
    to: config.to,
    subject: `MAPA KLM - ${data.colaborador_nome}`,
    text: `Novo relatório de KM submetido por ${data.colaborador_nome}.\n\nDetalhes:\n- Loja: ${data.loja}\n- Matrícula: ${data.matricula}\n- Localidades: ${localidades}\n- Total KM: ${totalKM.toFixed(2)} km\n- Total Despesas: ${totalDespesas} €\n- Número de deslocações: ${data.deslocacoes.length}`,
    attachments: [{
      filename: `Relatorio_${data.colaborador_nome.replace(/ /g, '')}_${new Date().toISOString().split('T')[0]}.pdf`,
      content: pdfBuffer.toString('base64')
    }]
  });

  return new Promise((resolve, reject) => {
    const request = https.request('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, response => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { responseBody += chunk; });
      response.on('error', () => reject(new Error('A ligação ao serviço de email foi interrompida.')));
      response.on('end', () => {
        let result;
        try {
          result = JSON.parse(responseBody);
        } catch (_) {
          reject(new Error('Resposta inválida do serviço de email.'));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300 || !result?.id) {
          const message = [401, 403].includes(response.statusCode)
            ? 'O serviço de email recusou o envio. Verifique RESEND_API_KEY e EMAIL_FROM no Netlify.'
            : 'O serviço de email não aceitou o envio do relatório.';
          reject(new Error(message));
          return;
        }

        resolve({ id: result.id });
      });
    });

    request.setTimeout(15000, () => {
      request.destroy(new Error('Email request timed out'));
    });
    request.on('error', () => reject(new Error('Não foi possível contactar o serviço de email.')));
    request.end(body);
  });
}

module.exports = { getEmailConfig, sendEmail };
