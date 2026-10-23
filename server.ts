import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { TrueDoseMcpServer } from './src/mcp/server.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const mcpServer = new TrueDoseMcpServer();

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'TrueDose MCP Server',
    protocolVersion: '2025-11-25',
    track: 'Alexa+ (simulated path)',
    toolsCount: mcpServer.getTools().length,
  });
});

// Real MCP Endpoint: Streamable HTTP with JSON-RPC 2.0
app.post('/mcp', async (req: Request, res: Response) => {
  try {
    const jsonRpcResponse = await mcpServer.handleJsonRpc(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.json(jsonRpcResponse);
  } catch (error: any) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32603, message: error?.message || 'Internal error' },
    });
  }
});

// Tools listing endpoint
app.get('/api/mcp/tools', (_req: Request, res: Response) => {
  res.json({ tools: mcpServer.getTools() });
});

// SSE endpoint for live event streaming
app.get('/api/sim/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', server: 'truedose-mcp' })}\n\n`);

  req.on('close', () => {
    res.end();
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrueDose Simulation Stage running at http://0.0.0.0:${PORT}`);
    console.log(`Streamable HTTP MCP Endpoint active at http://0.0.0.0:${PORT}/mcp`);
  });
}

startServer();
