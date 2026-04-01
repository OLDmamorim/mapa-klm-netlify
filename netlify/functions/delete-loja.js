const postgres = require('postgres');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'ID é obrigatório' })
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

    // Verificar se existem colaboradores com esta loja
    const loja = await sql`SELECT nome FROM lojas WHERE id = ${id}`;
    if (loja.length === 0) {
      await sql.end();
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Loja não encontrada' })
      };
    }

    const colaboradoresNaLoja = await sql`
      SELECT COUNT(*) as total FROM colaboradores WHERE loja = ${loja[0].nome}
    `;
    if (parseInt(colaboradoresNaLoja[0].total) > 0) {
      await sql.end();
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Não é possível eliminar: existem ${colaboradoresNaLoja[0].total} colaborador(es) associado(s) a esta loja` })
      };
    }

    await sql`DELETE FROM lojas WHERE id = ${id}`;
    await sql.end();

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
