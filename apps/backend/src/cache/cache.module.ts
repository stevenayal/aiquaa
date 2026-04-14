import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');

        // Si no hay REDIS_URL, usar memoria en lugar de Redis
        if (!redisUrl) {
          console.log('⚠️  Redis not configured, using in-memory cache');
          return {
            ttl: configService.get('CACHE_TTL', 60),
            max: configService.get('CACHE_MAX_ITEMS', 100),
          };
        }

        // Usar Redis si está configurado
        const isTls = redisUrl.startsWith('rediss://');
        console.log(`✅ Using Redis for caching${isTls ? ' (TLS)' : ''}`);
        return {
          store: redisStore,
          url: redisUrl,
          ...(isTls && { tls: {} }),
          ttl: configService.get('CACHE_TTL', 60),
          max: configService.get('CACHE_MAX_ITEMS', 100),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class AppCacheModule {}
