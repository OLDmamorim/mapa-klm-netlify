const postgres = require('postgres');
const { ensureAtivoColumn } = require('../lib/colaboradores');

const colaboradoresData = [
  {"codigo": "689", "nome": "João Fonseca", "loja": "PAREDES SM", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "171", "nome": "Tiago Costa", "loja": "BARCELOS", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "694", "nome": "Tânia Martins", "loja": "BRAGA - MINHO CENTER", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "432", "nome": "Alberto Mendes", "loja": "BRAGA - MINHO CENTER", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "468", "nome": "Hugo Silva", "loja": "BRAGA - MINHO CENTER", "funcao": "Volante", "empresa": "Expressglass SA"},
  {"codigo": "166", "nome": "Vania Oliveira", "loja": "BRAGA - MINHO CENTER", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "317", "nome": "Alberto Silva", "loja": "CALIBRAGENS BRAGA", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "329", "nome": "Luis Cardoso", "loja": "FAMALICÃO", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "191", "nome": "Victor Carvalho", "loja": "FAMALICÃO", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "675", "nome": "Ana Moreira", "loja": "FAMALICÃO", "funcao": "Administrativa", "empresa": "Expressglass SA"},
  {"codigo": "686", "nome": "Carolina Ribeiro", "loja": "FAMALICÃO SM", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "641", "nome": "Simão Faria", "loja": "FAMALICÃO SM", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "636", "nome": "Pedro Almeida", "loja": "GUIMARÃES SHOPPING", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "605", "nome": "Pedro Silva", "loja": "GUIMARÃES SHOPPING", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "582", "nome": "José Moreira", "loja": "MYCARCENTER", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "107", "nome": "Roberto Silva", "loja": "PAÇOS DE FERREIRA", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "199", "nome": "João Morais", "loja": "PAÇOS DE FERREIRA", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "278", "nome": "André Silva", "loja": "PAREDES", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "110", "nome": "Luis Moreira", "loja": "PAREDES SM", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "555", "nome": "Pedro Simão", "loja": "PÓVOA DE VARZIM", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "452", "nome": "Tiago Gomes", "loja": "SERVIÇO MOVEL PESADOS", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "223", "nome": "Luis Amorim", "loja": "VIANA DO CASTELO", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "421", "nome": "Diogo Ferreira", "loja": "VIANA DO CASTELO SM", "funcao": "Responsável", "empresa": "Expressglass SA"},
  {"codigo": "649", "nome": "Luis Pereira", "loja": "VIANA DO CASTELO SM", "funcao": "Técnico", "empresa": "Expressglass SA"},
  {"codigo": "598", "nome": "André Ramoa", "loja": "VILA VERDE", "funcao": "Responsável", "empresa": "Expressglass SA"}
];

exports.handler = async (event, context) => {
  try {
    // Se tiver DATABASE_URL, buscar da base de dados
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL, { ssl: 'prefer' });
      await ensureAtivoColumn(sql);
      const colaboradores = await sql`SELECT * FROM colaboradores WHERE ativo ORDER BY nome`;
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

