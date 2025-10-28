const postgres = require('postgres');
const PDFDocument = require('pdfkit');
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

async function generatePDF(relatorio) {
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
      
      doc.fontSize(16).font('Helvetica-Bold')
         .text('DESPESAS DE KM EM VIATURA PRÓPRIA', 250, 60, { align: 'right' });
      
      doc.moveDown(3);
      
      // IDENTIFICAÇÃO
      const startY = 130;
      doc.fontSize(12).font('Helvetica-Bold').text('Identificação:', 50, startY);
      doc.moveDown(0.8);
      
      const fieldY = startY + 30;
      doc.fontSize(10).font('Helvetica');
      doc.text('Utilizador:', 50, fieldY);
      doc.rect(150, fieldY - 5, 400, 20).stroke();
      doc.text(relatorio.colaborador_nome, 155, fieldY, { width: 390 });
      
      doc.text('Nº Colaborador:', 50, fieldY + 35);
      doc.rect(150, fieldY + 30, 200, 20).stroke();
      doc.text(relatorio.colaborador_codigo, 155, fieldY + 35, { width: 190 });
      
      doc.text('Empresa:', 50, fieldY + 70);
      doc.rect(150, fieldY + 65, 200, 20).stroke();
      doc.text('Expressglass SA', 155, fieldY + 70, { width: 190 });
      
      doc.text('Centro de Custo:', 50, fieldY + 105);
      doc.rect(150, fieldY + 100, 200, 20).stroke();
      doc.text(relatorio.loja || '', 155, fieldY + 105, { width: 190 });
      
      // DESPESAS - MAPA DE KM
      const despesasY = fieldY + 145;
      doc.fontSize(12).font('Helvetica-Bold').text('Despesas - Mapa de Km', 50, despesasY);
      doc.moveDown(0.8);
      
      const dataY = despesasY + 30;
      
      // Parse da data
      const dataStr = relatorio.data instanceof Date ? relatorio.data.toISOString().split('T')[0] : relatorio.data;
      const [year, month, day] = dataStr.split('-');
      const dataFormatada = `${day}/${month}/${year}`;
      const diaTabela = dataStr; // Usar data completa YYYY-MM-DD
      
      doc.fontSize(10).font('Helvetica');
      doc.text('Data', 50, dataY);
      doc.rect(150, dataY - 5, 200, 20).stroke();
      doc.text(dataFormatada, 155, dataY, { width: 190 });
      
      doc.text('Matrícula:', 50, dataY + 35);
      doc.rect(150, dataY + 30, 200, 20).stroke();
      doc.text(relatorio.matricula, 155, dataY + 35, { width: 190 });
      
      doc.text('Proprietário:', 50, dataY + 70);
      doc.rect(150, dataY + 65, 400, 20).stroke();
      doc.text(relatorio.colaborador_nome, 155, dataY + 70, { width: 390 });
      
      // TABELA
      const tableY = dataY + 110;
      const colWidths = [60, 60, 60, 60, 120, 130];
      const colX = [50, 110, 170, 230, 290, 410];
      const rowHeight = 30;
      
      // Cabeçalho da tabela
      doc.fontSize(9).font('Helvetica-Bold');
      const headers = ['Dia', 'Saída', 'Chegada', "Km's", 'Local', 'Motivo'];
      
      // Desenhar cabeçalho (em negrito)
      for (let i = 0; i < headers.length; i++) {
        doc.rect(colX[i], tableY, colWidths[i], rowHeight).stroke();
        doc.font('Helvetica-Bold').text(headers[i], colX[i] + 5, tableY + 10, { 
          width: colWidths[i] - 10, 
          align: 'center' 
        });
      }
      
      // Linhas de dados - iterar sobre TODAS as deslocações
      doc.font('Helvetica');
      const deslocacoes = relatorio.deslocacoes || [relatorio];
      let currentRowY = tableY + rowHeight;
      
      deslocacoes.forEach((desl) => {
        const dataRow = [
          diaTabela,
          '09H00',
          '18H00',
          desl.klm.toString(),
          desl.localidade,
          desl.motivo
        ];
        
        for (let i = 0; i < dataRow.length; i++) {
          doc.rect(colX[i], currentRowY, colWidths[i], rowHeight).stroke();
          doc.text(dataRow[i], colX[i] + 5, currentRowY + 10, { 
            width: colWidths[i] - 10, 
            align: i < 4 ? 'center' : 'left'
          });
        }
        
        currentRowY += rowHeight;
      });
      
      // CÁLCULOS
      const calcY = currentRowY + 20;
      const totalKm = deslocacoes.reduce((sum, d) => sum + parseFloat(d.klm), 0);
      const valorPorKm = 0.36;
      const totalDespesas = totalKm * valorPorKm;
      
      doc.fontSize(10).font('Helvetica');
      doc.text('Total Km', 400, calcY);
      doc.text(totalKm.toFixed(2), 490, calcY);
      // Traço por baixo do Total Km
      doc.moveTo(490, calcY + 15).lineTo(540, calcY + 15).stroke();
      
      doc.text('Valor/Km', 400, calcY + 25);
      doc.text(`${valorPorKm.toFixed(2)} €`, 490, calcY + 25);
      // Traço por baixo do Valor/Km
      doc.moveTo(490, calcY + 40).lineTo(540, calcY + 40).stroke();
      
      doc.fontSize(11).font('Helvetica-Bold');
      doc.rect(260, calcY + 50, 290, 30).stroke();
      doc.text('Total de Despesas:', 270, calcY + 60);
      doc.text(`${totalDespesas.toFixed(2)} €`, 470, calcY + 60);
      
      // ASSINATURAS (mais separadas da nota final) - ABAIXO da caixa de Total de Despesas
      const assY = calcY + 110;
      doc.fontSize(10).font('Helvetica');
      doc.text('O Colaborador:', 80, assY);
      // Linha alinhada com a do Responsável (60px)
      doc.moveTo(80, assY + 60).lineTo(250, assY + 60).stroke();
      
      doc.text('O Responsável:', 350, assY);
      if (assinaturaBuffer) {
        // Assinatura ACIMA da linha (entre o texto e a linha)
        doc.image(assinaturaBuffer, 380, assY + 10, { width: 80 });
      }
      // Linha ABAIXO da assinatura (60px para garantir espaço suficiente)
      doc.moveTo(350, assY + 60).lineTo(490, assY + 60).stroke();
      
      // NOTA DE RODAPÉ (posicionada no fim da página 1, mais abaixo)
      const noteY = doc.page.height - 40;
      doc.fontSize(8).font('Helvetica');
      doc.text(
        'Nota: valores recebidos até dia 16 do mês N, serão pagos no mês N, valores recebidos entre dia 17 e 31 do mês N serão pagos no mês N+1',
        50,
        noteY,
        { width: 500, align: 'left' }
      );
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    const relatorioId = event.queryStringParameters?.id;
    
    if (!relatorioId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID do relatório não fornecido' })
      };
    }
    
    const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
    
    // Buscar o relatório principal pelo ID com nome do colaborador
    const relatorios = await sql`
      SELECT r.*, c.nome as colaborador_nome 
      FROM relatorios r
      LEFT JOIN colaboradores c ON r.colaborador_codigo = c.codigo
      WHERE r.id = ${relatorioId}
    `;
    
    if (relatorios.length === 0) {
      await sql.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Relatório não encontrado' })
      };
    }
    
    const relatorio = relatorios[0];
    
    // Buscar TODAS as deslocações do mesmo relatório (mesma data + colaborador + matrícula)
    const todasDeslocacoes = await sql`
      SELECT r.*, c.nome as colaborador_nome, c.loja
      FROM relatorios r
      LEFT JOIN colaboradores c ON r.colaborador_codigo = c.codigo
      WHERE r.data = ${relatorio.data}
        AND r.colaborador_codigo = ${relatorio.colaborador_codigo}
        AND r.matricula = ${relatorio.matricula}
      ORDER BY r.id
    `;
    
    // Adicionar array de deslocações ao relatório principal
    relatorio.deslocacoes = todasDeslocacoes;
    const pdfBuffer = await generatePDF(relatorio);
    
    await sql.end();
    
    const dataStr = relatorio.data instanceof Date ? relatorio.data.toISOString().split('T')[0] : relatorio.data;
    const [year, month, day] = dataStr.split('-');
    const dataFormatada = `${day}-${month}-${year}`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Relatorio_KM_${relatorio.colaborador_nome.replace(/ /g, '_')}_${dataFormatada}.pdf"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

