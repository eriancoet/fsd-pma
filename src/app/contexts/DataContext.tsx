import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Project, Task } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getProjectTasks: (projectId: string) => Task[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

type StoredData = {
  projects: Project[];
  tasks: Task[];
};

const EMPTY: StoredData = { projects: [], tasks: [] };

function makeStorageKey(userId: string) {
  return `pma:data:${userId}`;
}

function safeLoad(key: string): StoredData {
  const raw = localStorage.getItem(key);
  if (!raw) return EMPTY;

  try {
    const parsed = JSON.parse(raw) as StoredData;
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    };
  } catch {
    return EMPTY;
  }
}

function safeSave(key: string, data: StoredData) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();

  
  // If your user.id changes on each login, switch to user.email (lowercased).
 const activeUserId = useMemo(() => {
  // Prefer a stable identifier
  if (user?.email) return user.email.toLowerCase().trim();
  if (user?.id) return String(user.id); // fallback
  if (isGuest) return 'guest';
  return null;
}, [user?.email, user?.id, isGuest]);


  const storageKey = useMemo(() => {
    return activeUserId ? makeStorageKey(activeUserId) : null;
  }, [activeUserId]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load data whenever the active user changes
  useEffect(() => {
    setHydrated(false);

    if (!storageKey) {
      setProjects([]);
      setTasks([]);
      return;
    }

    const data = safeLoad(storageKey);
    setProjects(data.projects);
    setTasks(data.tasks);

    setHydrated(true);
  }, [storageKey]);

  // Save only AFTER we have loaded data for that user
  useEffect(() => {
    if (!storageKey) return;
    if (!hydrated) return;

    safeSave(storageKey, { projects, tasks });
  }, [storageKey, hydrated, projects, tasks]);

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, ...updates, updatedAt: now } : project))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
    setTasks((prev) => prev.filter((task) => task.projectId !== id));
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: now } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((task) => task.projectId === projectId);
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        tasks,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        deleteTask,
        getProjectTasks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
