import { Router } from 'express';
import { config } from '../config/environment';
import { authenticateApiKey } from '../middleware/auth';
import { OllamaService } from '../services/ollama';
import type { ChatRequest, GenerateRequest, EmbeddingsRequest } from '../types/ollama';

const router = Router();
const ollamaService = new OllamaService();

// Apply authentication middleware to all routes
router.use((req, res, next) => {
  authenticateApiKey(req, res, next);
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const request = req.body as ChatRequest;
    if (request.stream) {
      await ollamaService.chat(request, res);
    } else {
      const response = await ollamaService.chat(request, res);
      res.json(response);
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Generate endpoint
router.post('/generate', async (req, res) => {
  try {
    const request = req.body as GenerateRequest;
    if (request.stream) {
      await ollamaService.generate(request, res);
    } else {
      const response = await ollamaService.generate(request, res);
      res.json(response);
    }
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: 'Failed to process generate request' });
  }
});

// Embeddings endpoint
router.post('/embeddings', async (req, res) => {
  try {
    const request = req.body as EmbeddingsRequest;
    const response = await ollamaService.embeddings(request);
    res.json(response);
  } catch (error) {
    console.error('Embeddings error:', error);
    res.status(500).json({ error: 'Failed to process embeddings request' });
  }
});

// List models endpoint
router.get('/tags', async (req, res) => {
  try {
    const response = await ollamaService.listModels();
    res.json(response);
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

// Show model details endpoint
router.post('/show', async (req, res) => {
  try {
    const { name } = req.body;
    const response = await ollamaService.showModel(name);
    res.json(response);
  } catch (error) {
    console.error('Show model error:', error);
    res.status(500).json({ error: 'Failed to get model details' });
  }
});

// Pull model endpoint
router.post('/pull', async (req, res) => {
  try {
    const { name } = req.body;
    const response = await ollamaService.pullModel(name);
    res.json(response);
  } catch (error) {
    console.error('Pull model error:', error);
    res.status(500).json({ error: 'Failed to pull model' });
  }
});

// Delete model endpoint
router.delete('/delete', async (req, res) => {
  try {
    const { name } = req.body;
    const response = await ollamaService.deleteModel(name);
    res.json(response);
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

// Copy model endpoint
router.post('/copy', async (req, res) => {
  try {
    const { source, destination } = req.body;
    const response = await ollamaService.copyModel(source, destination);
    res.json(response);
  } catch (error) {
    console.error('Copy model error:', error);
    res.status(500).json({ error: 'Failed to copy model' });
  }
});

// Version endpoint
router.get('/version', async (req, res) => {
  try {
    const response = await ollamaService.getVersion();
    res.json(response);
  } catch (error) {
    console.error('Version check error:', error);
    res.status(500).json({ error: 'Failed to get version information' });
  }
});

export default router;