# Zodine

A type-safe REST API client builder for TypeScript with React hooks and Zod validation.

## Features

- 🔒 **Type Safety** - Full TypeScript support with compile-time validation
- ❌ **Error as Value** - No thrown errors, all errors returned as values
- ⚡ **React Hooks** - Built-in React integration with loading states
- 🛡️ **Validation** - Automatic request/response validation with Zod
- 🎯 **Auto-completion** - Full IDE support

## Quick Start

```typescript
import Zodine from "./zodine";
import { z } from "zod";

// 1. Define your schema
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

// 2. Define your routes
const routes = {
  users: {
    getAll: Zodine.get({
      endpoint: "/users",
      responseSchema: Zodine.response(userSchema.array())
    }),
    getById: Zodine.get({
      endpoint: "/users/:id",
      pathSchema: z.object({ id: z.string() }),
      responseSchema: Zodine.response(userSchema)
    }),
    create: Zodine.post({
      endpoint: "/users",
      querySchema: z.object({
        name: z.string(),
        email: z.string().email()
      }),
      responseSchema: Zodine.response(userSchema)
    })
  }
};

// 3. Build your API client
const api = Zodine.builder()
  .withHost("https://api.example.com")
  .withRoutes(routes)
  .build();

// 4. Use it
const users = await api.users.getAll({});
if (users.status === "success") {
  console.log(users.data); // Fully typed user array
}
```

## Error Handling

All API calls return a result object with a status field:

```typescript
const result = await api.users.getById({ path: { id: "123" } });

switch (result.status) {
  case "success":
    console.log("User:", result.data);
    break;
  case "validation_error":
    console.error("Invalid request:", result.error);
    break;
  case "network_error":
    console.error("Network failed:", result.error);
    break;
  case "api_error":
    console.error(`API error [${result.code}]:`, result.data);
    break;
}
```

## React Integration

Use the built-in React hooks for automatic loading states and error handling:

```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, error, loading, refresh] = api.users.getById.useHook({
    path: { id: userId }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.status}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => refresh()}>Refresh</button>
    </div>
  );
}
```

### Lazy Loading

```typescript
const [user, error, loading, refresh] = api.users.getById.useHook({
  path: { id: userId },
  lazy: true // Don't fetch on mount
});

// Trigger fetch manually
<button onClick={() => refresh(true)}>Load User</button>
```

## Advanced Configuration

```typescript
const api = Zodine.builder()
  .withHost("https://api.example.com")
  .withRoutes(routes)
  .withDefaultHeaders({
    Authorization: "Bearer <token>",
    "Content-Type": "application/json"
  })
  .withApiError(async (response) => {
    const error = await response.json();
    return {
      message: error.message || "Unknown error",
      code: response.status,
      details: error
    };
  })
  .withPrefetch((request) => {
    console.log(`[${request.method}] ${request.url}`);
  })
  .build();
```

## Examples

Check the `examples/` folder for comprehensive examples:

- **`advanced-routes.ts`** - Complex route definitions with nested schemas
- **`advanced-api.ts`** - Production-ready API client configuration
- **`advanced-react.tsx`** - Real-world React patterns and state management
