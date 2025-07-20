const https = require('https');
const readline = require('readline');
const WebSocket = require('ws');
require('dotenv').config();

const phoneNumber = process.env.PHONE_NUMBER;
const pin = process.env.PIN;

if (!phoneNumber || !pin) {
  console.error('❌ Phone number or PIN missing. Provide them via .env');
  process.exit(1);
}

function post(url, data, headers = {}) {
  const urlObj = new URL(url);
  const options = {
    method: 'POST',
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(data)),
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          resolve({ res, body: parsed });
        } catch (err) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

function waitForMessage(ws) {
  return new Promise((resolve) => ws.once('message', (data) => resolve(data.toString())));
}

function cleanJson(msg) {
  const start = msg.indexOf('{');
  const end = msg.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    return msg.slice(start, end + 1);
  }
  return '{}';
}

async function startLogin() {
  console.log("🔐 Connexion à l'API TradeRepublic...");
  const { body } = await post('https://api.traderepublic.com/api/v1/auth/web/login', { phoneNumber, pin });
  const processId = body.processId;
  if (!processId) {
    throw new Error('Initialisation échouée. Numéro ou PIN invalide.');
  }
  await post(`https://api.traderepublic.com/api/v1/auth/web/login/${processId}/resend`, {});
  return processId;
}

async function verifyLogin(processId, code) {
  const verifyUrl = `https://api.traderepublic.com/api/v1/auth/web/login/${processId}/${code}`;
  const { res: verifyRes } = await post(verifyUrl, {});
  if (verifyRes.statusCode !== 200) {
    throw new Error("V\u00e9rification de l'appareil refus\u00e9e");
  }
  const setCookie = verifyRes.headers['set-cookie'] || [];
  const sessionCookie = setCookie.find((c) => c.startsWith('tr_session='));
  if (!sessionCookie) {
    throw new Error('Cookie de session manquant');
  }
  const sessionToken = sessionCookie.split(';')[0].split('=')[1];
  console.log('✅ Authentifi\u00e9 avec succ\u00e8s !');
  return sessionToken;
}

async function authenticate() {
  const processId = await startLogin();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
  const code = await ask('❓ Entrez le code 2FA reçu par SMS: ');
  rl.close();
  return verifyLogin(processId, code);
}

async function fetchTransactionDetails(ws, transactionId, token, messageId) {
  messageId++;
  const payload = { type: 'timelineDetailV2', id: transactionId, token };
  ws.send(`sub ${messageId} ${JSON.stringify(payload)}`);
  const subResponse = await waitForMessage(ws);
  ws.send(`unsub ${messageId}`);
  await waitForMessage(ws);

  const cleaned = cleanJson(subResponse);
  let jsonData = {};
  try {
    jsonData = JSON.parse(cleaned);
  } catch (err) {
    console.error('Erreur de parsing JSON', err);
    return [{}, messageId];
  }

  const transactionData = {};
  for (const section of jsonData.sections || []) {
    if (section.title === 'Transaction') {
      for (const item of section.data || []) {
        const key = item.title;
        const value = item.detail?.text;
        if (key && value) transactionData[key] = value;
      }
    }
    if (section?.action?.type === 'instrumentDetail') {
      transactionData.ISIN = section.action.payload;
    }
  }
  return [transactionData, messageId];
}

async function fetchAllTransactions(token) {
  const ws = new WebSocket('wss://api.traderepublic.com');
  const allData = [];
  let messageId = 0;
  let afterCursor = null;

  return new Promise((resolve, reject) => {
    ws.on('open', async () => {
      try {
        const localeConfig = {
          locale: 'fr',
          platformId: 'webtrading',
          platformVersion: 'safari - 18.3.0',
          clientId: 'app.traderepublic.com',
          clientVersion: '3.151.3',
        };
        ws.send(`connect 31 ${JSON.stringify(localeConfig)}`);
        await waitForMessage(ws);
        console.log('✅ WebSocket connecté');

        while (true) {
          const payload = { type: 'timelineTransactions', token };
          if (afterCursor) payload.after = afterCursor;
          messageId++;
          ws.send(`sub ${messageId} ${JSON.stringify(payload)}`);
          const subResponse = await waitForMessage(ws);
          ws.send(`unsub ${messageId}`);
          await waitForMessage(ws);
          const cleaned = cleanJson(subResponse);
          let jsonData = {};
          try {
            jsonData = JSON.parse(cleaned);
          } catch (err) {
            console.error('Erreur de parsing JSON', err);
            break;
          }

          if (!jsonData.items || jsonData.items.length === 0) {
            break;
          }

          for (const tx of jsonData.items) {
            const txId = tx.id;
            if (tx?.status && tx.status.includes('CANCELED')) {
              continue;
            }
            if (txId) {
              const [details, newId] = await fetchTransactionDetails(ws, txId, token, messageId);
              messageId = newId;
              Object.assign(tx, details);
            }
            allData.push(tx);
          }

          afterCursor = jsonData.cursors?.after;
          if (!afterCursor) break;
        }
        ws.close();
        resolve(allData);
      } catch (err) {
        ws.close();
        reject(err);
      }
    });
  });
}

module.exports = {
  authenticate,
  startLogin,
  verifyLogin,
  fetchAllTransactions,
};
