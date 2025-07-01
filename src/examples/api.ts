import Zodine from "../zodine";
import { companyApi } from "./company";
import { userApi } from "./user";

// Define the error type for the API
type ApiError = {
  message: string;
  code: number;
  details: string[];
};

// Build the API client with the new structured approach
const api = Zodine.builder()
  .withHost("https://api.example.com")
  .withErrorHandler(async (response): Promise<ApiError> => {
    const data = await response.json();
    return {
      message: data.message as string,
      code: data.code as number,
      details: data.details as string[],
    };
  })
  .withDefaultToaster((result) => {
    if (result.status === "api_error") {
      const { message, code, details } = result.data;
      console.log(
        `Error ${code}: ${message} - ${details.join(
          ", "
        )} at ${new Date().toISOString()}`
      );
    } else if (result.status === "success") {
      console.log("Operation completed successfully");
    }
  })
  .withAutoToast(true)
  .withDefaultHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  })
  .withRoutes({ user: userApi, company: companyApi })
  .build();

export default api;
export type { ApiError };
