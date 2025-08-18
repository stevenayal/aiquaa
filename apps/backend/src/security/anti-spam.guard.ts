import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';

interface AntiSpamConfig {
  minSubmitTime: number; // Minimum time in milliseconds from page load to submit
  honeypotField: string; // Name of the honeypot field
}

@Injectable()
export class AntiSpamGuard implements CanActivate {
  private readonly config: AntiSpamConfig = {
    minSubmitTime: 2000, // 2 seconds
    honeypotField: 'website', // Common honeypot field name
  };

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check if it's a POST request (form submission)
    if (request.method !== 'POST') {
      return true;
    }

    // Check honeypot field
    if (this.isHoneypotFilled(request)) {
      throw new HttpException(
        'Invalid request detected.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check time-gate
    if (this.isTooFast(request)) {
      throw new HttpException(
        'Please wait a moment before submitting.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private isHoneypotFilled(request: Request): boolean {
    const body = request.body as any;
    const honeypotValue = body[this.config.honeypotField];
    
    // If honeypot field is filled, it's likely a bot
    return honeypotValue && honeypotValue.trim().length > 0;
  }

  private isTooFast(request: Request): boolean {
    const body = request.body as any;
    const submitTime = body._submitTime;
    
    if (!submitTime) {
      // If no submit time is provided, allow the request
      // (this might be a legitimate request from a form without our time tracking)
      return false;
    }

    const now = Date.now();
    const timeDiff = now - parseInt(submitTime);
    
    return timeDiff < this.config.minSubmitTime;
  }
}
