export default function handler(req, res) {
  const code = req.query.code;

  res.status(200).send(`
    <h2>RD Callback recebido</h2>
    <p>Seu code:</p>
    <pre>${code}</pre>
    <p>Copie esse code para trocar por token.</p>
  `);
}
