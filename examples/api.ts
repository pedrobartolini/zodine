import Zodine from "../src";
import post from "./post";

// Build the API client with the new structured approach
const api = Zodine.builder()
  .withHost("https://jsonplaceholder.typicode.com/")

  .withApiError(async (response) => {
    return;
  })

  .withPrefetch((request) => {
    console.log("API Request:", request.method, request.url);
  })

  .withPostfetch((response) => {
    if (response.status === "validation_error") {
      console.error("Validation Error:", response.error);
    } else if (response.status === "network_error") {
      console.error("Network Error:", response.error);
    } else if (response.status === "mapper_error") {
      console.error("Mapper Error:", response.error);
    } else if (response.status === "api_error" && response.code !== 401) {
      console.error(`API Error [${response.code}]:`, response.data);
    }
  })

  .withDefaultHeaders({
    Authentication: "Bearer <SESSION-TOKEN>"
  })

  .withRoutes({ post })
  .build();

export default api;
