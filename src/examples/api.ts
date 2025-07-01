import restify from "../restify";
import { companyApi } from "./company";
import { userApi } from "./user";

const api = restify
  .builder()
  .withHost("https://api.example.com")
  .withErrorHandler(async (response) => {
    const data = await response.json();
    return {
      message: data.message as string,
      code: data.code as number,
      details: data.details as string[],
    };
  })
  .withDefaultToaster((e) => {
    if (e.status === "api_error") {
      const { message, code, details } = e.data;
      console.log(`Error ${code}: ${details} at ${new Date().toISOString()}`);
    }
  })
  .withAutoToast(true)
  .withRoutes({ user: userApi, company: companyApi })
  .build();

export default api;
