export type NavigationTab =
  | 'home'
  | 'chat'
  | 'tasks'
  | 'agents'
  | 'projects'
  | 'memory'
  | 'activity';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'today' | 'upcoming' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  project: string;
  completed: boolean;
  createdAt: string;
}

export type ProjectStatus = 'active' | 'in-progress' | 'review' | 'planning';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  description: string;
  lastActivity: string;
  nextAction: string;
  tags: string[];
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  role: string;
  status: 'active' | 'standby' | 'coming-soon';
  description: string;
  capabilities: string[];
  metrics?: {
    tasksProcessed: number;
    latencyMs: number;
    accuracy: string;
  };
}

export type MemoryCategory = 'personal' | 'project' | 'preferences' | 'notes';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
}

export type ActivityCategory = 'system' | 'chat' | 'task' | 'memory' | 'agent';

export interface ActivityLog {
  id: string;
  timestamp: string;
  timeStr: string;
  category: ActivityCategory;
  message: string;
  details?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  plan?: {
    planning: 'done' | 'active' | 'pending';
    architecture: 'done' | 'active' | 'pending';
    database: 'done' | 'active' | 'pending';
    implementation: 'done' | 'active' | 'pending';
    testing: 'done' | 'active' | 'pending';
  };
  structuredPlan?: string[];
  actionPrompt?: string;
}

export * from './aiNetwork.types';

export interface SystemStatus {
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  core: 'OPERATIONAL' | 'INITIALIZING';
  geminiConnected: boolean;
  model: string;
  networkStatus?: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeProviderCount?: number;
  totalModelsRegistered?: number;
  activeAgents: number;
  activeTasks: number;
  memoryStatus: 'READY' | 'SYNCING';
  uptime?: number;
  timestamp?: string;
}

export interface UserSettings {
  userName: string;
  showScanlines: boolean;
  showTechGrid: boolean;
  enableSoundEffects: boolean;
  streamResponses: boolean;
  temperature: number;
  developerMode: boolean;
}
