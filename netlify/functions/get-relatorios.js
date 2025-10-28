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
    
    // Agrupar relatórios por data + colaborador_codigo
    const grouped = {};
    for (const rel of relatorios) {
      const key = `${rel.data}_${rel.colaborador_codigo}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: rel.id, // ID do primeiro registo (para download)
          data: rel.data,
          colaborador_codigo: rel.colaborador_codigo,
          colaborador_nome: rel.colaborador_nome,
          matricula: rel.matricula,
          klm_total: 0,
          localidades: [],
          created_at: rel.created_at
        };
      }
      grouped[key].klm_total += parseFloat(rel.klm || 0);
      grouped[key].localidades.push(rel.localidade);
    }
    
    // Converter para array e formatar
    const result = Object.values(grouped).map(g => ({
      ...g,
      localidade: g.localidades[0], // Primeira localidade para exibição
      klm: g.klm_total.toFixed(2)
    }));
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
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

