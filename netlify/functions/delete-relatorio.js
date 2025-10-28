const postgres = require('postgres');

exports.handler = async (event, context) => {
  // Apenas permitir método DELETE
  if (event.httpMethod !== 'DELETE') {
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

    // Conectar à base de dados
    const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });

    // Eliminar o relatório
    const result = await sql`
      DELETE FROM relatorios
      WHERE id = ${relatorioId}
    `;

    await sql.end();

    // Verificar se algum registo foi eliminado
    if (result.count === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Relatório não encontrado' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Relatório eliminado com sucesso' 
      })
    };
  } catch (error) {
    console.error('Erro ao eliminar relatório:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
