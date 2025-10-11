import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { getClientIp } from './ip.util';

@Injectable()
export class LoggingContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req as any).requestId || req.headers['x-request-id'] || res.locals.requestId;
    const ip = getClientIp(req);
    const userId = (req as any).user?.id || (req as any).user?.sub || null;

    (req as any).logContext = {
      requestId,
      path: req.originalUrl || req.url,
      method: req.method,
      ip,
      userId,
      userAgent: req.headers['user-agent'],
    };

    next();
  }
}


