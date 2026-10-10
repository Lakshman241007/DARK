/**
 * DARK AI NETWORK — TASK ANALYZER
 * Deterministic classifier evaluating prompt intent, complexity, and capability requirements.
 */

import {
  AIRequest,
  ModelCapability,
  TaskCategory,
  TaskClassification,
} from '../../../src/types/aiNetwork.types';

export class TaskAnalyzer {
  public analyze(request: AIRequest): TaskClassification {
    const userPrompt = request.messages[request.messages.length - 1]?.content || '';
    const text = userPrompt.toLowerCase().trim();

    // 1. Coding & Technical Implementation
    const codePatterns = [
      /\b(code|function|typescript|javascript|python|component|api|react|class|interface|sql|database|schema|debug|refactor|error|stack|trace|import|export|npm)\b/i,
      /```[\s\S]*?```/,
      /[{}()[\]=><;]{3,}/,
    ];
    if (codePatterns.some((pattern) => pattern.test(userPrompt))) {
      const isComplex =
        userPrompt.length > 250 ||
        /\b(architecture|refactor|optimize|security|migration|concurrent)\b/i.test(text);

      return {
        category: 'coding',
        estimatedComplexity: isComplex ? 'complex' : 'moderate',
        requiredCapabilities: ['coding', 'general', ...(isComplex ? (['reasoning'] as ModelCapability[]) : [])],
        confidence: 0.92,
        reason: 'Detected software engineering keywords, code structures, or architectural queries.',
      };
    }

    // 2. Deep Reasoning, Topology & Architecture
    if (
      /\b(why|how does|compare|difference|topology|trade-offs|evaluate|analyze|pros and cons|strategic|explain in depth)\b/i.test(
        text
      )
    ) {
      return {
        category: 'reasoning',
        estimatedComplexity: 'complex',
        requiredCapabilities: ['reasoning', 'analysis', 'general'],
        confidence: 0.88,
        reason: 'Detected analytical, comparison, or conceptual evaluation query.',
      };
    }

    // 3. Research & Multi-agent Synthesis
    if (/\b(research|investigate|agent|supervisor|protocol|survey|history of)\b/i.test(text)) {
      return {
        category: 'research',
        estimatedComplexity: 'moderate',
        requiredCapabilities: ['reasoning', 'analysis'],
        confidence: 0.85,
        reason: 'Detected research or investigative subject matter.',
      };
    }

    // 4. Data / Log Analysis
    if (/\b(log|json|csv|metric|latency|throughput|telemetry|parse|audit)\b/i.test(text)) {
      return {
        category: 'analysis',
        estimatedComplexity: 'moderate',
        requiredCapabilities: ['analysis', 'general'],
        confidence: 0.86,
        reason: 'Detected structured data or system telemetry analysis.',
      };
    }

    // 5. Simple Commands / Greetings / Status
    if (
      text.length < 30 &&
      /\b(hi|hello|hey|status|ping|who are you|dark|ready|clear|test)\b/i.test(text)
    ) {
      return {
        category: 'simple',
        estimatedComplexity: 'simple',
        requiredCapabilities: ['fast-response', 'general'],
        confidence: 0.95,
        reason: 'Short interactive command or greeting requiring immediate low-latency acknowledgement.',
      };
    }

    // 6. Long-context check
    const totalChars = request.messages.reduce((acc, m) => acc + m.content.length, 0);
    if (totalChars > 16000) {
      return {
        category: 'long-context',
        estimatedComplexity: 'complex',
        requiredCapabilities: ['long-context', 'general'],
        confidence: 0.9,
        reason: 'Conversation history exceeds typical single-turn context threshold.',
      };
    }

    // 7. General Default
    return {
      category: 'general',
      estimatedComplexity: userPrompt.length > 300 ? 'moderate' : 'simple',
      requiredCapabilities: ['general', 'fast-response'],
      confidence: 0.8,
      reason: 'General conversational or operational task.',
    };
  }
}
