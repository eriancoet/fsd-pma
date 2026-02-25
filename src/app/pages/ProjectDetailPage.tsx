import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Plus,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import type { Task, Status, Priority } from "../types";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const statusColumns: { status: Status; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "doing", label: "Doing" },
  { status: "done", label: "Done" },
];

function DraggableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return drag(
    <div style={{ opacity: isDragging ? 0.5 : 1 }}>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  tasks,
  onEdit,
  onDelete,
  onDrop,
}: {
  status: Status;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDrop: (taskId: string, newStatus: Status) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: string; status: Status }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return drop(
    <div
      className={`bg-muted/40 border border-border rounded-lg p-4 min-h-[500px] ${
        isOver ? "ring-2 ring-ring bg-muted" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{label}</h3>
        <span className="text-sm text-muted-foreground bg-background border border-border px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { projects, getProjectTasks, createTask, updateTask, deleteTask } =
    useData();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] =
    useState<"kanban" | "list">("kanban");

  const [filterStatus, setFilterStatus] =
    useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] =
    useState<Priority | "all">("all");
  const [sortBy, setSortBy] =
    useState<"dueDate" | "priority" | "createdAt">("createdAt");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [taskToDelete, setTaskToDelete] =
    useState<Task | null>(null);

  const project = projects.find((p) => p.id === id);
  const tasks = project ? getProjectTasks(project.id) : [];

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (task) => task.status === filterStatus
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(
        (task) => task.priority === filterPriority
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
        );
      } else if (sortBy === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      } else {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }
    });

    return filtered;
  }, [tasks, search, filterStatus, filterPriority, sortBy]);

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    doing: filteredTasks.filter((t) => t.status === "doing"),
    done: filteredTasks.filter((t) => t.status === "done"),
  };

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Project not found
        </h2>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist.
        </p>
        <Link to="/projects">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const handleCreateOrUpdate = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success("Task updated successfully");
    } else {
      createTask(
        taskData as Omit<
          Task,
          "id" | "createdAt" | "updatedAt"
        >
      );
      toast.success("Task created successfully");
    }
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
    }
  };

  const handleTaskDrop = (
    taskId: string,
    newStatus: Status
  ) => {
    updateTask(taskId, { status: newStatus });
    toast.success("Task status updated");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-foreground">
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-3xl font-bold">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={
              viewMode === "kanban" ? "default" : "outline"
            }
            size="icon"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>

          <Button
            variant={
              viewMode === "list" ? "default" : "outline"
            }
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              tasks={tasksByStatus[column.status]}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDrop={handleTaskDrop}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Task
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {task.status}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {task.priority}
                  </td>

                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {task.dueDate
                      ? new Date(
                          task.dueDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(task)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleCreateOrUpdate}
        task={editingTask}
        projectId={project.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}

export function ProjectDetailPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectDetailContent />
    </DndProvider>
  );
}