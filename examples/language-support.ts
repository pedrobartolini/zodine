import { z } from "zod";
import Zodine from "../src";

// Example user route definition
const userRoutes = {
  getUser: Zodine.get({
    endpoint: "/users/:id",
    pathSchema: z.object({
      id: z.string()
    }),
    responseSchema: Zodine.response(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string()
      })
    )
  }),

  createUser: Zodine.post({
    endpoint: "/users",
    bodySchema: z.object({
      name: z.string(),
      email: z.string()
    }),
    responseSchema: Zodine.response(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string()
      })
    )
  })
};

// Example 1: Using English (default)
const apiEnglish = Zodine.builder()
  .withHost("https://jsonplaceholder.typicode.com")
  .withLanguage("en") // English error messages
  .withRoutes(userRoutes)
  .withApiError(async (response) => {
    return `Error ${response.status}: ${response.statusText}`;
  })
  .build();

// Example 2: Using Portuguese (Brazil)
const apiBrazilian = Zodine.builder()
  .withHost("https://jsonplaceholder.typicode.com")
  .withLanguage("br") // Portuguese error messages
  .withRoutes(userRoutes)
  .withApiError(async (response) => {
    return `Erro ${response.status}: ${response.statusText}`;
  })
  .build();

// Example usage
async function demonstrateLanguageSupport() {
  console.log("=== English API ===");

  // This will show validation errors in English
  const englishResult = await apiEnglish.getUser({
    path: { id: "invalid" } // This will cause validation error
  });

  if (!englishResult.ok) {
    console.log("English error message:", englishResult.message);
  }

  console.log("\\n=== Brazilian Portuguese API ===");

  // This will show validation errors in Portuguese
  const brazilianResult = await apiBrazilian.getUser({
    path: { id: "invalid" } // This will cause validation error
  });

  if (!brazilianResult.ok) {
    console.log("Portuguese error message:", brazilianResult.message);
  }
}

// Example of chaining withLanguage with other methods
const flexibleApi = Zodine.builder()
  .withHost("https://api.example.com")
  .withLanguage("br") // Set language first
  .withDefaultHeaders({
    Authorization: "Bearer token",
    "Content-Type": "application/json"
  })
  .withRoutes(userRoutes)
  .withApiError(async (response) => {
    return `Erro da API: ${response.status}`;
  })
  .build();

// The language can also be set at any point in the chain
const anotherApi = Zodine.builder()
  .withHost("https://api.example.com")
  .withRoutes(userRoutes)
  .withLanguage("en") // Set language after routes
  .withApiError(async (response) => {
    return `API Error: ${response.status}`;
  })
  .build();

export { anotherApi, apiBrazilian, apiEnglish, demonstrateLanguageSupport, flexibleApi };
