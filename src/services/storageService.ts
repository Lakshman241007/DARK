import {
  DEFAULT_AGENTS,
  DEFAULT_MEMORIES,
  DEFAULT_PROJECTS,
  DEFAULT_TASKS,
  DEFAULT_ACTIVITY,
  DEFAULT_SETTINGS,
} from '../data/defaultData';
import {
  Agent,
  ChatMessage,
  MemoryItem,
  Project,
  Task,
  ActivityLog,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  TASKS: 'dark_tasks_v1',
  PROJECTS: 'dark_projects_v1',
  AGENTS: 'dark_agents_v1',
  MEMORIES: 'dark_memories_v1',
  ACTIVITY: 'dark_activity_v1',
  SETTINGS: 'dark_settings_v1',
  CHAT: 'dark_chat_v1',
  BOOT_SEEN: 'dark_boot_completed_v1',
};

export class StorageService {
  static getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  }

  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS;
    } catch {
      return DEFAULT_PROJECTS;
    }
  }

  static saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  }

  static getAgents(): Agent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
      return data ? JSON.parse(data) : DEFAULT_AGENTS;
    } catch {
      return DEFAULT_AGENTS;
    }
  }

  static saveAgents(agents: Agent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    } catch (e) {
      console.error('Failed to save agents', e);
    }
  }

  static getMemories(): MemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return data ? JSON.parse(data) : DEFAULT_MEMORIES;
    } catch {
      return DEFAULT_MEMORIES;
    }
  }

  static saveMemories(memories: MemoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed to save memories', e);
    }
  }

  static getActivity(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return data ? JSON.parse(data) : DEFAULT_ACTIVITY;
    } catch {
      return DEFAULT_ACTIVITY;
    }
  }

  static addActivity(item: Omit<ActivityLog, 'id' | 'timestamp' | 'timeStr'>): ActivityLog {
    const logs = this.getActivity();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      timeStr,
      ...item,
    };
    const updated = [newLog, ...logs].slice(0, 50);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to add activity', e);
    }
    return newLog;
  }

  static clearActivity(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear activity', e);
    }
  }

  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  static getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-init-1',
        role: 'assistant',
        content: `Dark Core initialized.\n\nAll intelligence services online. Ready for command input, architecture planning, or execution delegation.\n\nWhat are we building today?`,
        timestamp: '16:35',
        plan: {
          planning: 'done',
          architecture: 'done',
          database: 'done',
          implementation: 'active',
          testing: 'pending',
        },
      },
    ];
  }

  static saveChatHistory(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }

  static hasCompletedBoot(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.BOOT_SEEN) === 'true';
    } catch {
      return false;
    }
  }

  static setCompletedBoot(completed: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOT_SEEN, completed ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  static resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.AGENTS);
      localStorage.removeItem(STORAGE_KEYS.MEMORIES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.CHAT);
      localStorage.removeItem(STORAGE_KEYS.BOOT_SEEN);
    } catch (e) {
      console.error('Failed to reset data', e);
    }
  }
}
