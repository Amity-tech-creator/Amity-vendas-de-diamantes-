import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OpenAI Client (Configured for OpenRouter)
  const getOpenAIClient = () => {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }
    return new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://ai.studio",
        "X-Title": "Amity Vendas",
      }
    });
  };

  // API Routes
  app.post("/api/search", async (req, res) => {
    try {
      const { query: searchQuery, games } = req.body;
      const openai = getOpenAIClient();

      const prompt = `
        Você é o motor de busca inteligente da plataforma Amity Vendas.
        Catálogo de Jogos:
        ${JSON.stringify(games)}

        Usuário pesquisou: "${searchQuery}"

        Com base no catálogo, identifique o jogo ou pacote mais relevante. 
        Retorne APENAS um JSON puro (sem markdown) no formato:
        {
          "match": boolean,
          "gameId": "ID_DO_JOGO_OU_NULL",
          "reason": "Ex: Encontrei Diamantes para Free Fire!",
          "suggestedPackageId": "ID_DO_PACOTE_OU_NULL"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini", // OpenRouter model string
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content || "{}";
      res.json(JSON.parse(content));
    } catch (error: any) {
      console.error("Search Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemInstruction, temperature, tools } = req.body;
      const openai = getOpenAIClient();

      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o", // OpenRouter model string
        messages: [
          { role: "system", content: systemInstruction },
          ...messages
        ],
        temperature: temperature || 0.7,
        stream: true,
        max_tokens: 1000
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("OpenRouter Error:", error);
      const status = error.status || 500;
      const message = error.message || "Erro desconhecido na OpenRouter";
      
      if (status === 401) {
        res.status(401).json({ 
          error: "API Key Inválida ou Ausente. Configure a 'OPENROUTER_API_KEY' no painel de Configurações/Secrets do AI Studio." 
        });
      } else if (status === 402) {
        res.status(402).json({
          error: "Créditos insuficientes na OpenRouter. Por favor, recarregue sua conta ou use um modelo mais barato."
        });
      } else {
        res.status(status).json({ error: message });
      }
    }
  });

  // --- RECHARGE SYSTEM 2026 ---

  // Order Processing
  app.post("/api/buy", async (req, res) => {
    try {
      const { gameId, playerId, packageId, amount, price, userId, paymentMethod } = req.body;

      // 1. Verify Payment (M-Pesa / E-Mola)
      // In a real scenario, we'd call the Vodacom/Movitel API here.
      console.log(`Processing ${paymentMethod} payment for ${userId}...`);
      const paymentConfirmed = true; // Placeholder for real verification logic

      if (!paymentConfirmed) {
        return res.status(400).json({ success: false, message: "Pagamento não confirmado." });
      }

      // 2. Call Top-Up API
      // Using the suggestion provided by the user in the prompt
      console.log(`Calling Top-Up API for ${gameId} - Player: ${playerId}`);
      
      const API_URL = "https://api.topup.com/order"; // Mocked external API
      const API_KEY = process.env.API_KEY;

      if (!API_KEY) {
        // For development/preview, we simulate success if API_KEY is missing
        console.warn("API_KEY not found. Simulating successful recharge.");
        return res.json({
          success: true,
          orderId: `ORDER-${Date.now()}`,
          message: "Recarga enviada com sucesso (Simulação)"
        });
      }

      const response = await axios.post(
        API_URL,
        {
          game: gameId,
          player_id: playerId,
          package: packageId
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`
          }
        }
      );

      res.json({
        success: true,
        data: response.data,
        message: "Recarga processada automaticamente"
      });

    } catch (error: any) {
      console.error("Purchase Error:", error);
      res.status(500).json({
        success: false,
        message: error.response?.data?.message || error.message
      });
    }
  });

  // Balance Management
  app.post("/api/add-balance", async (req, res) => {
    // Logic for resellers or manual balance top-up
    res.json({ success: true, message: "Função em breve" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
