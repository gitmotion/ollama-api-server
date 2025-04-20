import axios, { type AxiosInstance } from 'axios';
import { config } from '../config/environment';
import type { ChatRequest, GenerateRequest, EmbeddingsRequest, OllamaResponse } from '../types/ollama';
import { Response } from 'express';
import http from 'http';
import https from 'https';

export class OllamaService {
  private baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseURL = config.ollamaBaseUrl;
    
    // Create a reusable axios instance with connection pooling
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      httpAgent: new http.Agent({ 
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 100
      }),
      httpsAgent: new https.Agent({ 
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 100
      })
    });
  }

  private setupStreamResponse(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.flushHeaders();
  }

  async chat(request: ChatRequest, res: Response) {
    if (request.stream) {
      this.setupStreamResponse(res);

      const response = await this.axiosInstance.post('/api/chat', request, {
        responseType: 'stream'
      });

      response.data.on('data', (chunk: Buffer) => {
        try {
          res.write(chunk);
        } catch (error) {
          console.error('Error writing stream:', error);
        }
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error occurred' });
        }
        res.end();
      });
    } else {
      const response = await this.axiosInstance.post<OllamaResponse>('/api/chat', request);
      return response.data;
    }
  }

  async generate(request: GenerateRequest, res: Response) {
    if (request.stream) {
      this.setupStreamResponse(res);

      const response = await this.axiosInstance.post('/api/generate', request, {
        responseType: 'stream'
      });

      response.data.on('data', (chunk: Buffer) => {
        try {
          res.write(chunk);
        } catch (error) {
          console.error('Error writing stream:', error);
        }
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error occurred' });
        }
        res.end();
      });
    } else {
      const response = await this.axiosInstance.post<OllamaResponse>('/api/generate', request);
      return response.data;
    }
  }

  async embeddings(request: EmbeddingsRequest) {
    const response = await this.axiosInstance.post<OllamaResponse>('/api/embeddings', request);
    return response.data;
  }

  async listModels() {
    const response = await this.axiosInstance.get('/api/tags');
    return response.data;
  }

  async showModel(modelName: string) {
    const response = await this.axiosInstance.post('/api/show', { name: modelName });
    return response.data;
  }

  async pullModel(modelName: string) {
    const response = await this.axiosInstance.post('/api/pull', { name: modelName });
    return response.data;
  }

  async deleteModel(modelName: string) {
    const response = await this.axiosInstance.delete('/api/delete', { 
      data: { name: modelName }
    });
    return response.data;
  }

  async copyModel(source: string, destination: string) {
    const response = await this.axiosInstance.post('/api/copy', {
      source,
      destination
    });
    return response.data;
  }

  async getVersion() {
    const response = await this.axiosInstance.get('/api/version');
    return response.data;
  }
}