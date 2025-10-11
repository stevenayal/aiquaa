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
    const incoming = (req.headers['x-request-id'] as string) ?? '';
    const rid = incoming.trim() || uuid();
    (req as any).requestId = rid;
    res.setHeader('X-Request-Id', String(rid));
    next();
  }
}
