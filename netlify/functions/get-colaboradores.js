const postgres = require('postgres');

const colaboradoresData = [
  { codigo: "689", nome: "João Fonseca", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1109", nome: "Nuno Oliveira", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1179", nome: "Nuno Silva", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1180", nome: "Rui Cunha", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1181", nome: "Rui Pereira", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1182", nome: "Sérgio Costa", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1183", nome: "Tiago Martins", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1184", nome: "Vitor Santos", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1185", nome: "Alberto Ribeiro", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
  { codigo: "1186", nome: "André Sousa", loja: "PAREDES SM", funcao: "Técnico", empresa: "Expressglass SA" },
];

exports.handler = async (event, context) => {
  try {
    // Se tiver DATABASE_URL, buscar da base de dados
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
      const colaboradores = await sql`SELECT * FROM colaboradores ORDER BY nome`;
      await sql.end();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colaboradores)
      };
    }
    
    // Senão, retornar dados estáticos
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(colaboradoresData)
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

