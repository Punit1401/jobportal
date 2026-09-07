"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, ClipboardList, CheckCircle2, Clock, AlertCircle, Trash2, Edit2, Plus } from "lucide-react";

export default function StaffTaskManagement() {
  const [activeTab, setActiveTab] = useState("staff"); // staff or tasks
  const [staffList, setStaffList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Staff Form State
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "" });
  const [staffSaving, setStaffSaving] = useState(false);

  // Task Form State
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
  const [taskSaving, setTaskSaving] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchStaff();
      fetchTasks();
    }
  }, [status]);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      console.log("Fetched Staff Data:", data);
      if (data.success) setStaffList(data.staff);
    } catch (err) {
      console.error("Fetch Staff Error:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks");
      const data = await res.json();
      if (data.success) setTaskList(data.tasks);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffSaving(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff member created successfully!");
        setStaffForm({ name: "", email: "", password: "" });
        fetchStaff();
      } else {
        alert(data.error);
      }
    } finally {
      setStaffSaving(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskSaving(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Task assigned successfully!");
        setTaskForm({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
        fetchTasks();
      } else {
        alert(data.error);
      }
    } finally {
      setTaskSaving(false);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  };

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Staff & Task Management</h1>
            <p className="text-gray-500 font-medium">Manage your team and assign their duties.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "staff" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Team Members
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "tasks" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Task Board
            </button>
          </div>
        </div>

        {activeTab === "staff" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Staff Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <UserPlus size={24} />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Add New Staff</h2>
                </div>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                    <input
                      required
                      type="text"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Initial Password</label>
                    <input
                      required
                      type="password"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    disabled={staffSaving}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                  >
                    {staffSaving ? "Creating..." : "Create Account"}
                  </button>
                </form>
              </div>
            </div>

            {/* Staff List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[600px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-gray-900">Current Staff ({staffList.length})</h2>
                  {/* Debug Info */}
                  <span className="text-[10px] text-gray-300">DB Admins: {loading ? "..." : (staffList.length)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffList.map((member) => (
                    <div key={member._id} className="p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shadow-sm border border-gray-100">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-black text-gray-900 truncate">{member.name}</h4>
                          <p className="text-xs text-gray-500 font-bold truncate">{member.email}</p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                          Active
                        </div>
                      </div>
                    </div>
                  ))}
                  {staffList.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                      No staff members found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Task Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <Plus size={24} />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Assign New Task</h2>
                </div>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Task Title</label>
                    <input
                      required
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800"
                      placeholder="e.g. Audit Resume Data"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Assign To</label>
                    <select
                      required
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800 appearance-none"
                    >
                      <option value="">Select Member</option>
                      {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Priority</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Due Date</label>
                      <input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Instructions</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-bold text-gray-800 min-h-[100px]"
                      placeholder="Describe the task details..."
                    />
                  </div>
                  <button
                    disabled={taskSaving}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {taskSaving ? "Assigning..." : "Assign Task"}
                  </button>
                </form>
              </div>
            </div>

            {/* Task Board */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 min-h-[600px]">
                <h2 className="text-xl font-black text-gray-900 mb-6">Task Pipeline ({taskList.length})</h2>
                <div className="space-y-4">
                  {taskList.map((task) => (
                    <div key={task._id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            task.status === "Completed" ? "bg-emerald-50 text-emerald-600" : 
                            task.status === "In Progress" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"
                          }`}>
                            {task.status === "Completed" ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 leading-tight">{task.title}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned to: {task.assignedTo?.name || "Unknown"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            task.priority === "Urgent" ? "bg-rose-50 text-rose-600" :
                            task.priority === "High" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {task.priority}
                          </span>
                          <button onClick={() => deleteTask(task._id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2">{task.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <AlertCircle size={14} /> Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          task.status === "Completed" ? "text-emerald-500" : "text-amber-500"
                        }`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                  {taskList.length === 0 && (
                    <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                      No tasks assigned yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
