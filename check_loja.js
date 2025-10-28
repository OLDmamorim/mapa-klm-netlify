const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function check() {
  const result = await sql`SELECT codigo, nome, loja FROM colaboradores WHERE codigo = 686`;
  console.log('Carolina Ribeiro (686):', JSON.stringify(result, null, 2));
  process.exit(0);
}

check();
