import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate request ID if not present
    const requestId = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set request ID in request object
    req['requestId'] = requestId;
    
    // Add request ID to response headers
    res.setHeader('X-Request-Id', requestId);
    
    // Add request ID to response locals for logging
    res.locals.requestId = requestId;
    
    next();
  }
}
