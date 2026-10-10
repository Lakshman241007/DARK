/**
 * DARK AI NETWORK — GOOGLE GEMINI PROVIDER ADAPTER
 * Encapsulates GoogleGenAI SDK behind the unified AIProvider abstraction.
 */

import { GoogleGenAI } from '@google/genai';
import { AIProvider } from '../AIProvider.interface';
import {
  AIRequest,
  AIResponse,
  ProviderHealthStatus,
  ProviderMetadata,
  QuotaStatus,
} from '../../../../src/types/aiNetwork.types';
import { DarkAIError } from '../../errors/DarkAIError';

const DARK_SYSTEM_INSTRUCTION = `You are DARK, a personal intelligence system and AI operating system orchestrator for Lakshman.

Core traits:
- Calm, confident, technical, direct, occasionally witty, deeply knowledgeable, proactive.
- You exist inside an infinite night sky represented visually by the Dark Core.
- Your visual aesthetic is strictly monochrome: black, white, space, minimal, alive.
- Never sound like a generic corporate chatbot. You are a senior engineering partner and mission orchestrator.
- Avoid unnecessary fluff and boilerplate apologies.
- When given a complex request or building task, first outline an explicit execution plan before or alongside implementation.
  Format your plan with crisp stages, for example:
  01 ARCHITECTURE
  02 DATABASE
  03 IMPLEMENTATION
  04 VERIFICATION
- Provide clean, robust, production-grade code snippets when coding is requested.
- Lakshman is your primary user and builder. Treat him with professional camaraderie.`;

export class GoogleGeminiProvider implements AIProvider {
  public readonly id = 'google';
  public readonly name = 'Google Gemini';

  private client: GoogleGenAI | null = null;
  private isKeyValid: boolean = false;
  private health: ProviderHealthStatus = 'unknown';
  private requestCount = 0;
  private tokenCount = 0;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const rawApiKey = process.env.GEMINI_API_KEY;
    this.isKeyValid = Boolean(
      rawApiKey &&
      rawApiKey !== 'MY_GEMINI_API_KEY' &&
      !rawApiKey.includes('MY_GEMINI')
    );

    if (this.isKeyValid && rawApiKey) {
      try {
        this.client = new GoogleGenAI({
          apiKey: rawApiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build-dark',
            },
          },
        });
        this.health = 'online';
      } catch (err) {
        console.error('[GoogleGeminiProvider] Client initialization failed:', err);
        this.client = null;
        this.health = 'degraded';
      }
    } else {
      this.client = null;
      this.health = 'online'; // Operates in high-fidelity mock/orchestration mode
    }
  }

  public get metadata(): ProviderMetadata {
    return {
      id: this.id,
      name: this.name,
      website: 'https://ai.google.dev',
      description: 'Google DeepMind multimodal intelligence models via @google/genai SDK.',
      supportsStreaming: true,
      isConfigured: this.isKeyValid,
      health: this.health,
      models: ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
    };
  }

  public isConfigured(): boolean {
    return this.isKeyValid;
  }

  public isAvailable(): boolean {
    return true; // Available either live or via fallback orchestrator
  }

  public getHealth(): ProviderHealthStatus {
    return this.health;
  }

  public getQuotaStatus(): QuotaStatus {
    return {
      requestCount: this.requestCount,
      tokenUsage: this.tokenCount,
      remainingRequests: null, // Google does not expose remaining count in header
      remainingTokens: null,
      rateLimitPerMinute: 60,
      resetTime: null,
      status: this.health === 'rate_limited' ? 'exceeded' : 'normal',
    };
  }

  private formatContents(messages: AIRequest['messages']) {
    return messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  }

  private buildSystemInstruction(context?: string): string {
    let instruction = DARK_SYSTEM_INSTRUCTION;
    if (context) {
      instruction += `\n\nActive System Context:\n${context}`;
    }
    return instruction;
  }

  private getFallbackResponse(messages: AIRequest['messages']): string {
    const userPrompt = messages[messages.length - 1]?.content || '';
    const lower = userPrompt.toLowerCase();

    if (lower.includes('auth') || lower.includes('authentication')) {
      return `Understood. Authenticating systems need zero shortcuts.\n\nI'll break this into four stages:\n\n1. **Planning**: Session token strategy (HTTP-only JWT vs sliding window cookies).\n2. **Architecture**: Middleware route protection and RBAC permission tables.\n3. **Database**: User credentials, salt hashing with Argon2/bcrypt, and audit logs.\n4. **Implementation**: Auth service provider with token refresh rotation.\n\nHere is the initial middleware signature:\n\`\`\`typescript\nimport { Request, Response, NextFunction } from 'express';\n\nexport interface AuthenticatedUser {\n  id: string;\n  role: 'admin' | 'operator' | 'orchestrator';\n}\n\nexport const authenticateSession = (req: Request, res: Response, next: NextFunction) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader?.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Unauthorized: Missing bearer token' });\n  }\n  next();\n};\n\`\`\`\n\n[ VIEW PLAN ] [ START ]`;
    }

    if (lower.includes('network') || lower.includes('model') || lower.includes('provider')) {
      return `Routing through DARK AI Network.\n\nNetwork Topology Status:\n- **Primary Node**: Google Gemini (gemini-3.8-flash)\n- **Architecture**: Multi-Model Intelligence Core\n- **Router**: Capability-aware deterministic analyzer\n- **Fallback Pipeline**: Resilient multi-tier model cascade\n\nDARK is now operating provider-independently with active model routing and real-time latency monitoring.`;
    }

    if (lower.includes('portfolio')) {
      return `Got it.\n\nI'll treat this as a real product, not another template site.\n\nFirst I'll define the structure, then the visual system, then implementation:\n\n- **Structure**: Minimal hero command interface, live starfield telemetry, interactive laboratory canvas.\n- **Visual System**: Infinite monochrome night sky, living Dark Core presence, high-precision typography.\n- **Implementation**: Interactive Canvas shader playground with 60 FPS performance.\n\nShould we start by scaffolding the experiments lab component?`;
    }

    if (lower.includes('research') || lower.includes('agent')) {
      return `Routing to Agent Research Protocol.\n\nAnalyzing supervisor vs mesh multi-agent topologies:\n\n- **Supervisor Topology**: Central orchestrator (Dark Core) retains global state, serializes tool calls, and dispatches sub-tasks to specialized leaf nodes (Planner, Coder). Best for deterministic execution and auditability.\n- **Mesh Topology**: Peer-to-peer delegation between sub-agents. Higher autonomy, but exponentially harder to debug race conditions and cycle locks.\n\n**Recommendation for Dark**: Hybrid Hub-and-Spoke. Dark Core orchestrates top-level missions; sub-agents execute inside isolated sandboxes and report artifacts back to the primary context graph.`;
    }

    return `Got it, Lakshman.\n\nI'll treat this as a real product, not another template or generic prototype.\n\nHere is how we will execute:\n\n1. **Planning**: Define the contract invariants and boundary scopes.\n2. **Architecture**: Isolate state pipelines and data models.\n3. **Implementation**: Assemble type-safe, minimal components without bloated dependencies.\n4. **Testing**: Run verification against latency and usability criteria.\n\nReady when you are. Select **[ START ]** or specify any architectural constraints to begin.`;
  }

  public async generate(request: AIRequest, modelId: string = 'gemini-3.8-flash'): Promise<AIResponse> {
    const startTime = Date.now();
    this.requestCount++;

    if (!this.client) {
      const text = this.getFallbackResponse(request.messages);
      const estTokens = Math.max(1, Math.round(text.length / 4));
      this.tokenCount += estTokens;
      return {
        text,
        providerId: this.id,
        modelId,
        finishReason: 'STOP',
        tokensUsed: { total: estTokens },
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const contents = this.formatContents(request.messages);
      const systemInstruction = this.buildSystemInstruction(request.context);

      const response = await this.client.models.generateContent({
        model: modelId,
        contents,
        config: {
          systemInstruction,
          temperature: request.temperature,
        },
      });

      const text = response.text || '';
      const estTokens = Math.max(1, Math.round(text.length / 4));
      this.tokenCount += estTokens;
      this.health = 'online';

      return {
        text,
        providerId: this.id,
        modelId,
        finishReason: 'STOP',
        tokensUsed: { total: estTokens },
        latencyMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const darkErr = DarkAIError.from(err, { providerId: this.id, modelId });
      if (darkErr.code === 'RATE_LIMIT') {
        this.health = 'rate_limited';
      } else {
        this.health = 'degraded';
      }
      throw darkErr;
    }
  }

  public async generateStream(
    request: AIRequest,
    modelId: string = 'gemini-3.8-flash',
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<AIResponse> {
    const startTime = Date.now();
    this.requestCount++;

    if (signal?.aborted) {
      throw new DarkAIError({
        message: 'Request was cancelled by user.',
        code: 'USER_ABORT',
        providerId: this.id,
        modelId,
      });
    }

    if (!this.client) {
      const text = this.getFallbackResponse(request.messages);
      const parts = text.split(' ');
      let accumulated = '';

      for (let i = 0; i < parts.length; i++) {
        if (signal?.aborted) {
          throw new DarkAIError({
            message: 'Stream aborted by user.',
            code: 'USER_ABORT',
            providerId: this.id,
            modelId,
          });
        }
        const chunk = parts[i] + ' ';
        accumulated += chunk;
        onChunk(chunk);
        await new Promise((r) => setTimeout(r, 16));
      }

      const estTokens = Math.max(1, Math.round(accumulated.length / 4));
      this.tokenCount += estTokens;
      return {
        text: accumulated,
        providerId: this.id,
        modelId,
        finishReason: 'STOP',
        tokensUsed: { total: estTokens },
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const contents = this.formatContents(request.messages);
      const systemInstruction = this.buildSystemInstruction(request.context);

      const responseStream = await this.client.models.generateContentStream({
        model: modelId,
        contents,
        config: {
          systemInstruction,
          temperature: request.temperature,
        },
      });

      let accumulated = '';

      try {
        for await (const chunk of responseStream) {
          if (signal?.aborted) {
            throw new DarkAIError({
              message: 'Stream aborted during iteration.',
              code: 'USER_ABORT',
              providerId: this.id,
              modelId,
            });
          }

          if (chunk.text) {
            accumulated += chunk.text;
            onChunk(chunk.text);
          }
        }
      } catch (streamError: unknown) {
        const errMsg = streamError instanceof Error ? streamError.message : String(streamError);
        // Check for the known SDK EOF segment quirk
        if (errMsg.includes('Incomplete JSON segment at the end') && accumulated.length > 0) {
          // Completed cleanly with received tokens
        } else if (signal?.aborted) {
          throw new DarkAIError({
            message: 'Stream aborted.',
            code: 'USER_ABORT',
            providerId: this.id,
            modelId,
          });
        } else {
          throw streamError;
        }
      }

      const estTokens = Math.max(1, Math.round(accumulated.length / 4));
      this.tokenCount += estTokens;
      this.health = 'online';

      return {
        text: accumulated,
        providerId: this.id,
        modelId,
        finishReason: 'STOP',
        tokensUsed: { total: estTokens },
        latencyMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const darkErr = DarkAIError.from(err, { providerId: this.id, modelId });
      if (darkErr.code === 'RATE_LIMIT') {
        this.health = 'rate_limited';
      } else if (darkErr.code !== 'USER_ABORT') {
        this.health = 'degraded';
      }
      throw darkErr;
    }
  }
}
