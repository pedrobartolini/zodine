# Zodine - Type-Safe REST API Client Builder

A modern, type-safe REST API client builder for TypeScript/JavaScript applications with React hooks integration, automatic validation, and intelligent error handling.

## Features

- 🔒 **Type Safety**: Full TypeScript support with compile-time validation
- 🏗️ **Builder Pattern**: Fluent API for configuring clients
- ⚡ **React Integration**: Built-in hooks for seamless React usage
- 🛡️ **Validation**: Automatic request/response validation with Zod
- 🔄 **Error Handling**: Comprehensive error types and utilities
- 📝 **Intelligent Mapping**: Response transformation with type inference
- 🎯 **Auto-completion**: Full IDE support with IntelliSense

## Quick Start

```typescript
import Zodine from "./zodine";
import { z } from "zod";

// Define your API routes
const routes = {
  users: {
    getAll: Zodine.get({
      endpoint: "/users",
      responseSchema: Zodine.response(
        z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
          })
        )
      ),
    }),

    getById: Zodine.get({
      endpoint: "/users/:id",
      pathSchema: z.object({ id: z.string() }),
      responseSchema: Zodine.response(
        z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
        })
      ),
    }),

    create: Zodine.post({
      endpoint: "/users",
      bodySchema: z.object({
        name: z.string(),
        email: z.string(),
      }),
      responseSchema: Zodine.response(
        z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
        })
      ),
    }),
  },
};

// Build your API client
const api = Zodine.builder()
  // set host
  .withHost("https://api.example.com")

  // set routes
  .withRoutes(routes)

  // set api error mapper (this callback maps responses when !response.ok)
  .withApiError(async (response) => {
    const error = await response.json();
    return error.message || "Unknown error";
  })

  // set default headers
  .withDefaultHeaders({
    Authorization: "Bearer token",
  })

  // set default toaster
  // if withAutoToast = true, this will be called on every api fetch
  // otherwise, you can call it with response.toast()
  .withDefaultToaster(async (result) => {
    if (result.ok) {
      toast.success("Operation successful!");
    } else {
      toast.error(result.message);
    }
  })

  // set auto toast
  .withAutoToast(true)
  .build();

// Use the API
const users = await api.users.getAll({});
const user = await api.users.getById({ path: { id: "123" } });
const newUser = await api.users.create({
  body: { name: "John", email: "john@example.com" },
});
```

## React Integration

All API methods has a `useHook` variant for easy integration with React components. This hook automatically handles loading states, errors, and re-fetching when parameters change.

```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, error, loading, refresh, setUser] = api.users.getById.useHook({
    path: { id: userId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // if (!user) return <div>User not found</div>; <-- this is not needed as the hook ensures user is defined when not loading or erroring

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Architecture Overview

### Type System (`types.ts`)

- Central location for all TypeScript types
- Request/Response schemas
- Error types
- Function signatures

### Core Builder (`core.ts`)

- `ZodineBuilder` class with fluent interface
- Compile-time validation of required configuration
- Type-safe method generation

### Endpoint Factories (`endpoints.ts`)

- Helper functions for creating typed endpoints
- Support for GET, POST, PUT, DELETE, PATCH
- Type inference for method-specific schemas

### Error Handling (`errors.ts`)

- Structured error types
- Error factory functions
- Type guards for error checking

### Validation (`validation.ts`)

- Input parameter validation
- Response data validation
- Zod schema integration

### React Integration (`hook.ts`)

- `useHook` for reactive API calls
- Automatic re-fetching on parameter changes
- Loading states and error handling

## Advanced Usage

### Custom Response Mapping

```typescript
const userEndpoint = Zodine.get({
  endpoint: "/users/:id",
  pathSchema: z.object({ id: z.string() }),
  responseSchema: Zodine.response(
    z.object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
    }),
    // Mapper function
    (data) => (options: { includeFullName: boolean }) => ({
      ...data,
      fullName: options.includeFullName
        ? `${data.firstName} ${data.lastName}`
        : undefined,
    })
  ),
});

// Usage with mapping
const user = await api.users.getById({
  path: { id: "123" },
  map: { includeFullName: true },
});

user type = {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string; // mapped property automatically inferred
};

```

### Error Handling

```typescript
const result = await api.users.getById({ path: { id: "123" } });

if (result.ok) {
  console.log("User:", result.data);
} else {
  // Handle specific error types
  switch (result.status) {
    case "validation_error":
      console.log("Validation errors:", result.errors);
      break;
    case "network_error":
      console.log("Network error:", result.error);
      break;
    case "api_error":
      console.log("API error:", result.data);
      break;
  }
}
```
