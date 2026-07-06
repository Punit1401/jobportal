"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import UserProfile from "@/components/UserProfile";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // ---------------- Fetch Users ----------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- Delete single user ----------------
  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      setUsers(users.filter((u) => u._id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete user");
    }
  };

  // ---------------- Multi-delete selected users ----------------
  const deleteSelectedUsers = async () => {
    if (selectedUserIds.length === 0)
      return alert("Please select at least one user to delete.");
    if (!confirm(`Are you sure you want to delete ${selectedUserIds.length} selected users?`))
      return;

    try {
      for (const id of selectedUserIds) {
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error deleting user: " + id);
      }

      setUsers(users.filter((u) => !selectedUserIds.includes(u._id)));
      setSelectedUserIds([]);
      alert("Selected users deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete some users");
    }
  };

  // ---------------- Handle Checkbox ----------------
  const handleCheckboxChange = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ---------------- Select All Checkbox ----------------
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const nonAdminIds = users.filter((u) => u.role !== "admin").map((u) => u._id);
      setSelectedUserIds(nonAdminIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  // ---------------- Modal open with profile check ----------------
  const openModal = (user) => {
    // ✅ Check if user has filled any field (not just empty strings)
    const profileFields = [
      "mobile",
      "dob",
      "profession",
      "position",
      "experience",
      "city",
      "reference",
      "linkedin",
      "portfolio",
      "resume",
    ];

    const hasProfile = profileFields.some(
      (key) =>
        user[key] !== undefined &&
        user[key] !== null &&
        user[key].toString().trim() !== ""
    );

    if (!hasProfile) {
      alert("This user hasn’t filled their profile yet.");
      return;
    }

    // ✅ Pass correct data structure to UserProfile
    const formattedUser = {
      fullName: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      dob: user.dob || "",
      profession: user.profession || "",
      position: user.position || "",
      role: user.role || "",
      experience: user.experience || "",
      city: user.city || "",
      reference: user.reference || "",
      skills: user.skills || [],
      linkedin: user.linkedin || "",
      portfolio: user.portfolio || "",
      resume: user.resume || null,
    };

    setSelectedUser(formattedUser);
    setModalOpen(true);
  };

  if (loading) return <p className="p-6">Loading users...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Registered Users</h1>

        {/* ✅ Delete selected button */}
        <button
          onClick={deleteSelectedUsers}
          disabled={selectedUserIds.length === 0}
          className={`px-4 py-2 rounded text-white transition ${
            selectedUserIds.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Delete Selected ({selectedUserIds.length})
        </button>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  users.filter((u) => u.role !== "admin").length > 0 &&
                  selectedUserIds.length ===
                    users.filter((u) => u.role !== "admin").length
                }
              />
            </th>
            
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
            <th className="border p-2">Registered At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-gray-100">
              <td className="border p-2 text-center">
                {u.role !== "admin" && (
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u._id)}
                    onChange={() => handleCheckboxChange(u._id)}
                  />
                )}
              </td>
              <td className="border p-2">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => openModal(u)}
                >
                  {u.name}
                </button>
              </td>
              
              <td className="border p-2">{u.email}</td>
              <td className="border p-2 capitalize">{u.role || "user"}</td>
              <td className="border p-2 flex gap-2">
                <a
                  href={`/admin/users/${u._id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </a>
                {u.role !== "admin" && (
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No users registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* User Profile Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 z-50 relative">
            <Dialog.Title className="text-xl font-bold mb-4">User Profile</Dialog.Title>
            {selectedUser && <UserProfile initialData={selectedUser} readOnly={true} />}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
