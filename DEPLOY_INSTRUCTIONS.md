# Instruções para Deploy Manual no Netlify

## Envio de relatórios pelo noreply do PoweringEG

O envio usa a API HTTPS do Resend, com o mesmo remetente do PoweringEG.
As variáveis SMTP do Gmail já não são utilizadas pela submissão de relatórios.

Antes de publicar esta versão, configure no projeto `mapaklmeg`, em **Environment variables**:

| Variável | Valor |
| --- | --- |
| `RESEND_API_KEY` | Chave privada do Resend autorizada a enviar pelo domínio `poweringeg.pt`. |
| `EMAIL_FROM` | `PoweringEG Platform <noreply@poweringeg.pt>` (também é o valor por defeito). |
| `ADMIN_EMAIL` | Destinatário dos relatórios. Por defeito: `mamorim@expressglass.pt`. Aceita vários endereços separados por vírgulas. |

As variáveis devem estar disponíveis no contexto **Production** e no âmbito **Functions**
(ou em todos os âmbitos). Depois de as configurar, faça um novo deploy para as aplicar.
Guarde a chave apenas nas variáveis privadas do Netlify; nunca em ficheiros do repositório.

O serviço só considera o envio aceite quando o Resend responde com sucesso e devolve um ID.
Essa aceitação não confirma a entrega na caixa de correio, que pode ser consultada no Resend.
Não existe fallback para Gmail. Se a chave faltar, a submissão apresenta uma mensagem de configuração.

Esta alteração substitui apenas o transporte de email. O fluxo existente continua a enviar
antes de gravar as deslocações; a gravação independente do email e a prevenção de duplicados
precisam de uma alteração própria.

Validação local, sem enviar emails nem ligar à base de dados: `npm test`.

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
