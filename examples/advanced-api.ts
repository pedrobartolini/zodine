import Zodine from "../src";
import { albums, comments, photos, users } from "./advanced-routes";

// Build a comprehensive API client for testing
const testApi = Zodine.builder()
  .withHost("https://jsonplaceholder.typicode.com/")

  // Advanced error handling
  .withApiError(async (response) => {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || "API Error",
        code: response.status,
        details: errorData
      };
    } catch {
      return {
        message: (await response.text()) || "Unknown API error",
        code: response.status,
        details: null
      };
    }
  })

  // Comprehensive request logging
  .withPrefetch((request) => {
    console.log(`🚀 [${request.method}] ${request.url}`);
    if (request.body) {
      console.log("📤 Request body:", request.body);
    }
    console.log("📋 Headers:", request.headers);
  })

  // Advanced response logging and error handling
  .withPostfetch((response) => {
    const timestamp = new Date().toISOString();

    switch (response.status) {
      case "success":
        console.log(`✅ [${timestamp}] Success:`, response.data);
        break;

      case "validation_error":
        console.error(`❌ [${timestamp}] Validation Error:`, response.error);
        // You could send this to an error tracking service here
        break;

      case "network_error":
        console.error(`🌐 [${timestamp}] Network Error:`, response.error);
        // Handle network retry logic here
        break;

      case "mapper_error":
        console.error(`🔄 [${timestamp}] Mapper Error:`, response.error);
        break;

      case "api_error":
        console.error(
          `🔴 [${timestamp}] API Error [${response.code}]:`,
          response.data
        );

        // Handle specific HTTP status codes
        if (response.code === 401) {
          console.warn("Authentication required - redirecting to login");
          // Handle auth redirect
        } else if (response.code === 403) {
          console.warn("Insufficient permissions");
        } else if (response.code === 404) {
          console.warn("Resource not found");
        } else if (response.code >= 500) {
          console.error("Server error - consider retry");
        }
        break;
    }
  })

  // Dynamic headers with authentication
  .withDefaultHeaders({
    "Content-Type": "application/json",
    "User-Agent": "Zodine-Test-Client/1.0",
    "X-API-Version": "v1"
  })

  // Add all routes
  .withRoutes({
    users,
    comments,
    albums,
    photos
  })
  .build();

export default testApi;
