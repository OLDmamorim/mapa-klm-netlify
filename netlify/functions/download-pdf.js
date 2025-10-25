const postgres = require('postgres');
const PDFDocument = require('pdfkit');

async function generatePDF(relatorio) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // Header
    doc.fontSize(20).text('MAPA DE QUILÓMETROS', { align: 'center' });
    doc.fontSize(12).text('Despesas de KM em Viatura Própria', { align: 'center' });
    doc.moveDown(2);
    
    // Dados do colaborador
    doc.fontSize(14).text('Dados do Colaborador', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Nome: ${relatorio.colaborador_nome}`);
    doc.text(`Código: ${relatorio.colaborador_codigo}`);
    doc.moveDown(1.5);
    
    // Dados da viagem
    doc.fontSize(14).text('Dados da Deslocação', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Data: ${new Date(relatorio.data).toLocaleDateString('pt-PT')}`);
    doc.text(`Matrícula: ${relatorio.matricula}`);
    doc.text(`Localidade: ${relatorio.localidade}`);
    doc.text(`Motivo: ${relatorio.motivo}`);
    doc.text(`Quilómetros: ${relatorio.klm} km`);
    doc.moveDown(2);
    
    // Assinatura
    doc.fontSize(11);
    doc.text('_'.repeat(50));
    doc.text('Assinatura do Colaborador');
    doc.moveDown(1);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`);
    
    doc.end();
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
    
    const relatorios = await sql`
      SELECT * FROM relatorios WHERE id = ${relatorioId}
    `;
    
    if (relatorios.length === 0) {
      await sql.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Relatório não encontrado' })
      };
    }
    
    const relatorio = relatorios[0];
    const pdfBuffer = await generatePDF(relatorio);
    
    await sql.end();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Relatorio_${relatorio.colaborador_nome.replace(/ /g, '_')}_${relatorio.data}.pdf"`
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

