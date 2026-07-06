"use client";

import { useEffect, useState } from "react";

export default function EditUserPage({ params }) {
  const { id } = params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("fullName", user.name);
      formData.append("email", user.email);
      // Add more fields as needed

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update user");
      setMsg("User updated successfully ✅");
    } catch (err) {
      console.error(err);
      setMsg("Failed to update user ❌");
    }
  };

  if (loading) return <p className="p-6">Loading user...</p>;
  if (!user) return <p className="p-6 text-red-500">User not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit User #{id}</h1>

      <form onSubmit={handleUpdate} className="max-w-md space-y-4">
        <input
          type="text"
          value={user.name }
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update User
        </button>
      </form>

      {msg && <p className="mt-4 text-green-600">{msg}</p>}
    </div>
  );
}
