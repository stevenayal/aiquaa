import { Request } from 'express';

export function getClientIp(req: Request): string {
  const xf = (req.headers['x-forwarded-for'] as string) || '';
  const fromXf = xf.split(',')[0]?.trim();
  return fromXf || req.ip || req.socket.remoteAddress || '';
}
