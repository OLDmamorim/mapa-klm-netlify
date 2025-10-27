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

