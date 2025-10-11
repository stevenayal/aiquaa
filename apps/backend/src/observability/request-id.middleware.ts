import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

declare module 'http' {
  interface IncomingMessage {
    requestId?: string;
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = (req.headers['x-request-id'] as string) || '';
    const requestId = incoming && incoming.trim() ? incoming.trim() : uuid();
    req.requestId = requestId;
    // asegurar string
    res.setHeader('X-Request-Id', String(requestId));
    next();
  }
}
