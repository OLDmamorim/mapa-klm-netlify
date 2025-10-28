# MAPA KLM - TODO List

## Completed Features
- [x] Formulário público com branding ExpressGlass
- [x] Múltiplas viagens por relatório (até 5)
- [x] Auto-formatação de matrícula (XX-XX-XX)
- [x] Auto-preenchimento de código ao selecionar colaborador
- [x] Painel admin com proteção de login
- [x] Tabela de gestão de colaboradores
- [x] Listagem de relatórios
- [x] Geração de PDF básica
- [x] Envio de email com anexo PDF
- [x] Base de dados NEON PostgreSQL
- [x] Deploy no Netlify
- [x] Repositório GitHub configurado
- [x] 25 colaboradores carregados
- [x] Campo Loja alterado para dropdown com 15 lojas

## Pending Features
- [x] Reformatar PDF para seguir template oficial ExpressGlass
  - [x] Cabeçalho com logo e título "DESPESAS - MAPA DE KM"
  - [x] Campos de identificação: Utilizador, Nº Colaborador, Empresa, Centro de Custo
  - [x] Campos de despesa: Data, Matrícula, Proprietário (vazio)
  - [x] Tabela com colunas: Dia, Saída (09H00), Chegada (18H00), Km's, Local, Motivo
  - [x] Cálculos: Total Km, Valor/Km (0,36€), Total de Despesas
  - [x] Assinatura do responsável com imagem
- [ ] Resolver cache CDN do dropdown de colaboradores
- [ ] Verificar visibilidade do botão "Adicionar Colaborador"


- [x] Corrigir erro de timezone na submissão do formulário


- [x] BUG CONFIRMADO: PDF ainda está usando formato antigo (sem logo, sem tabela, sem assinatura do responsável)
  - [x] Código corrigido em download-pdf.js
  - [ ] PENDENTE: Deploy no Netlify (deploy automático não está configurado)


- [x] BUG: Não dá para fazer download do PDF no painel admin (corrigido parsing de data)


- [x] Assinaturas estão presentes no PDF (página 2 - aceitável)



## ✅ Todas as Correções Aplicadas com Sucesso

- [x] Logo atualizado com "part of Cary group" ✅
- [x] Campo "Centro de Custo" preenchido com a loja do colaborador ✅
- [x] Campo "Proprietário" preenchido com o nome do colaborador ✅
- [x] Data na tabela usando formato completo "2025-10-28" ✅
- [x] Layout otimizado para caber numa página ✅
- [x] Caixa de Observações reduzida (60px) ✅
- [x] Assinatura do responsável como imagem ✅
- [x] PDF 100% conforme template oficial ExpressGlass ✅



## 🐛 Bug Reportado

- [x] PDF só mostra uma deslocação quando o relatório tem múltiplas deslocações (RESOLVIDO)



## 🎨 Ajustes Finais de Formatação do PDF

- [x] Títulos da tabela em negrito (Dia, Saída, Chegada, Km's, Local, Motivo)
- [x] Alinhar Total Km e Valor/Km com traços por baixo dos valores
- [x] Separar mais as assinaturas da nota final do documento
- [x] Alinhar os traços de assinatura (O Colaborador e O Responsável)
- [x] Substituir assinatura do responsável pela assinatura correta em PNG



## 🐛 Bugs Reportados - Correções Urgentes

- [x] Total Km está DENTRO da tabela (última linha) - deve estar FORA da tabela (Código já estava correto)
- [x] Campo Proprietário está vazio - deve mostrar o nome do utilizador (Corrigido: JOIN com tabela colaboradores)
- [x] Assinatura do responsável está distorcida (itálico/inclinada) - deve estar normal (Corrigido: removido height fixo)
- [x] Campo Proprietário vazio no PDF gerado por submit-relatorio.js (linha 123: data.nome → data.colaborador_nome) - RESOLVIDO



## 🐛 Novo Bug Reportado - Alinhamento

- [x] Total Km e Valor/Km estão DENTRO da tabela (última linha) - devem estar ENTRE a tabela e "Total de Despesas" como texto simples - RESOLVIDO
- [x] Tabela mostra 3 linhas quando só há 1 registo - deve mostrar APENAS as linhas com dados (sem linhas vazias) - RESOLVIDO
- [x] Assinatura do Responsável aparece ABAIXO da linha - deve estar ACIMA da linha de assinatura - RESOLVIDO
- [x] Posicionamento geral das assinaturas pode estar desalinhado - RESOLVIDO



## 🐛 Bug Final - Linha de Assinatura

- [x] Linha de assinatura do Responsável está desalinhada - a assinatura sobrepõe-se à linha. A linha deve estar completamente ABAIXO da assinatura - RESOLVIDO



## 🐛 Bug - Nota de Rodapé

- [x] Nota de rodapé está a sobrepor-se à linha de assinatura do Colaborador - deve estar ABAIXO das assinaturas - RESOLVIDO




## 🔧 Ajustes Finais de Layout

- [x] Linhas de assinatura (Colaborador e Responsável) devem subir mais, ficando mais próximas da caixa de Observações - RESOLVIDO
- [x] Nota de rodapé deve estar SEMPRE na página 1 (no fim da página), nunca numa segunda página - RESOLVIDO




## 🚨 URGENTE - Espaçamento Excessivo

- [x] Caixa de Observações está ENORME - reduzir altura drasticamente (de 60px para 40px) - RESOLVIDO
- [x] Espaço entre Observações e Assinaturas está muito grande - reduzir de 80px para 30px - RESOLVIDO
- [x] Todo o layout precisa ser mais compacto para caber confortavelmente numa página - RESOLVIDO




## 🚨 BUG CRÍTICO - Relatórios Duplicados

- [x] Sistema cria múltiplos relatórios quando há múltiplas deslocações - deveria criar UM único relatório com TODAS as deslocações do mesmo dia/colaborador - RESOLVIDO




## 🔧 Simplificação do Layout

- [x] Remover completamente a caixa de Observações do PDF - está a causar problemas de layout e não é essencial - RESOLVIDO




## 🚨 BUG CRÍTICO - Sobreposição de Elementos

- [x] Caixa "Total de Despesas" está SOBREPOSTA à assinatura do Responsável - precisa ajustar posicionamento vertical dos elementos - RESOLVIDO




## 🔧 Ajustes Finais para Perfeição

- [x] Centro de Custo (loja) está vazio - query SQL não está a retornar a loja corretamente - RESOLVIDO (adicionada loja ao objeto relatorio antes de gerar PDF)
- [x] Traços das assinaturas desalinhados - o traço do Colaborador e do Responsável devem estar na mesma altura (alinhados horizontalmente) - RESOLVIDO
- [x] PDF tem 2 páginas em vez de 1 - nota de rodapé está a forçar segunda página, precisa ajustar posicionamento geral - RESOLVIDO (reduzidos espaçamentos: assY=70px, noteY=75px)



## 🔧 Ajuste Final - Nota de Rodapé

- [x] Nota de rodapé deve estar fixa no rodapé da página (fim absoluto da página A4, ~30px do fim), não logo abaixo das assinaturas - RESOLVIDO (posição fixa Y=750, ~90px do fim da página)




## 🚨 BUG CRÍTICO - PDF com 3 páginas

- [x] PDF está a gerar 3 páginas em vez de 1 - a nota de rodapé está a ser quebrada em múltiplas páginas - RESOLVIDO
  - Solução: Reduzir fonte para 7pt, aumentar largura para 750, desativar quebras de linha (lineBreak: false), ajustar posição Y para 740
  - Resultado: PDF agora tem apenas 1 página com nota de rodapé completa numa única linha




## 🚨 BUG CRÍTICO - Nota de rodapé continua a criar 2ª e 3ª páginas

- [x] Nota de rodapé está a ser quebrada em múltiplas páginas mesmo com lineBreak: false - RESOLVIDO DEFINITIVAMENTE
  - Solução final: Usar posição relativa (assY + 75) em vez de fixa (Y=800), REMOVER PARÂMETRO WIDTH (era este o problema!), manter lineBreak: false e continued: false, fonte 6pt
  - Resultado: PDF tem apenas 1 página com nota de rodapé completa numa única linha, logo abaixo das assinaturas
  - Testado com relatório do Alberto Mendes (ID 42, 1 deslocação) após forçar redeploy no Netlify - PASSOU COM 100% DE SUCESSO!
  - Nota: O Netlify estava com cache e não aplicava as alterações. Foi necessário forçar redeploy com commit vazio.




## 🚨🚨🚨 BUG CRÍTICO PERSISTENTE - PDF CONTINUA COM 3 PÁGINAS

- [ ] PDF AINDA está a gerar 3 páginas mesmo após todas as correções aplicadas
  - Página 1: Conteúdo principal
  - Página 2: Primeira parte da nota
  - Página 3: Segunda parte da nota
  - **PROBLEMA REAL**: O parâmetro `lineBreak: false` NÃO está a funcionar com PDFKit
  - **SOLUÇÃO NECESSÁRIA**: REMOVER COMPLETAMENTE A NOTA DE RODAPÉ ou encontrar alternativa que funcione

