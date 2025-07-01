import { z } from "zod";

export enum Status {
  Disabled,
  Enabled,
  EnabledOnline,
}

export enum AccessLevel {
  User = 1,
  Admin = 2,
  Developer = 3,
}

export const userAccessLevelSchema = z.nativeEnum(AccessLevel);

export const userSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  access_level: userAccessLevelSchema,
  last_seen: z.string().nullable(),
  created_at: z.string(),
  created_by: z.string(),
  enabled: z.boolean(),
  image_path: z.string().nullable(),
  company_uid: z.string(),
});

export type User = z.infer<typeof userSchema>;

function access_level_map(access_level: AccessLevel): string {
  switch (access_level) {
    case AccessLevel.User:
      return "Usuário";
    case AccessLevel.Admin:
      return "Administrador";
    case AccessLevel.Developer:
      return "Desenvolvedor";
    default:
      return "Desconhecido";
  }
}

export const userSchemaMapper = (user: z.infer<typeof userSchema>) => {
  let online = false;
  let days_offline = 0;

  if (user.last_seen) {
    let YY, MM, DD, hh, mm, ss, ms;
    let [ymd, hms] = user.last_seen.split(" ");
    [YY, MM, DD] = ymd.split("-");
    [hh, mm, ss] = hms.split(":");
    [ss, ms] = ss.split(".");
    let date;
    if (!ms) {
      date = new Date(Number(YY), Number(MM) - 1, Number(DD), Number(hh), Number(mm), Number(ss));
    } else {
      date = new Date(Number(YY), Number(MM) - 1, Number(DD), Number(hh), Number(mm), Number(ss), Number(ms));
    }
    const secs_offline = Math.floor((Number(new Date()) - Number(date)) / 1000);
    online = secs_offline < 60;
    days_offline = Math.floor(secs_offline / 86400);
  }

  return {
    ...user,
    access_level_pt: access_level_map(user.access_level),
    status: !user.enabled ? Status.Disabled : !online ? Status.Enabled : Status.EnabledOnline,
    online,
    days_offline,
  };
};

export const userActivitySchema = z.object({
  user_uid: z.string(),
  endpoint: z.string(),
  method: z.string(),
  status: z.number().min(0),
  latency: z.number().min(0),
  at: z.string(),
});

export type UserActivity = z.infer<typeof userActivitySchema>;

export const userSessionSchema = z.object({
  user_uid: z.string(),
  ip: z.string(),
  token: z.string(),
  expires_at: z.string(),
  user_agent: z.string().nullable(),
  last_used: z.string().nullable(),
});

export type UserSession = z.infer<typeof userSessionSchema>;

export const userSessionSchemaMapper = (userSession: UserSession) => {
  const unknown = "?";

  const ua = userSession.user_agent;

  let browser = unknown;
  let os = unknown;
  let deviceType = unknown;

  if (ua) {
    // Detect browser
    if (/Edg\//.test(ua)) browser = "Edge";
    else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
    else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";
    else if (/Firefox\//.test(ua)) browser = "Firefox";
    else if (/MSIE|Trident/.test(ua)) browser = "Internet Explorer";
    else if (/Opera|OPR\//.test(ua)) browser = "Opera";

    // Detect OS
    if (/Windows NT 10/.test(ua)) os = "Windows 10";
    else if (/Windows NT 6\.3/.test(ua)) os = "Windows 8.1";
    else if (/Windows NT 6\.2/.test(ua)) os = "Windows 8";
    else if (/Windows NT 6\.1/.test(ua)) os = "Windows 7";
    else if (/Mac OS X/.test(ua)) os = "MacOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/Linux/.test(ua)) os = "Linux";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

    // Detect if Mobile or Desktop
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(ua);
    deviceType = isMobile ? "Mobile" : "Desktop";
  }

  return { ...userSession, browser, os, deviceType };
};

export const userUiPresetSchema = z.object({
  user_uid: z.string(),
  name: z.string(),
  preset_json: z.string(),
});

export type UserUiPreset = z.infer<typeof userUiPresetSchema>;
