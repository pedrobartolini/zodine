// import { ErrorUtils } from "../src";
// import api from "./api";
// import { AccessLevel } from "./user/schema";

// function ExampleComponent() {
//   const [allUsers, allUsersError, allUsersLoading, allUsersRefetch] =
//     api.user.get.all.useHook({});

//   // Hook mode with path parameters
//   const [oneUser, oneUserError, oneUserLoading, oneUserRefetch, setOneUser] =
//     api.user.get.one.useHook({ path: { user_uid: "123" } });

//   // Lazy hook that doesn't fetch on mount, only when refresh is called
//   const [lazyUser, lazyUserError, lazyUserLoading, lazyUserRefetch] =
//     api.user.get.one.useHook({ path: { user_uid: "456" }, lazy: true });

//   // Direct call mode with proper error handling
//   async function getAllUsers() {
//     const result = await api.user.get.one({ path: { user_uid: "123" } });

//     if (ErrorUtils.isSuccess(result)) {
//       // Type-safe access to data
//       console.log("User data:", result.data);
//       setOneUser(result.data);
//     } else {
//       // Type-safe error handling
//       console.error("API call failed:", result.message);

//       // Handle specific error types
//       switch (result.status) {
//         case "api_error":
//           // Custom error type is properly typed
//           const apiError = result.data;
//           console.error(`API Error ${apiError.code}: ${apiError.message}`);
//           break;
//         case "validation_error":
//           console.error("Validation errors:", result.errors.issues);
//           break;
//         case "network_error":
//           console.error("Network error:", result.error.message);
//           break;
//         case "mapper_error":
//           console.error("Mapper error:", result.error.message);
//           break;
//       }
//     }
//   }

//   // Example of creating a new user
//   async function createUser() {
//     const result = await api.user.post.one({
//       body: {
//         name: "John Claude Van Damme",
//         email: "john@example.com",
//         password: "securePassword123!",
//         access_level: AccessLevel.User,
//         company_uid: "company-123"
//       }
//     });

//     if (ErrorUtils.isSuccess(result)) {
//       console.log("User created:", result.data);
//       allUsersRefetch();
//     } else {
//       console.error("Failed to create user:", result.message);
//     }
//   }

//   // Loading state
//   if (allUsersLoading) {
//     return <div className="loading">Loading users...</div>;
//   }

//   // Error state
//   if (allUsersError) {
//     return (
//       <div className="error">
//         <h2>Error Loading Users</h2>
//         <p>{allUsersError.message}</p>
//         <button onClick={allUsersRefetch}>Try Again</button>
//       </div>
//     );
//   }

//   // Success state
//   return (
//     <div className="users-container">
//       <h1>All Users</h1>
//       <div className="users-list">
//         {allUsers?.map((user) => (
//           <div key={user.uid} className="user-card">
//             <h3>{user.name}</h3>
//             <p>Email: {user.email}</p>
//             <p>Access Level: {user.access_level}</p>
//             <p>Status: {user.enabled ? "Enabled" : "Disabled"}</p>
//             <p>Company: {user.company_uid}</p>
//           </div>
//         ))}
//       </div>

//       <div className="actions">
//         <button onClick={allUsersRefetch}>Refresh Users</button>
//         <button onClick={getAllUsers}>Get Specific User</button>
//         <button onClick={createUser}>Create New User</button>
//       </div>

//       {oneUser && !oneUserLoading && (
//         <div className="single-user">
//           <h2>Selected User</h2>
//           <div className="user-card">
//             <h3>{oneUser.name}</h3>
//             <p>Email: {oneUser.email}</p>
//             <p>Access Level: {oneUser.access_level}</p>
//             <p>Status: {oneUser.enabled ? "Enabled" : "Disabled"}</p>
//             <button onClick={oneUserRefetch}>Refresh</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Example of a more complex operation
// async function exampleComplexOperation() {
//   try {
//     // Update user password
//     const passwordResult = await api.user.put.onePassword({
//       path: { user_uid: "123" },
//       body: { password: "newSecurePassword123!" }
//     });

//     if (ErrorUtils.isSuccess(passwordResult)) {
//       console.log("Password updated successfully");

//       // Update user name
//       const profileResult = await api.user.put.oneName({
//         path: { user_uid: "123" },
//         body: {
//           name: "John Updated"
//         }
//       });

//       if (ErrorUtils.isSuccess(profileResult)) {
//         console.log("Profile updated:", profileResult.data);
//       } else {
//         console.error("Profile update failed:", profileResult.message);
//       }
//     } else {
//       console.error("Password update failed:", passwordResult.message);
//     }
//   } catch (error) {
//     console.error("Unexpected error:", error);
//   }
// }

// export default ExampleComponent;
