import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Check x-api-key header first
  const headerKey = req.headers['x-api-key'];
  // Check Authorization header next (some clients use this)
  const authHeader = req.headers['authorization'];
  // Check body for apiKey
  const bodyKey = req.body?.apiKey;
  
  const apiKey = headerKey || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader) || bodyKey;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  if (!config.apiKeys.includes(apiKey as string)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};