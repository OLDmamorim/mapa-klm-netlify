const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

const report = {
  colaborador_nome: 'Pessoa Teste', colaborador_codigo: 'TEST', loja: 'Loja Teste', matricula: 'AA-00-AA',
  deslocacoes: [
    { data: '2026-09-15', localidade: 'Braga', motivo: 'Teste', klm: 10 },
    { data: '2026-09-16', localidade: 'Guimarães', motivo: 'Teste', klm: 20 }
  ]
};
const pdf = Buffer.from('%PDF-test-only');

function loadEmail({ env = {}, status = 200, reply = { id: 'test-email-id' }, failure } = {}) {
  const requests = [];
  const https = {
    request(url, options, onResponse) {
      const captured = { url, options };
      requests.push(captured);
      const req = new EventEmitter();
      req.setTimeout = (ms, callback) => { captured.timeout = ms; req.timeout = callback; };
      req.destroy = error => req.emit('error', error);
      req.end = body => {
        captured.body = JSON.parse(body);
        queueMicrotask(() => {
          if (failure === 'timeout') return req.timeout();
          if (failure === 'network') return req.emit('error', new Error('private network detail'));
          const res = new EventEmitter();
          res.statusCode = status;
          res.setEncoding = () => {};
          onResponse(res);
          res.emit('data', typeof reply === 'string' ? reply : JSON.stringify(reply));
          res.emit('end');
        });
      };
      return req;
    }
  };
  const context = {
    module: { exports: {} }, Buffer, process: { env },
    require(name) { assert.equal(name, 'https'); return https; }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../netlify/lib/email.js'), 'utf8'), context);
  return { ...context.module.exports, requests };
}

test('uses the PoweringEG sender, keeps report totals and encodes the PDF for Resend', async () => {
  const email = loadEmail({ env: { RESEND_API_KEY: 'test-key' } });
  const result = await email.sendEmail(pdf, report);
  assert.equal(result.id, 'test-email-id');
  const { url, options, body } = email.requests[0];
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers.Authorization, 'Bearer test-key');
  assert.equal(body.from, 'PoweringEG Platform <noreply@poweringeg.pt>');
  assert.deepEqual(body.to, ['mamorim@expressglass.pt']);
  assert.equal(body.subject, 'MAPA KLM - Pessoa Teste');
  assert.match(body.text, /Total KM: 30\.00 km/);
  assert.match(body.text, /Total Despesas: 10\.80 €/);
  assert.match(body.attachments[0].filename, /^Relatorio_PessoaTeste_\d{4}-\d{2}-\d{2}\.pdf$/);
  assert.deepEqual(Buffer.from(body.attachments[0].content, 'base64'), pdf);
});

test('honours EMAIL_FROM and comma-separated ADMIN_EMAIL without using SMTP credentials', async () => {
  const email = loadEmail({ env: {
    RESEND_API_KEY: ' test-key ', EMAIL_FROM: ' Mapa KLM <noreply@poweringeg.pt> ',
    ADMIN_EMAIL: 'first@example.com, second@example.com ', SMTP_USER: 'unused@example.com', SMTP_PASS: 'unused'
  } });
  await email.sendEmail(pdf, report);
  assert.equal(email.requests[0].body.from, 'Mapa KLM <noreply@poweringeg.pt>');
  assert.deepEqual(email.requests[0].body.to, ['first@example.com', 'second@example.com']);
  assert.equal(email.requests[0].options.headers.Authorization, 'Bearer test-key');
});

test('missing or whitespace-only API key fails before any request', async () => {
  for (const value of [undefined, '   ']) {
    const email = loadEmail({ env: { RESEND_API_KEY: value } });
    await assert.rejects(email.sendEmail(pdf, report), /Configure RESEND_API_KEY/);
    assert.equal(email.requests.length, 0);
  }
});

test('rejects provider errors, invalid JSON and success responses missing a message ID', async () => {
  for (const scenario of [
    { status: 401, reply: { message: 'private provider detail' } },
    { status: 403, reply: { message: 'private provider detail' } },
    { status: 429, reply: { message: 'private provider detail' } },
    { status: 500, reply: { message: 'private provider detail' } },
    { status: 200, reply: {} },
    { status: 200, reply: 'invalid JSON' }
  ]) {
    const email = loadEmail({ env: { RESEND_API_KEY: 'test-key' }, ...scenario });
    await assert.rejects(email.sendEmail(pdf, report), error => {
      assert.doesNotMatch(error.message, /test-key|private provider detail/);
      return true;
    });
  }
});

test('network failures and timeouts reject without exposing transport details', async () => {
  for (const failure of ['network', 'timeout']) {
    const email = loadEmail({ env: { RESEND_API_KEY: 'test-key' }, failure });
    await assert.rejects(email.sendEmail(pdf, report), /Não foi possível contactar/);
    assert.equal(email.requests[0].timeout, 15000);
  }
});

test('submission awaits provider acceptance and propagates failures without claiming success', async () => {
  for (const status of [200, 403]) {
    const email = loadEmail({ env: { RESEND_API_KEY: 'test-key' }, status });
    let inserts = 0;
    const sql = async () => { inserts++; return []; };
    sql.end = async () => {};
    const context = {
      exports: {}, Buffer, process: { env: { DATABASE_URL: 'mock-only' } },
      console: { error() {}, warn() {} },
      require(name) {
        if (name === '../lib/email') return email;
        if (name === 'postgres') return () => sql;
        if (name === 'pdfkit') return class {};
        if (['https', 'http'].includes(name)) return { get() { throw Error('Network disabled'); } };
        throw Error('Unexpected dependency: ' + name);
      }
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../netlify/functions/submit-relatorio.js'), 'utf8'), context);
    context.generatePDF = async () => pdf;
    const response = await context.exports.handler({ httpMethod: 'POST', body: JSON.stringify(report) });
    assert.equal(email.requests.length, 1);
    assert.equal(response.statusCode, status === 200 ? 200 : 500);
    assert.equal(inserts, status === 200 ? 2 : 0);
  }
});
