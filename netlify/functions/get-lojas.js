const postgres = require('postgres');

exports.handler = async (event, context) => {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Database not configured' })
      };
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });

    await sql`
      CREATE TABLE IF NOT EXISTS lojas (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Se tabela vazia, popular automaticamente a partir dos colaboradores existentes
    const count = await sql`SELECT COUNT(*) as total FROM lojas`;
    if (parseInt(count[0].total) === 0) {
      const lojasExistentes = await sql`
        SELECT DISTINCT loja FROM colaboradores WHERE loja IS NOT NULL AND loja != '' ORDER BY loja
      `;
      for (const row of lojasExistentes) {
        await sql`INSERT INTO lojas (nome) VALUES (${row.loja}) ON CONFLICT (nome) DO NOTHING`;
      }
    }

    const lojas = await sql`SELECT * FROM lojas ORDER BY nome`;
    await sql.end();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lojas)
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
