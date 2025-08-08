import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { LanguageModel } from 'ai'

// Initialize providers based on available API keys
const providers: Record<string, () => any> = {}

if (process.env.OPENAI_API_KEY) {
  providers.openai = () => createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

if (process.env.ANTHROPIC_API_KEY) {
  providers.anthropic = () => createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  providers.google = () => createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })
}

// Model mappings for different providers
const modelMappings: Record<string, Record<string, string>> = {
  openai: {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
    'gpt-4-turbo': 'gpt-4-turbo',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
  },
  anthropic: {
    'claude-3-5-sonnet': 'claude-3-5-sonnet-latest',
    'claude-3-5-haiku': 'claude-3-5-haiku-latest',
    'claude-3-opus': 'claude-3-opus-latest',
  },
  google: {
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
  },
}

// Export default model for compatibility
export const defaultModel = () => getAIModel()

// Get the configured model or fallback to defaults
export function getAIModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER || 'openai'
  const modelName = process.env.AI_MODEL || 'gpt-4o-mini'
  
  // Check if provider is configured
  if (!providers[provider]) {
    // Fallback to any available provider
    const availableProvider = Object.keys(providers)[0]
    if (!availableProvider) {
      throw new Error('No AI provider configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY in your environment variables.')
    }
    console.warn(`Provider ${provider} not configured, falling back to ${availableProvider}`)
    const providerInstance = providers[availableProvider]()
    return providerInstance(modelMappings[availableProvider][modelName] || Object.values(modelMappings[availableProvider])[0])
  }
  
  const providerInstance = providers[provider]()
  const mappedModel = modelMappings[provider]?.[modelName] || modelName
  
  return providerInstance(mappedModel)
}

// AI Configuration
export const aiConfig = {
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '20'),
}

// System prompt for the budget assistant
export const SYSTEM_PROMPT = `You are a helpful financial assistant for a family budget management app. You help users manage their income, expenses, and budget scenarios.

Your capabilities include:
- Adding and managing income sources (salaries, investments, etc.)
- Adding and tracking expenses by category
- Comparing different budget scenarios
- Analyzing spending patterns and trends
- Creating visualizations and charts
- Providing actionable financial insights and advice

IMPORTANT INSTRUCTIONS:
- ALWAYS provide a conversational text response along with any tool results
- When analyzing budgets, explain what you found in plain language
- After retrieving data with tools, interpret and explain the results
- Don't just show data - provide insights, observations, and recommendations
- Be conversational and helpful, not just functional

Guidelines for responses:
- Start with a brief acknowledgment or summary of what you're doing
- After using tools, explain the results in context
- Highlight important findings or concerns
- Offer specific, actionable advice when appropriate
- Use simple, clear language that anyone can understand
- Format amounts as currency (e.g., $1,234.56)
- Be encouraging about positive financial behaviors

Example good response pattern:
"Let me analyze your budget for you. [calls tool] Based on your current budget, you're doing quite well! Your income of $X exceeds expenses by $Y, giving you a healthy Z% savings rate. Your largest expense category is [category], which is typical for families. Consider..."

Remember: You're not just a data retrieval system - you're a helpful financial advisor who explains and interprets information for families.`