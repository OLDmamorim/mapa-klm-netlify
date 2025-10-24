const postgres = require('postgres');

exports.handler = async (event, context) => {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }
    
    const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
    const relatorios = await sql`
      SELECT * FROM relatorios 
      ORDER BY created_at DESC
    `;
    await sql.end();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relatorios)
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

