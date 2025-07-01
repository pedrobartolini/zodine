import { z } from "zod";

export const companySchema = z.object({
  uid: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  created_by: z.string(),
  stock_client_key: z.string().nullable(),
  image_path: z.string().nullable(),
  things: z.array(z.string()),
  apps: z.array(z.string()),
  clients: z.array(z.string()),
  users: z.array(z.string()),
  mqtt_key: z.string().nullable(),
});

export type Company = z.infer<typeof companySchema>;
