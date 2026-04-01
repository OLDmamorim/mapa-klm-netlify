// Corre este script UMA VEZ para criar e popular a tabela lojas
// node init-lojas.js

const postgres = require('postgres');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ImXEh0Htw3oT@ep-sweet-union-abvkt925-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const lojas = [
  "BARCELOS",
  "BRAGA - MINHO CENTER",
  "CALIBRAGENS BRAGA",
  "FAMALICÃO",
  "FAMALICÃO SM",
  "GUIMARÃES SHOPPING",
  "MYCARCENTER",
  "PAÇOS DE FERREIRA",
  "PAREDES",
  "PAREDES SM",
  "PÓVOA DE VARZIM",
  "SERVIÇO MOVEL PESADOS",
  "VIANA DO CASTELO",
  "VIANA DO CASTELO SM",
  "VILA VERDE"
];

async function initLojas() {
  const sql = postgres(DATABASE_URL, { ssl: 'require' });

  try {
    console.log('A criar tabela lojas...');
    await sql`
      CREATE TABLE IF NOT EXISTS lojas (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('A inserir lojas...');
    let inseridas = 0;
    for (const nome of lojas) {
      try {
        await sql`INSERT INTO lojas (nome) VALUES (${nome}) ON CONFLICT (nome) DO NOTHING`;
        inseridas++;
        console.log(`  ✓ ${nome}`);
      } catch (e) {
        console.log(`  - ${nome} (já existe)`);
      }
    }

    const total = await sql`SELECT COUNT(*) as total FROM lojas`;
    console.log(`\nConcluído! ${total[0].total} lojas na base de dados.`);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sql.end();
  }
}

initLojas();
