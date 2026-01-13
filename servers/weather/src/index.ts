#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Prompt,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Weather MCP Server - Educational Demo with Real API Integration
 *
 * This server demonstrates ALL MCP capabilities:
 * - TOOLS: Functions to fetch weather data
 * - RESOURCES: Weather data as accessible resources
 * - PROMPTS: Templates for weather analysis
 *
 * Educational Features:
 * - Shows how to integrate external APIs (OpenWeather)
 * - Demonstrates graceful fallback to mock data
 * - Illustrates real-world MCP server design patterns
 * - Teaches API key management and configuration
 *
 * Setup:
 * - Set OPENWEATHER_API_KEY environment variable for real data
 * - Falls back to educational mock data if no key is provided
 */

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  forecast: string[];
  lastUpdated: string;
  source: 'api' | 'mock';  // Track data source for educational purposes
}

// Configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const USE_REAL_API = !!OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'your_api_key_here';

// Weather data cache
const weatherCache = new Map<string, WeatherData>();

// Log startup configuration
if (USE_REAL_API) {
  console.error('✓ OpenWeather API configured - using real weather data');
} else {
  console.error('ℹ No API key found - using educational mock data');
  console.error('  Set OPENWEATHER_API_KEY environment variable to use real weather data');
}

/**
 * Fetch weather data from OpenWeather API
 * Educational: Shows real-world API integration
 */
async function fetchRealWeather(city: string): Promise<WeatherData | null> {
  if (!USE_REAL_API) return null;

  try {
    // Fetch current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      return null;
    }

    const currentData = await currentResponse.json();

    // Fetch forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);

    let forecast: string[] = [];
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      // Get one forecast per day
      forecast = forecastData.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: any) => item.weather[0].main);
    }

    const weatherData: WeatherData = {
      city: currentData.name,
      country: currentData.sys.country,
      temperature: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
      conditions: currentData.weather[0].main,
      forecast: forecast.length > 0 ? forecast : ["Unknown", "Unknown", "Unknown", "Unknown", "Unknown"],
      lastUpdated: new Date().toISOString(),
      source: 'api'
    };

    // Cache for 10 minutes
    weatherCache.set(city.toLowerCase(), weatherData);
    setTimeout(() => weatherCache.delete(city.toLowerCase()), 10 * 60 * 1000);

    return weatherData;
  } catch (error) {
    console.error(`Failed to fetch weather for ${city}:`, error);
    return null;
  }
}

/**
 * Initialize sample weather data for educational purposes
 * Used when no API key is configured
 */
function initializeMockWeatherData() {
  const cities: Omit<WeatherData, 'source'>[] = [
    {
      city: "San Francisco",
      country: "USA",
      temperature: 18,
      feelsLike: 16,
      humidity: 72,
      windSpeed: 15,
      conditions: "Partly Cloudy",
      forecast: ["Sunny", "Cloudy", "Partly Cloudy", "Sunny", "Clear"],
      lastUpdated: new Date().toISOString(),
    },
    {
      city: "London",
      country: "UK",
      temperature: 12,
      feelsLike: 10,
      humidity: 85,
      windSpeed: 20,
      conditions: "Rainy",
      forecast: ["Rainy", "Cloudy", "Rainy", "Partly Cloudy", "Cloudy"],
      lastUpdated: new Date().toISOString(),
    },
    {
      city: "Tokyo",
      country: "Japan",
      temperature: 22,
      feelsLike: 21,
      humidity: 65,
      windSpeed: 10,
      conditions: "Clear",
      forecast: ["Clear", "Sunny", "Partly Cloudy", "Sunny", "Clear"],
      lastUpdated: new Date().toISOString(),
    },
    {
      city: "Sydney",
      country: "Australia",
      temperature: 25,
      feelsLike: 27,
      humidity: 60,
      windSpeed: 12,
      conditions: "Sunny",
      forecast: ["Sunny", "Clear", "Sunny", "Partly Cloudy", "Sunny"],
      lastUpdated: new Date().toISOString(),
    },
  ];

  cities.forEach((data) => {
    weatherCache.set(data.city.toLowerCase(), { ...data, source: 'mock' });
  });
}

// Initialize mock data
initializeMockWeatherData();

/**
 * Get weather data with intelligent fallback
 * Educational: Demonstrates resilient service design
 */
async function getWeatherData(city: string): Promise<WeatherData | null> {
  const cityLower = city.toLowerCase();

  // Try cache first
  const cached = weatherCache.get(cityLower);
  if (cached && cached.source === 'api') {
    return cached;
  }

  // Try real API if configured
  if (USE_REAL_API) {
    const realData = await fetchRealWeather(city);
    if (realData) {
      return realData;
    }
  }

  // Fall back to cache (mock data)
  return weatherCache.get(cityLower) || null;
}

// Define tools
const TOOLS: Tool[] = [
  {
    name: "get_current_weather",
    description: "Get current weather for a city",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" },
      },
      required: ["city"],
    },
  },
  {
    name: "get_forecast",
    description: "Get 5-day weather forecast for a city",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" },
      },
      required: ["city"],
    },
  },
  {
    name: "compare_weather",
    description: "Compare weather between two cities",
    inputSchema: {
      type: "object",
      properties: {
        city1: { type: "string", description: "First city" },
        city2: { type: "string", description: "Second city" },
      },
      required: ["city1", "city2"],
    },
  },
];

// Define prompts
const PROMPTS: Prompt[] = [
  {
    name: "weather_analysis",
    description: "Analyze weather conditions and provide recommendations",
    arguments: [
      {
        name: "city",
        description: "City to analyze",
        required: true,
      },
    ],
  },
  {
    name: "travel_recommendation",
    description: "Generate travel recommendations based on weather",
    arguments: [
      {
        name: "destination",
        description: "Travel destination",
        required: true,
      },
      {
        name: "activity",
        description: "Planned activity (e.g., hiking, sightseeing)",
        required: false,
      },
    ],
  },
];

// Create and configure the MCP server
const server = new Server(
  {
    name: "weather-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        listChanged: true,  // Server will notify when tool list changes
      },
      resources: {
        listChanged: true,  // Server will notify when resource list changes
        subscribe: true,    // Server supports resource subscriptions
      },
      prompts: {
        listChanged: true,  // Server will notify when prompt list changes
      },
    },
  }
);

// RESOURCES: List available weather data
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = Array.from(weatherCache.values()).map((data) => ({
    uri: `weather:///${data.city.toLowerCase()}`,
    mimeType: "application/json",
    name: `Weather in ${data.city}`,
    description: `Current weather and forecast for ${data.city}, ${data.country}`,
  }));

  return { resources };
});

// RESOURCES: Read weather data
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const city = url.pathname.substring(1);

  const weatherData = weatherCache.get(city);
  if (!weatherData) {
    throw new Error(`Weather data not found for: ${city}`);
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(weatherData, null, 2),
      },
    ],
  };
});

// TOOLS: List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// TOOLS: Execute tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    switch (name) {
      case "get_current_weather": {
        const city = args.city as string;
        const weather = await getWeatherData(city);

        if (!weather) {
          throw new Error(
            `Weather data not available for ${city}. ` +
            (USE_REAL_API
              ? `City not found. Try cities like: London, Tokyo, New York, Paris`
              : `Available mock cities: ${Array.from(weatherCache.keys()).join(", ")}`)
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  city: weather.city,
                  country: weather.country,
                  temperature: `${weather.temperature}°C`,
                  feelsLike: `${weather.feelsLike}°C`,
                  humidity: `${weather.humidity}%`,
                  windSpeed: `${weather.windSpeed} km/h`,
                  conditions: weather.conditions,
                  lastUpdated: weather.lastUpdated,
                  dataSource: weather.source === 'api' ? 'Real-time API data' : 'Educational mock data'
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_forecast": {
        const city = args.city as string;
        const weather = await getWeatherData(city);

        if (!weather) {
          throw new Error(`Weather data not available for ${city}`);
        }

        const forecastWithDays = weather.forecast.map((conditions, index) => ({
          day: index + 1,
          conditions,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  city: weather.city,
                  country: weather.country,
                  forecast: forecastWithDays,
                  dataSource: weather.source === 'api' ? 'Real-time API data' : 'Educational mock data'
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "compare_weather": {
        const city1 = args.city1 as string;
        const city2 = args.city2 as string;

        const weather1 = await getWeatherData(city1);
        const weather2 = await getWeatherData(city2);

        if (!weather1 || !weather2) {
          throw new Error("Weather data not available for one or both cities");
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  comparison: {
                    [weather1.city]: {
                      temperature: `${weather1.temperature}°C`,
                      conditions: weather1.conditions,
                      humidity: `${weather1.humidity}%`,
                    },
                    [weather2.city]: {
                      temperature: `${weather2.temperature}°C`,
                      conditions: weather2.conditions,
                      humidity: `${weather2.humidity}%`,
                    },
                  },
                  temperatureDifference: `${Math.abs(
                    weather1.temperature - weather2.temperature
                  )}°C`,
                  warmerCity:
                    weather1.temperature > weather2.temperature
                      ? weather1.city
                      : weather2.city,
                  dataSource: weather1.source === 'api' || weather2.source === 'api'
                    ? 'Includes real-time API data'
                    : 'Educational mock data'
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// PROMPTS: List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts: PROMPTS };
});

// PROMPTS: Get prompt templates
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let promptText: string;

  switch (name) {
    case "weather_analysis": {
      const city = args?.city as string;
      const weather = await getWeatherData(city);

      if (!weather) {
        throw new Error(`Weather data not available for ${city}`);
      }

      const dataSourceNote = weather.source === 'api'
        ? '(This is real-time weather data from OpenWeather API)'
        : '(This is educational mock data - configure OPENWEATHER_API_KEY for real data)';

      promptText = `Analyze the current weather conditions in ${weather.city}, ${weather.country}:

Current Conditions:
- Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Weather: ${weather.conditions}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h

5-Day Forecast: ${weather.forecast.join(", ")}

Data Source: ${dataSourceNote}

Please provide:
1. Overall weather assessment
2. Recommendations for outdoor activities
3. What to wear
4. Any weather alerts or concerns
5. Best times for outdoor activities today`;
      break;
    }

    case "travel_recommendation": {
      const destination = args?.destination as string;
      const activity = (args?.activity as string) || "general sightseeing";
      const weather = await getWeatherData(destination);

      if (!weather) {
        promptText = `Generate travel recommendations for ${destination} with a focus on ${activity}.

Please provide:
1. Best time to visit based on typical weather patterns
2. What to pack for ${activity}
3. Weather-related tips for travelers
4. Alternative activities if weather is poor
5. Local weather patterns to be aware of

Note: Current weather data not available. Base recommendations on general knowledge.`;
      } else {
        const dataSourceNote = weather.source === 'api'
          ? '(Real-time data from OpenWeather API)'
          : '(Educational mock data)';

        promptText = `Generate travel recommendations for ${weather.city}, ${weather.country} with a focus on ${activity}.

Current Weather ${dataSourceNote}:
- Temperature: ${weather.temperature}°C
- Conditions: ${weather.conditions}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h
- 5-Day Forecast: ${weather.forecast.join(", ")}

Please provide:
1. Is now a good time to visit for ${activity}?
2. What to pack based on current and forecasted weather
3. Weather-appropriate activities
4. Alternative indoor activities if weather turns bad
5. Tips for enjoying ${activity} in these conditions`;
      }
      break;
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: promptText,
        },
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
