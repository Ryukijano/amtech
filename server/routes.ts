import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { handlePropertySearch, handleFinancialQuery, handleGeneralQuery } from "./lib/agents";
import { insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Get chat history
  app.get("/api/messages", async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  // Send message and get response
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, type } = req.body;

      // Store user message
      const userMessage = insertMessageSchema.parse({
        content: message,
        role: "user",
        timestamp: new Date(),
      });
      await storage.addMessage(userMessage);

      // Get AI response based on message type
      let response;
      switch (type) {
        case "property_search":
          response = await handlePropertySearch(message);
          break;
        case "financial":
          response = await handleFinancialQuery(message);
          break;
        default:
          response = await handleGeneralQuery(message);
      }

      // Store AI response
      const aiMessage = insertMessageSchema.parse({
        content: JSON.stringify(response),
        role: "assistant",
        timestamp: new Date(),
      });
      await storage.addMessage(aiMessage);

      res.json(response);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get properties
  app.get("/api/properties", async (req, res) => {
    const properties = await storage.getProperties();
    res.json(properties);
  });

  const httpServer = createServer(app);
  return httpServer;
}