import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Agent,
  ChatMessage,
  MemoryItem,
  NavigationTab,
  Project,
  SystemStatus,
  Task,
  ActivityLog,
  UserSettings,
} from '../types';
import { StorageService } from '../services/storageService';
import { AINetworkService } from '../services/aiNetworkService';
import { darkCore } from './dark/darkCore';
import { responseEngine } from './response/responseEngine.controller';

interface DarkContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  pendingPrompt: string;
  setPendingPrompt: (prompt: string) => void;
  submitCommandFromHome: (prompt: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Projects
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  updateProjectProgress: (id: string, progress: number, nextAction?: string) => void;

  // Agents
  agents: Agent[];

  // Memory
  memories: MemoryItem[];
  addMemory: (item: Omit<MemoryItem, 'id' | 'updatedAt'>) => void;
  updateMemory: (item: MemoryItem) => void;
  deleteMemory: (id: string) => void;

  // Activity
  activityLogs: ActivityLog[];
  logActivity: (category: ActivityLog['category'], message: string, details?: string) => void;
  clearActivityLogs: () => void;

  // Chat
  chatMessages: ChatMessage[];
  isThinking: boolean;
  isStreaming: boolean;
  sendChatMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  regenerateLastMessage: () => void;
  stopStreaming: () => void;

  // System Status
  systemStatus: SystemStatus;
  refreshSystemStatus: () => Promise<void>;

  // Settings & Boot
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  bootCompleted: boolean;
  completeBoot: () => void;
  triggerReboot: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const DarkContext = createContext<DarkContextType | null>(null);

export const DarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [pendingPrompt, setPendingPrompt] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // States with localStorage backing
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [agents, setAgents] = useState<Agent[]>(() => StorageService.getAgents());
  const [memories, setMemories] = useState<MemoryItem[]>(() => StorageService.getMemories());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => StorageService.getActivity());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => StorageService.getChatHistory());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [bootCompleted, setBootCompleted] = useState<boolean>(() => StorageService.hasCompletedBoot());

  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortStreamRef = useRef<(() => void) | null>(null);

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'ONLINE',
    core: 'OPERATIONAL',
    geminiConnected: true,
    model: 'gemini-3.8-flash',
    activeAgents: 1,
    activeTasks: 4,
    memoryStatus: 'READY',
  });

  // Sync tasks count with system status
  useEffect(() => {
    const activeTasks = tasks.filter((t) => !t.completed).length;
    setSystemStatus((prev) => ({ ...prev, activeTasks }));
  }, [tasks]);

  // Periodic status poll
  const refreshSystemStatus = useCallback(async () => {
    const status = await AINetworkService.getStatus();
    setSystemStatus((prev) => ({
      ...prev,
      ...status,
      activeTasks: tasks.filter((t) => !t.completed).length,
    }));
  }, [tasks]);

  useEffect(() => {
    refreshSystemStatus();
    const interval = setInterval(refreshSystemStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshSystemStatus]);

  // Activity logger helper
  const logActivity = useCallback((category: ActivityLog['category'], message: string, details?: string) => {
    const newLog = StorageService.addActivity({ category, message, details });
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Tasks actions
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      StorageService.saveTasks(updated);
      return updated;
    });
    logActivity('task', `Task created: ${newTask.title}`, `Priority: ${newTask.priority} | Project: ${newTask.project}`);
  }, [logActivity]);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      StorageService.saveTasks(updated);
      return updated;
    });
    logActivity('task', `Task updated: ${updatedTask.title}`);
  }, [logActivity]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const updated = prev.filter((t) => t.id !== id);
      StorageService.saveTasks(updated);
      if (target) {
        logActivity('task', `Task deleted: ${target.title}`);
      }
      return updated;
    });
  }, [logActivity]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          const status = completed ? ('completed' as const) : ('today' as const);
          return { ...t, completed, status };
        }
        return t;
      });
      StorageService.saveTasks(updated);
      const changed = updated.find((t) => t.id === id);
      if (changed) {
        logActivity('task', `Task ${changed.completed ? 'completed' : 'reopened'}: ${changed.title}`);
      }
      return updated;
    });
  }, [logActivity]);

  // Project actions
  const updateProjectProgress = useCallback((id: string, progress: number, nextAction?: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            progress,
            nextAction: nextAction || p.nextAction,
            lastActivity: 'Just now',
          };
        }
        return p;
      });
      StorageService.saveProjects(updated);
      return updated;
    });
  }, []);

  // Memory actions
  const addMemory = useCallback((itemData: Omit<MemoryItem, 'id' | 'updatedAt'>) => {
    const newItem: MemoryItem = {
      ...itemData,
      id: `mem-${Date.now()}`,
      updatedAt: 'Just now',
    };
    setMemories((prev) => {
      const updated = [newItem, ...prev];
      StorageService.saveMemories(updated);
      return updated;
    });
    logActivity('memory', `Memory indexed: ${newItem.title}`, `Category: ${newItem.category}`);
  }, [logActivity]);

  const updateMemory = useCallback((item: MemoryItem) => {
    setMemories((prev) => {
      const updated = prev.map((m) => (m.id === item.id ? { ...item, updatedAt: 'Just now' } : m));
      StorageService.saveMemories(updated);
      return updated;
    });
    logActivity('memory', `Memory updated: ${item.title}`);
  }, [logActivity]);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) => {
      const target = prev.find((m) => m.id === id);
      const updated = prev.filter((m) => m.id !== id);
      StorageService.saveMemories(updated);
      if (target) {
        logActivity('memory', `Memory removed: ${target.title}`);
      }
      return updated;
    });
  }, [logActivity]);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      StorageService.saveSettings(updated);
      return updated;
    });
    logActivity('system', 'System configuration updated');
  }, [logActivity]);

  // Boot sequence
  const completeBoot = useCallback(() => {
    setBootCompleted(true);
    StorageService.setCompletedBoot(true);
    logActivity('system', 'Boot sequence completed // Dark Core Active');
  }, [logActivity]);

  const triggerReboot = useCallback(() => {
    setBootCompleted(false);
    StorageService.setCompletedBoot(false);
  }, []);

  // Chat actions
  const clearChat = useCallback(() => {
    const initial: ChatMessage[] = [
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: `Session cleared. Dark Core awaiting input.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setChatMessages(initial);
    StorageService.saveChatHistory(initial);
    logActivity('chat', 'Conversation session cleared');
  }, [logActivity]);

  const stopStreaming = useCallback(() => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    responseEngine.markInterrupted();
    logActivity('chat', 'Generation halted by user');
  }, [logActivity]);

  const sendChatMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // IMMEDIATE ACKNOWLEDGEMENT (<16ms): record input timestamp
    const inputTimestamp = performance.now();
    const requestId = `req-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    StorageService.saveChatHistory(newMessages);
    logActivity('chat', `Command dispatched: "${content.slice(0, 36)}${content.length > 36 ? '...' : ''}"`);

    // Prepare assistant placeholder immediately
    const assistantId = `msg-a-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plan: {
        planning: 'done',
        architecture: 'active',
        database: 'pending',
        implementation: 'pending',
        testing: 'pending',
      },
    };

    // Immediate UI feedback & Response Engine start
    setIsThinking(true);
    setIsStreaming(true);
    responseEngine.markInputSubmitted(requestId, inputTimestamp);

    // Build context string from active memories and projects
    const contextLines = [
      `User Handle: ${settings.userName}`,
      `Active Projects: ${projects.map((p) => `${p.name} (${p.progress}%)`).join(', ')}`,
      `Core Memories:`,
      ...memories.slice(0, 4).map((m) => `- ${m.title}: ${m.content}`),
    ];
    const context = contextLines.join('\n');

    const formattedMessages = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const abort = await AINetworkService.sendStreamMessage(formattedMessages, context, {
        onRouting: (routing) => {
          setSystemStatus((prev) => ({ ...prev, model: routing.model }));
        },
        onFirstToken: (firstChunk) => {
          setIsThinking(false);
          responseEngine.markFirstTokenReceived(1);
          setChatMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.id === assistantId) {
              const updated = [...prev.slice(0, -1), { ...last, content: firstChunk }];
              StorageService.saveChatHistory(updated);
              return updated;
            } else {
              const updated = [...prev, { ...initialAssistantMessage, content: firstChunk }];
              StorageService.saveChatHistory(updated);
              return updated;
            }
          });
        },
        onChunk: (chunkText) => {
          setIsThinking(false);
          const approxTokens = Math.max(1, Math.round(chunkText.length / 4));
          responseEngine.updateStreamingProgress(approxTokens);
          setChatMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.id === assistantId) {
              const updated = [...prev.slice(0, -1), { ...last, content: chunkText }];
              StorageService.saveChatHistory(updated);
              return updated;
            } else {
              const updated = [...prev, { ...initialAssistantMessage, content: chunkText }];
              StorageService.saveChatHistory(updated);
              return updated;
            }
          });
        },
        onComplete: (fullText) => {
          setIsStreaming(false);
          setIsThinking(false);
          const totalTokens = Math.max(1, Math.round((fullText || '').length / 4));
          responseEngine.markResponseCompleted(totalTokens);
          abortStreamRef.current = null;

          // Update final plan status marks
          setChatMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.id === assistantId) {
              const updated = [
                ...prev.slice(0, -1),
                {
                  ...last,
                  content: fullText || last.content,
                  plan: {
                    planning: 'done' as const,
                    architecture: 'done' as const,
                    database: 'done' as const,
                    implementation: 'done' as const,
                    testing: 'done' as const,
                  },
                },
              ];
              StorageService.saveChatHistory(updated);
              return updated;
            }
            return prev;
          });
        },
        onError: (err) => {
          setIsStreaming(false);
          setIsThinking(false);
          abortStreamRef.current = null;
          console.error('Chat stream error:', err);

          const errStr = String(err);
          const isSegmentError = errStr.includes('Incomplete JSON segment at the end');

          setChatMessages((prev) => {
            const last = prev.find((m) => m.id === assistantId);
            if (last && last.content.trim().length > 0 && isSegmentError) {
              // Message was already delivered and streamed; do not replace with error banner
              responseEngine.markResponseCompleted(Math.max(1, Math.round(last.content.length / 4)));
              return prev;
            }

            responseEngine.markError(errStr);
            const errorMsg: ChatMessage = {
              id: assistantId,
              role: 'assistant',
              content: `[DARK SYSTEM NOTICE]\n\nExecution error encountered: ${err}\n\nDark Core diagnostic: Check server connection or verify model quota.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            const updated = [...prev.filter((m) => m.id !== assistantId), errorMsg];
            StorageService.saveChatHistory(updated);
            return updated;
          });
        },
      });

      abortStreamRef.current = abort;
    } catch (err: any) {
      setIsThinking(false);
      setIsStreaming(false);
      responseEngine.markError(String(err));
      console.error('Failed to initiate stream:', err);
    }
  }, [chatMessages, settings.userName, projects, memories, logActivity]);

  const regenerateLastMessage = useCallback(() => {
    if (chatMessages.length < 2) return;
    const lastUserMessage = [...chatMessages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove last assistant message
      const pruned = chatMessages.slice(0, -1);
      setChatMessages(pruned);
      sendChatMessage(lastUserMessage.content);
    }
  }, [chatMessages, sendChatMessage]);

  // Submit from Home quick actions
  const submitCommandFromHome = useCallback((prompt: string) => {
    darkCore.transition('INPUT_SUBMITTED');
    setCurrentTab('chat');
    sendChatMessage(prompt);
  }, [sendChatMessage]);

  return (
    <DarkContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        pendingPrompt,
        setPendingPrompt,
        submitCommandFromHome,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        projects,
        selectedProject,
        setSelectedProject,
        updateProjectProgress,
        agents,
        memories,
        addMemory,
        updateMemory,
        deleteMemory,
        activityLogs,
        logActivity,
        clearActivityLogs: () => {
          StorageService.clearActivity();
          setActivityLogs([]);
        },
        chatMessages,
        isThinking,
        isStreaming,
        sendChatMessage,
        clearChat,
        regenerateLastMessage,
        stopStreaming,
        systemStatus,
        refreshSystemStatus,
        settings,
        updateSettings,
        bootCompleted,
        completeBoot,
        triggerReboot,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </DarkContext.Provider>
  );
};

export const useDark = () => {
  const context = useContext(DarkContext);
  if (!context) {
    throw new Error('useDark must be used within DarkProvider');
  }
  return context;
};
