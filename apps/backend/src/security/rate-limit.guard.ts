import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  private readonly config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per window
  };

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientId = this.getClientId(request);
    
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize client data
      this.requestCounts.set(clientId, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (clientData.count >= this.config.maxRequests) {
      throw new HttpException(
        'Too many requests, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment request count
    clientData.count++;
    this.requestCounts.set(clientId, clientData);

    return true;
  }

  private getClientId(request: Request): string {
    // Use IP address as client identifier
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    return ip.toString();
  }
}
