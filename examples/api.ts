import { z } from "zod";
import Zodine from "../src";
import companyRoutes from "./company";
import userRoutes from "./user";

// Build the API client with the new structured approach
const api = Zodine.builder()
  .withHost("https://api.example.com")

  .withApiError(async (response) => {
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

  .withDefaultHeaders({
    Authentication: "Bearer <SESSION-TOKEN>",
  })

  .withAutoToast(true)

  .withRoutes({
    user: userRoutes,
    company: companyRoutes,

    login: Zodine.post({
      endpoint: "/auth/login",
      bodySchema: z.object({
        email: z.string().email(),
        password: z.string().min(6).max(100),
      }),
      responseSchema: Zodine.response(z.string()), // session token
    }),
  })
  .build();

api.user.get.multiple({ query: { user_uids: [""] } });

export default api;
