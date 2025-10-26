# Instruções para Deploy Manual no Netlify

## Ficheiros Alterados

Os seguintes ficheiros foram corrigidos para resolver o erro de timezone:

1. **netlify/functions/submit-relatorio.js** - Corrigido parsing de data
2. **public/index.html** - Formulário com campo loja

## Opção 1: Deploy via Interface Web do Netlify

1. Aceda a https://app.netlify.com/sites/mapaklmeg/deploys
2. Arraste a pasta `/home/ubuntu/mapa-klm-netlify` para a área de deploy
3. Aguarde o deploy completar

## Opção 2: Deploy via CLI (requer login)

```bash
cd /home/ubuntu/mapa-klm-netlify
netlify login
netlify deploy --prod --dir=public --functions=netlify/functions
```

## Opção 3: Copiar ficheiros manualmente

Copie os seguintes ficheiros para o projeto no Netlify:

- `netlify/functions/submit-relatorio.js`
- `public/index.html`
- `todo.md`

## Correção Aplicada

**Problema**: A data estava sendo parseada incorretamente causando erro "time zone displacement out of range"

**Solução**: Em vez de usar `new Date(data.data)`, agora fazemos split da string e formatamos manualmente:

```javascript
const [year, month, day] = data.data.split('-');
const dataFormatada = `${day}/${month}/${year}`;
```

Isso evita problemas de timezone do JavaScript.

