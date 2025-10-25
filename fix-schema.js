const postgres = require('postgres');

const DATABASE_URL = "postgresql://neondb_owner:npg_ImXEh0Htw3oT@ep-sweet-union-abvkt925-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

async function fixSchema() {
  const sql = postgres(DATABASE_URL, { ssl: 'require' });
  
  try {
    console.log('Recriando tabela relatorios com schema correto...');
    
    // Drop e recriar tabela
    await sql`DROP TABLE IF EXISTS relatorios`;
    
    await sql`
      CREATE TABLE relatorios (
        id SERIAL PRIMARY KEY,
        data DATE NOT NULL,
        colaborador_codigo VARCHAR(10) NOT NULL,
        colaborador_nome VARCHAR(255) NOT NULL,
        matricula VARCHAR(10) NOT NULL,
        localidade VARCHAR(255) NOT NULL,
        motivo TEXT NOT NULL,
        klm DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Tabela relatorios recriada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sql.end();
  }
}

fixSchema();

