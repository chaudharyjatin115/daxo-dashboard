import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-3">
      <h1 className="font-semibold text-lg">Profile</h1>
      <p>Name: {user.displayName}</p>
      <p>Email: {user.email}</p>
      <p>Provider: {user.providerData[0]?.providerId}</p>
      <p>Joined: {new Date(user.metadata.creationTime).toDateString()}</p>
    </div>
  );
}

