# Zodine - Type-Safe REST API Client Builder

A modern, type-safe REST API client builder for TypeScript/JavaScript applications with React hooks integration, automatic validation, and intelligent error handling.

## Features

- 🔒 **Type Safety**: Full TypeScript support with compile-time validation
- ❌ **Error as Value**: No sneaky throws blowing up your app, every error is returned as a value
- 🔄 **Error Handling**: Comprehensive error types and utilities
- 📝 **Intelligent Mapping**: Response transformation with type inference
- 🎯 **Auto-completion**: Full IDE support with IntelliSense
- ⚡ **React Integration**: Built-in hooks for seamless React usage
- 🛡️ **Validation**: Automatic request/response validation with Zod
- 🏗️ **Builder Pattern**: Fluent API for configuring clients

## Quick Start

```typescript
import Zodine from "./zodine";
import { z } from "zod";

// Define your data schema
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

// Define your API routes
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
        name: z.string().min(1),
        email: z.string().email()
      }),
      responseSchema: Zodine.response(userSchema)
    }),

    update: Zodine.put({
      endpoint: "/users/:id",
      pathSchema: z.object({ id: z.string() }),
      querySchema: z.object({
        name: z.string().optional(),
        email: z.string().email().optional()
      }),
      responseSchema: Zodine.response(userSchema)
    }),

    delete: Zodine.delete({
      endpoint: "/users/:id",
      pathSchema: z.object({ id: z.string() }),
      responseSchema: Zodine.response(z.void())
    })
  }
};

// Build your API client
const api = Zodine.builder()
  .withHost("https://api.example.com")
  .withRoutes(routes)

  // Advanced error handling
  .withApiError(async (response) => {
    const error = await response.json();
    return {
      message: error.message || "Unknown error",
      code: response.status,
      details: error
    };
  })

  // Request/Response logging
  .withPrefetch((request) => {
    console.log(`[${request.method}] ${request.url}`);
  })

  .withPostfetch((response) => {
    if (response.status === "success") {
      console.log("✅ Request successful");
    } else if (response.status === "api_error" && response.code === 401) {
      // Handle authentication
      console.warn("Authentication required");
    }
  })

  .withDefaultHeaders({
    Authorization: "Bearer <your-token>",
    "Content-Type": "application/json"
  })
  .build();

// Use the API
const users = await api.users.getAll({});
if (users.status === "success") {
  console.log(`Fetched ${users.data.length} users`);
} else {
  console.error("Error:", users.status, users.error);
}

const user = await api.users.getById({ path: { id: "123" } });
if (user.status === "success") {
  console.log("User:", user.data.name);
}

const newUser = await api.users.create({
  query: { name: "John Doe", email: "john@example.com" }
});
if (newUser.status === "success") {
  console.log("Created user with ID:", newUser.data.id);
}
```

## Basic Usage Examples

### Error-Safe API Calls

```typescript
// All API calls return a result object with status
const result = await api.users.getById({ path: { id: "123" } });

switch (result.status) {
  case "success":
    console.log("User data:", result.data);
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
  case "mapper_error":
    console.error("Response mapping failed:", result.error);
    break;
}
```

### Creating and Updating Resources

```typescript
// Create a new user
const createResult = await api.users.create({
  query: {
    name: "Jane Smith",
    email: "jane@example.com"
  }
});

if (createResult.status === "success") {
  // Update the user
  const updateResult = await api.users.update({
    path: { id: createResult.data.id.toString() },
    query: { name: "Jane Doe" }
  });

  if (updateResult.status === "success") {
    console.log("User updated:", updateResult.data);
  }
}
```

## React Integration

Zodine provides seamless React integration with built-in hooks that handle loading states, errors, and automatic re-fetching when parameters change.

### Basic Hook Usage

```typescript
import React from "react";

function UserProfile({ userId }: { userId: string }) {
  const [user, error, loading, refresh, setUser] = api.users.getById.useHook({
    path: { id: userId }
  });

  if (loading) return <div>Loading user...</div>;

  if (error) {
    return (
      <div>
        <p>Error: {error.status}</p>
        <button onClick={() => refresh(true)}>Retry</button>
      </div>
    );
  }

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
function LazyUserProfile({ userId }: { userId: string }) {
  const [user, error, loading, refresh] = api.users.getById.useHook({
    path: { id: userId },
    lazy: true // Don't fetch automatically on mount
  });

  const handleLoadUser = () => {
    refresh(true); // Force refresh and show loading state
  };

  return (
    <div>
      <button onClick={handleLoadUser} disabled={loading}>
        {loading ? "Loading..." : "Load User"}
      </button>

      {error && <div>Error: {error.status}</div>}
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}
```

### Form Handling and Creation

```typescript
function CreateUserForm() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await api.users.create({
      query: formData
    });

    if (response.status === "success") {
      setResult(`User created with ID: ${response.data.id}`);
      setFormData({ name: "", email: "" });
    } else {
      setResult(`Error: ${response.status}`);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create User"}
      </button>
      {result && <p>{result}</p>}
    </form>
  );
}
```

### Optimistic Updates

```typescript
function EditableUserProfile({ userId }: { userId: string }) {
  const [user, error, loading, refresh, setUser] = api.users.getById.useHook({
    path: { id: userId }
  });

  const [editData, setEditData] = React.useState<{ name?: string; email?: string }>({});

  const handleSave = async () => {
    if (!user) return;

    // Optimistic update
    const optimisticUser = { ...user, ...editData };
    setUser(optimisticUser);

    // Send API request
    const response = await api.users.update({
      path: { id: userId },
      query: editData
    });

    if (response.status === "success") {
      setUser(response.data);
      setEditData({});
    } else {
      // Revert on error
      setUser(user);
      console.error("Update failed:", response);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.status}</div>;

  return (
    <div>
      <input
        value={editData.name ?? user.name}
        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
      />
      <input
        value={editData.email ?? user.email}
        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
      />
      <button onClick={handleSave} disabled={Object.keys(editData).length === 0}>
        Save Changes
      </button>
    </div>
  );
}
```

### Custom Hooks

```typescript
function useUserOperations() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const deleteUser = React.useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    const response = await api.users.delete({
      path: { id: userId }
    });

    setLoading(false);

    if (response.status === "success") {
      return true;
    } else {
      setError(`Failed to delete user: ${response.status}`);
      return false;
    }
  }, []);

  return { deleteUser, loading, error };
}
```

## 📚 Comprehensive Examples

The `examples/` folder contains three key files demonstrating Zodine's capabilities:

### 📁 Examples Structure

- **`advanced-routes.ts`** - Comprehensive route definitions with complex schemas for Users, Comments, Albums, and Photos
- **`advanced-api.ts`** - Advanced API client configuration with error handling, logging, and multi-resource setup
- **`advanced-react.tsx`** - React components showcasing complex state management, user interactions, and real-world patterns

### 🎯 Key Components

#### 1. **Advanced Route Definitions** (`advanced-routes.ts`)

Complete API schema definitions with Zod validation:

```typescript
// User schema with optional nested objects
const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      zipcode: z.string()
    })
    .optional()
});

// CRUD operations for users
const users = {
  getAll: Zodine.get({
    endpoint: "/users",
    responseSchema: Zodine.response(userSchema.array())
  }),
  getById: Zodine.get({
    endpoint: "/users/:id",
    pathSchema: z.object({ id: z.number().int() }),
    responseSchema: Zodine.response(userSchema)
  })
  // ... create, update, delete operations
};
```

#### 2. **Advanced API Client** (`advanced-api.ts`)

Production-ready API client with comprehensive error handling:

```typescript
const testApi = Zodine.builder()
  .withHost("https://jsonplaceholder.typicode.com/")

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

  .withPrefetch((request) => {
    console.log(`🚀 [${request.method}] ${request.url}`);
  })

  .withRoutes({ users, comments, albums, photos })
  .build();
```

#### 3. **Advanced React Components** (`advanced-react.tsx`)

Real-world React patterns and state management:

```tsx
// User management with selection and CRUD operations
export function AdvancedUserManagement() {
  const [users, error, loading, refresh] = testApi.users.getAll.useHook({});
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <ErrorDisplay error={error} onRetry={() => refresh(true)} />;

  return (
    <div>
      <UsersList users={users} onSelect={setSelectedUserId} />
      {selectedUserId && <UserDetails userId={selectedUserId} />}
    </div>
  );
}

// Photo gallery with pagination and filtering
export function PhotoGallery() {
  const [currentPage, setCurrentPage] = useState(0);
  const [albumFilter, setAlbumFilter] = useState<number | null>(null);

  const [photos] = testApi.photos.getAll.useHook({
    query: {
      _limit: 20,
      _start: currentPage * 20,
      ...(albumFilter && { albumId: albumFilter })
    }
  });

  return (
    <div>
      <AlbumFilter onChange={setAlbumFilter} />
      <PhotoGrid photos={photos} />
      <Pagination current={currentPage} onChange={setCurrentPage} />
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
