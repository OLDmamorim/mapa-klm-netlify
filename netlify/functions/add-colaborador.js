const postgres = require('postgres');
const { ensureAtivoColumn } = require('../lib/colaboradores');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const data = JSON.parse(event.body);
    
    // Validar dados obrigatórios
    if (!data.codigo || !data.nome || !data.loja || !data.funcao || !data.empresa) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Todos os campos são obrigatórios' })
      };
    }
    
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database not configured' })
      };
    }
    
    const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
    await ensureAtivoColumn(sql);

    // Verificar se o código já existe
    const existing = await sql`
      SELECT codigo, ativo FROM colaboradores WHERE codigo = ${data.codigo}
    `;

    // Código de um colaborador desativado: reativar com os dados novos
    if (existing.length > 0 && !existing[0].ativo) {
      await sql`
        UPDATE colaboradores
        SET nome = ${data.nome}, loja = ${data.loja}, funcao = ${data.funcao},
            empresa = ${data.empresa}, ativo = TRUE
        WHERE codigo = ${data.codigo}
      `;
      await sql.end();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Colaborador reativado com sucesso' })
      };
    }

    if (existing.length > 0) {
      await sql.end();
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Código já existe' })
      };
    }
    
    // Inserir novo colaborador
    await sql`
      INSERT INTO colaboradores (codigo, nome, loja, funcao, empresa)
      VALUES (${data.codigo}, ${data.nome}, ${data.loja}, ${data.funcao}, ${data.empresa})
    `;
    
    await sql.end();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Colaborador adicionado com sucesso' })
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

