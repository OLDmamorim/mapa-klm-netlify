const postgres = require('postgres');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.nome || !data.nome.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Nome da loja é obrigatório' })
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
    const nome = data.nome.trim().toUpperCase();

    const existing = await sql`SELECT id FROM lojas WHERE nome = ${nome}`;
    if (existing.length > 0) {
      await sql.end();
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Loja já existe' })
      };
    }

    const result = await sql`
      INSERT INTO lojas (nome) VALUES (${nome}) RETURNING *
    `;
    await sql.end();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, loja: result[0] })
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
