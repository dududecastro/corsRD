import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    // validação mínima
    if (!payload || !payload.event_type) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const response = await axios.post(process.env.RD_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RD_API_TOKEN}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}
