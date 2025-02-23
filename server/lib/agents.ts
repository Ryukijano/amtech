import { getChatResponse } from "./openai";
import { searchProperties } from "./search";
import { storage } from "../storage";
import type { InsertAppointment } from "@shared/schema";

const AGENT_PROMPTS = {
  PROPERTY_SEARCH: `You are a real estate search assistant. Help users find properties by understanding their requirements and preferences. If user asks about scheduling viewings, politely inform them that direct scheduling isn't available and redirect them to search for properties first. Convert user query into search parameters and provide a helpful message. 

  For property searches, respond with a JSON object containing: 
  { 
    minPrice?: number, 
    maxPrice?: number, 
    bedrooms?: number, 
    location?: string, 
    message: string 
  }

  If user asks about scheduling, include this message: "I can't schedule viewings directly, but I can help you find properties. Please provide details such as your price range, number of bedrooms, and location preferences."`,

  FINANCIAL: "You are a financial advisor specializing in real estate. Help users understand mortgages, loans, and property investments. Provide detailed financial advice and calculations where appropriate. Respond with a JSON object containing: { advice: string, calculations?: { [key: string]: number }, recommendations?: string[] }",

  GENERAL: "You are a helpful real estate assistant. Provide general information about properties, buying process, and answer common questions. Be concise and informative. Respond with a JSON object containing: { answer: string, relatedTopics?: string[] }"
};

export async function handlePropertySearch(userQuery: string) {
  // Get search parameters from AI
  const response = await getChatResponse(
    [{ role: "user", content: userQuery }],
    AGENT_PROMPTS.PROPERTY_SEARCH
  );

  const parsed = JSON.parse(response);

  // If it's a scheduling request, return early with the message
  if (userQuery.toLowerCase().includes("schedule") || 
      userQuery.toLowerCase().includes("booking") || 
      userQuery.toLowerCase().includes("viewing")) {
    return {
      properties: [],
      aiResponse: parsed.message
    };
  }

  // Search using both storage and real-time API
  const searchCriteria = {
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    bedrooms: parsed.bedrooms,
    location: parsed.location,
  };

  // Get results from both sources
  const [storageResults, apiResults] = await Promise.all([
    storage.searchProperties(searchCriteria),
    searchProperties(searchCriteria)
  ]);

  // Combine and deduplicate results
  const allProperties = [...storageResults, ...apiResults];
  const uniqueProperties = Array.from(
    new Map(allProperties.map(item => [item.id, item])).values()
  );

  return { 
    properties: uniqueProperties, 
    aiResponse: parsed.message 
  };
}

export async function handleFinancialQuery(userQuery: string) {
  const response = await getChatResponse(
    [{ role: "user", content: userQuery }],
    AGENT_PROMPTS.FINANCIAL
  );
  return JSON.parse(response);
}

export async function handleGeneralQuery(userQuery: string) {
  const response = await getChatResponse(
    [{ role: "user", content: userQuery }],
    AGENT_PROMPTS.GENERAL
  );
  return JSON.parse(response);
}