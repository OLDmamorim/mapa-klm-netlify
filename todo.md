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



## Correções Necessárias no PDF (comparando com template original)

- [x] Adicionar "part of Cary group" no logo (nova imagem fornecida)
- [x] Preencher campo "Centro de Custo" com a loja do colaborador
- [x] Preencher campo "Proprietário" com o nome do colaborador
- [x] Ajustar formato da data na tabela: usar "2025-05-30" em vez de "28/10"
- [x] Reduzir espaçamentos para caber tudo numa página
- [x] Reduzir altura da caixa de Observações (80px -> 60px)
- [x] Assinatura do responsável já está como imagem (funcionando)

