import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiNetwork } from './server/ai-network/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Health / Status endpoint (Preserves backward compatibility while reporting AI Network state)
app.get('/api/status', (_req: Request, res: Response) => {
  const netStatus = aiNetwork.getNetworkStatus();
  const primaryProvider = aiNetwork.providerRegistry.getProvider(netStatus.primaryProvider);
  const isConnected = primaryProvider ? primaryProvider.isConfigured() : false;

  res.json({
    status: 'ONLINE',
    core: 'OPERATIONAL',
    geminiConnected: isConnected,
    model: netStatus.primaryModel,
    networkStatus: netStatus.status,
    activeProviderCount: netStatus.activeProviderCount,
    totalModelsRegistered: netStatus.totalModelsRegistered,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0-PROD',
    activeAgents: 1,
    activeTasks: 4,
    memoryStatus: 'READY',
  });
});

// Dedicated AI Network topology and diagnostics endpoint
app.get('/api/network/status', (_req: Request, res: Response) => {
  res.json(aiNetwork.getNetworkStatus());
});

// Chat endpoint with streaming support (Server-Sent Events) powered by AI Network
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages,
    stream = true,
    context,
    preferredModelId,
    preferredProviderId,
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  const abortController = new AbortController();
  req.on('close', () => {
    abortController.abort();
  });

  const aiRequest = {
    messages,
    context,
    stream,
    preferredModelId,
    preferredProviderId,
    signal: abortController.signal,
  };

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    try {
      const result = await aiNetwork.executeStream(aiRequest, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });

      res.write(
        `data: ${JSON.stringify({
          done: true,
          providerId: result.providerId,
          modelId: result.modelId,
          routing: {
            reason: result.routing.routingReason,
            category: result.routing.taskClassification.category,
            model: result.routing.selectedModelId,
            provider: result.routing.selectedProviderId,
          },
        })}\n\n`
      );
      res.end();
    } catch (error: any) {
      if (abortController.signal.aborted) {
        res.end();
        return;
      }
      console.error('[DARK AI Network] Chat stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream disrupted' })}\n\n`);
      res.end();
    }
  } else {
    try {
      const result = await aiNetwork.execute(aiRequest);
      res.json({
        text: result.text,
        providerId: result.providerId,
        modelId: result.modelId,
        routing: result.routing,
      });
    } catch (error: any) {
      console.error('[DARK AI Network] Chat execution error:', error);
      res.status(500).json({
        error: error.message || 'Dark Core encountered an error processing the request.',
      });
    }
  }
});

// Production static file serving vs Vite development middleware
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[DARK CORE] Server online on http://0.0.0.0:${port}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
