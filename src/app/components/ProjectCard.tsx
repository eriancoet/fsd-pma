import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Trash2, Edit, Plus } from "lucide-react";
import { motion } from "motion/react";
import type { Project } from "../types";
import { useData } from "../contexts/DataContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { getProjectTasks } = useData();
  const tasks = getProjectTasks(project.id);
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const totalTasks = tasks.length;

  const pct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card text-card-foreground rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-4 h-4 rounded shrink-0"
            style={{ backgroundColor: project.color }}
          />

          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold truncate text-foreground hover:text-primary transition-colors"
            title={project.name}
          >
            {project.name}
          </Link>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-popover text-popover-foreground rounded-lg shadow-lg border border-border p-1 min-w-[160px] z-50"
              align="end"
            >
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded outline-none
                           hover:bg-muted focus:bg-muted"
                onSelect={() => onEdit(project)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded outline-none
                           text-destructive hover:bg-muted focus:bg-muted"
                onSelect={() => onDelete(project)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
        </div>

        {/* Theme-safe "primary" action */}
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors
                     bg-primary text-primary-foreground hover:bg-primary/90
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Link>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <span className="text-sm text-muted-foreground">{Math.round(pct)}%</span>
      </div>
    </motion.div>
  );
}