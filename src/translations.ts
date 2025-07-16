export type Language = "en" | "br";

export interface Translations {
  validation: {
    invalidRequestBody: string;
    invalidFormData: string;
    invalidQueryParameters: string;
    invalidHeaders: string;
    invalidUrlParameters: string;
    invalidResponse: string;
  };
  errors: {
    requestFailed: string;
    mapperError: string;
    invalidErrorFormat: string;
    undefinedParams: string;
  };
  builder: {
    hostRequired: string;
    routesRequired: string;
    errorHandlerRequired: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    validation: {
      invalidRequestBody: "Invalid request body",
      invalidFormData: "Invalid form data",
      invalidQueryParameters: "Invalid query parameters",
      invalidHeaders: "Invalid headers",
      invalidUrlParameters: "Invalid URL parameters",
      invalidResponse: "Unable to validate response"
    },
    errors: {
      requestFailed: "Unable to complete the request",
      mapperError: "Error applying mapper to response",
      invalidErrorFormat: "Invalid error message format",
      undefinedParams: "Undefined parameters present"
    },
    builder: {
      hostRequired: "❌ Host is required - use .withHost() first",
      routesRequired: "❌ Routes are required - use .withRoutes() first",
      errorHandlerRequired: "❌ Error handler is required - use .withErrorHandler() first"
    }
  },
  br: {
    validation: {
      invalidRequestBody: "Corpo da requisição inválido",
      invalidFormData: "Dados do formulário inválidos",
      invalidQueryParameters: "Parâmetros de consulta inválidos",
      invalidHeaders: "Cabeçalhos inválidos",
      invalidUrlParameters: "Parâmetros de URL inválidos",
      invalidResponse: "Não foi possível validar a resposta"
    },
    errors: {
      requestFailed: "Não foi possível completar a requisição",
      mapperError: "Erro ao aplicar o mapper na resposta",
      invalidErrorFormat: "Formato de mensagem de erro inválido",
      undefinedParams: "Parâmetros 'undefined' presentes"
    },
    builder: {
      hostRequired: "❌ Host é obrigatório - use .withHost() primeiro",
      routesRequired: "❌ Rotas são obrigatórias - use .withRoutes() primeiro",
      errorHandlerRequired: "❌ Manipulador de erro é obrigatório - use .withErrorHandler() primeiro"
    }
  }
};

export function getTranslations(language: Language = "en"): Translations {
  return translations[language];
}

export function t(language: Language = "en"): Translations {
  return getTranslations(language);
}
