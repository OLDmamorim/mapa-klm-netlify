// Colaboradores eliminados ficam com ativo = false para manter o histórico dos relatórios.
async function ensureAtivoColumn(sql) {
  await sql`
    ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE
  `;
}

module.exports = { ensureAtivoColumn };
