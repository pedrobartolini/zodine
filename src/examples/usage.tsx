import api from "./api";

function ExampleComponent() {
  // hook mode
  const [allUsers, allUsersError, allUsersLoading, allUsersRefetch] =
    api.user.get.all.useHook({});

  // hook mode (params allowed)
  const [oneUser, oneUserError, oneUserLoading, oneUserRefetch] =
    api.user.get.one.useHook({ path: { user_uid: "123" } });

  // direct call mode
  async function getAllUsers() {
    const allUsers = await api.user.get.one({ path: { user_uid: "123" } });
    if (allUsers.ok) {
      // data is accessible
      allUsers.data;
    } else {
      // fail message is accessible
      allUsers.message;
    }
  }

  if (allUsersLoading) return <div>Loading...</div>;
  if (allUsersError) return <div>Error: {allUsersError.message}</div>;

  return (
    <div>
      <h1>All Users</h1>
      <ul>
        {allUsers.map((user) => (
          <li key={user.uid}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
      <button onClick={allUsersRefetch}>Refetch Users</button>
      <button onClick={getAllUsers}>Get User by UID</button>
    </div>
  );
}

async function exampleCall() {
  const allUsers = await api.user.put.onePassword({
    path: { user_uid: "123" },
    body: { password: "newpassword123" },
  });
  if (allUsers.ok) {
    // data is accessible
    allUsers.data;
  } else {
    // fail message is accessible
    allUsers.message;
  }
}
