import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    
    let query = {};
    if (session.user.role === "staff") {
      query = { assignedTo: session.user.id };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, assignedTo, priority, dueDate } = await req.json();

    if (!title || !assignedTo) {
      return NextResponse.json({ success: false, error: "Title and Assignee are required" }, { status: 400 });
    }

    await connectMongo();

    const newTask = await Task.create({
      title,
      description,
      assignedTo,
      priority: priority || "Medium",
      dueDate,
      adminId: session.user.id
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Create Task Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, title, description, priority, dueDate } = await req.json();

    await connectMongo();

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Only admin can update details, staff can only update status
    if (session.user.role === "admin") {
      if (status) task.status = status;
      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
    } else if (session.user.role === "staff" && task.assignedTo.toString() === session.user.id) {
      if (status) task.status = status;
    } else {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await task.save();
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Update Task Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      await connectMongo();
      await Task.findByIdAndDelete(id);
  
      return NextResponse.json({ success: true, message: "Task deleted" });
    } catch (error) {
      console.error("Delete Task Error:", error);
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
  }
