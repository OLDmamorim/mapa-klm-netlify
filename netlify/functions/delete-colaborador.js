const postgres = require('postgres');
const { ensureAtivoColumn } = require('../lib/colaboradores');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const codigo = event.queryStringParameters?.codigo;
    if (!codigo) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Código é obrigatório' })
      };
    }

    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Database not configured' })
      };
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
    await ensureAtivoColumn(sql);

    // Desativar em vez de apagar: os relatórios antigos continuam associados ao colaborador
    const result = await sql`
      UPDATE colaboradores SET ativo = FALSE WHERE codigo = ${codigo} AND ativo
    `;
    await sql.end();

    if (result.count === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Colaborador não encontrado' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
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
