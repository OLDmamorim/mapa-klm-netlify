const postgres = require('postgres');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { createTransport } = nodemailer;

async function generatePDF(data) {
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
    doc.text(`Nome: ${data.colaborador.nome}`);
    doc.text(`Código: ${data.colaborador.codigo}`);
    doc.text(`Loja: ${data.colaborador.loja}`);
    doc.text(`Função: ${data.colaborador.funcao}`);
    doc.text(`Empresa: ${data.colaborador.empresa}`);
    doc.moveDown(1.5);
    
    // Dados da viagem
    doc.fontSize(14).text('Dados da Deslocação', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Data: ${new Date(data.data).toLocaleDateString('pt-PT')}`);
    doc.text(`Matrícula: ${data.matricula}`);
    doc.text(`Localidade: ${data.localidade}`);
    doc.text(`Motivo: ${data.motivo}`);
    doc.text(`Quilómetros: ${data.klm} km`);
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

async function sendEmail(pdfBuffer, data) {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL || 'mamorim@expressglass.pt',
    subject: `MAPA KLM - ${data.colaborador.nome} - ${new Date(data.data).toLocaleDateString('pt-PT')}`,
    text: `Novo relatório de KM submetido por ${data.colaborador.nome}.\n\nDetalhes:\n- Data: ${new Date(data.data).toLocaleDateString('pt-PT')}\n- Localidade: ${data.localidade}\n- KM: ${data.klm} km`,
    attachments: [{
      filename: `Relatorio_${data.colaborador.nome.replace(/ /g, '')}_${new Date(data.data).toISOString().split('T')[0]}.pdf`,
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
    
    // Gerar PDF
    const pdfBuffer = await generatePDF(data);
    
    // Enviar email
    await sendEmail(pdfBuffer, data);
    
    // Guardar na base de dados se disponível
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
      await sql`
        INSERT INTO relatorios (
          data, colaborador_codigo, colaborador_nome, matricula, 
          localidade, motivo, klm
        ) VALUES (
          ${data.data}, ${data.colaborador.codigo}, ${data.colaborador.nome},
          ${data.matricula}, ${data.localidade}, ${data.motivo}, ${data.klm}
        )
      `;
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

