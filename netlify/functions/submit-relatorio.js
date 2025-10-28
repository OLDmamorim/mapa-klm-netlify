const postgres = require('postgres');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');

// Função para baixar imagem de URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function generatePDF(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        bufferPages: true
      });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Baixar logo e assinatura
      const logoUrl = 'https://mapaklmeg.netlify.app/logo-expressglass.png';
      const assinaturaUrl = 'https://mapaklmeg.netlify.app/assinatura-responsavel.png';
      
      let logoBuffer, assinaturaBuffer;
      try {
        logoBuffer = await downloadImage(logoUrl);
        assinaturaBuffer = await downloadImage(assinaturaUrl);
      } catch (err) {
        console.warn('Erro ao baixar imagens:', err);
      }
      
      // CABEÇALHO
      if (logoBuffer) {
        doc.image(logoBuffer, 50, 40, { width: 180 });
      }
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('DESPESAS DE KM EM VIATURA PRÓPRIA', 250, 50, { align: 'right' });
      
      doc.moveDown(3);
      
      // IDENTIFICAÇÃO
      const startY = 120;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Identificação:', 50, startY);
      
      doc.moveDown(1);
      
      // Utilizador
      doc.fontSize(10)
         .font('Helvetica')
         .text('Utilizador:', 50, doc.y);
      doc.rect(180, doc.y - 15, 365, 20).stroke();
      doc.text(data.colaborador_nome, 185, doc.y - 12);
      
      doc.moveDown(1.5);
      
      // Nº Colaborador
      doc.text('Nº Colaborador:', 50, doc.y);
      doc.rect(180, doc.y - 15, 150, 20).stroke();
      doc.text(data.colaborador_codigo, 185, doc.y - 12);
      
      doc.moveDown(1.5);
      
      // Empresa
      doc.text('Empresa:', 50, doc.y);
      doc.rect(180, doc.y - 15, 150, 20).stroke();
      doc.text('Expressglass SA', 185, doc.y - 12);
      
      doc.moveDown(1.5);
      
      // Centro de Custo (Loja)
      doc.text('Centro de Custo:', 50, doc.y);
      doc.rect(180, doc.y - 15, 150, 20).stroke();
      doc.text(data.loja || '', 185, doc.y - 12);
      
      doc.moveDown(2);
      
      // DESPESAS - MAPA DE KM
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Despesas - Mapa de Km', 50, doc.y);
      
      doc.moveDown(1);
      
      // Data
      doc.fontSize(10)
         .font('Helvetica')
         .text('Data', 50, doc.y);
      doc.rect(180, doc.y - 15, 150, 20).stroke();
      const [year, month, day] = data.data.split('-');
      const dataFormatada = `${day}/${month}/${year}`;
      doc.text(dataFormatada, 185, doc.y - 12);
      
      doc.moveDown(1.5);
      
      // Matrícula
      doc.text('Matrícula:', 50, doc.y);
      doc.rect(180, doc.y - 15, 150, 20).stroke();
      doc.text(data.matricula, 185, doc.y - 12);
      
      doc.moveDown(1.5);
      
      // Proprietário
      doc.text('Proprietário:', 50, doc.y);
      doc.rect(180, doc.y - 15, 365, 20).stroke();
      doc.text(data.colaborador_nome || '', 185, doc.y - 12);
      
      doc.moveDown(2);
      
      // TABELA DE DESLOCAÇÕES
      const tableTop = doc.y;
      const colWidths = [60, 60, 70, 60, 150, 145];
      const headers = ['Dia', 'Saída', 'Chegada', "Km's", 'Local', 'Motivo'];
      
      // Cabeçalho da tabela
      doc.fontSize(9)
         .font('Helvetica-Bold');
      
      let xPos = 50;
      headers.forEach((header, i) => {
        doc.rect(xPos, tableTop, colWidths[i], 25).stroke();
        doc.text(header, xPos + 5, tableTop + 8, { width: colWidths[i] - 10 });
        xPos += colWidths[i];
      });
      
      // Linhas da tabela
      doc.font('Helvetica');
      let yPos = tableTop + 25;
      
      data.deslocacoes.forEach((desl) => {
        const dia = data.data; // Usar data completa YYYY-MM-DD
        const rowData = [dia, '09H00', '18H00', desl.klm, desl.localidade, desl.motivo];
        
        xPos = 50;
        rowData.forEach((cell, i) => {
          doc.rect(xPos, yPos, colWidths[i], 25).stroke();
          doc.text(String(cell), xPos + 5, yPos + 8, { width: colWidths[i] - 10, height: 20 });
          xPos += colWidths[i];
        });
        
        yPos += 25;
      });
      
      // Atualizar doc.y para a posição após a tabela
      doc.y = yPos + 30; // 30px de espaço após a última linha da tabela
      yPos = doc.y;
      
      // CÁLCULOS
      const totalKM = data.deslocacoes.reduce((sum, d) => sum + parseFloat(d.klm), 0);
      const valorPorKm = 0.36;
      const totalDespesas = totalKM * valorPorKm;
      
      doc.fontSize(10);
      doc.text('Total Km', 400, yPos);
      doc.text(totalKM.toFixed(2), 490, yPos);
      // Traço por baixo do Total Km
      doc.moveTo(490, yPos + 15).lineTo(540, yPos + 15).stroke();
      
      doc.text('Valor/Km', 400, yPos + 25);
      doc.text(`${valorPorKm.toFixed(2)} €`, 490, yPos + 25);
      // Traço por baixo do Valor/Km
      doc.moveTo(490, yPos + 40).lineTo(540, yPos + 40).stroke();
      
      doc.moveDown(1.5);
      
      // Total de Despesas (caixa destacada)
      doc.fontSize(11)
         .font('Helvetica-Bold');
      doc.rect(260, doc.y, 285, 30).stroke();
      doc.text('Total de Despesas:', 270, doc.y + 10);
      doc.text(`${totalDespesas.toFixed(2)} €`, 480, doc.y - 10, { align: 'right' });
      
      doc.moveDown(3);
      
      doc.moveDown(2);
      
      // ASSINATURAS (mais separadas da nota final)
      const signY = doc.y + 5;
      
      // O Colaborador
      doc.text('O Colaborador:', 80, signY);
      doc.moveTo(80, signY + 40).lineTo(250, signY + 40).stroke();
      
      // O Responsável
      doc.text('O Responsável:', 350, signY);
      if (assinaturaBuffer) {
        // Assinatura ACIMA da linha (entre o texto e a linha)
        doc.image(assinaturaBuffer, 380, signY + 10, { width: 80 });
      }
      // Linha ABAIXO da assinatura (60px para garantir espaço suficiente)
      doc.moveTo(350, signY + 60).lineTo(500, signY + 60).stroke();
      
      // NOTA DE RODAPÉ (posicionada no fim da página 1)
      const noteY = doc.page.height - 60;
      doc.fontSize(8)
         .font('Helvetica')
         .text('Nota: valores recebidos até dia 16 do mês N, serão pagos no mês N, valores recebidos entre dia 17 e', 50, noteY);
      doc.text('31 do mês N serão pagos no mês N+1', 50, noteY + 12);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function sendEmail(pdfBuffer, data) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  const totalKM = data.deslocacoes.reduce((sum, d) => sum + parseFloat(d.klm), 0);
  const totalDespesas = (totalKM * 0.36).toFixed(2);
  const localidades = data.deslocacoes.map(d => d.localidade).join(', ');
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL || 'mamorim@expressglass.pt',
    subject: `MAPA KLM - ${data.colaborador_nome} - ${data.data.split('-').reverse().join('/')}`,
    text: `Novo relatório de KM submetido por ${data.colaborador_nome}.\n\nDetalhes:\n- Data: ${data.data.split('-').reverse().join('/')}\n- Loja: ${data.loja}\n- Matrícula: ${data.matricula}\n- Localidades: ${localidades}\n- Total KM: ${totalKM.toFixed(2)} km\n- Total Despesas: ${totalDespesas} €\n- Número de deslocações: ${data.deslocacoes.length}`,
    attachments: [{
      filename: `Relatorio_${data.colaborador_nome.replace(/ /g, '')}_${data.data}.pdf`,
      content: pdfBuffer
    }]
  };
  
  await transporter.sendMail(mailOptions);
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const data = JSON.parse(event.body);
    
    // Validar dados
    if (!data.deslocacoes || data.deslocacoes.length === 0) {
      throw new Error('Pelo menos uma deslocação é necessária');
    }
    
    // Gerar PDF
    const pdfBuffer = await generatePDF(data);
    
    // Enviar email
    await sendEmail(pdfBuffer, data);
    
    // Guardar na base de dados se disponível
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
      
      // Guardar cada deslocação como um registo separado
      for (const desl of data.deslocacoes) {
        await sql`
          INSERT INTO relatorios (
            data, colaborador_codigo, colaborador_nome, matricula, 
            localidade, motivo, klm
          ) VALUES (
            ${data.data}, ${data.colaborador_codigo}, ${data.colaborador_nome},
            ${data.matricula}, ${desl.localidade}, ${desl.motivo}, ${desl.klm}
          )
        `;
      }
      
      await sql.end();
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Relatório enviado com sucesso!' })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

