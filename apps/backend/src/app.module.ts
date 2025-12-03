import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ForumModule } from './forum/forum.module';
import { ContentModule } from './content/content.module';
import { BillingModule } from './billing/billing.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppCacheModule } from './cache/cache.module';
import { ObservabilityModule } from './observability/observability.module';
import { IstqbModule } from './istqb/istqb.module';
import { PerformanceModule } from './performance/performance.module';
import { LabsModule } from './labs/labs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ObservabilityModule,
    PrismaModule,
    AppCacheModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ForumModule,
    ContentModule,
    BillingModule,
    IstqbModule,
    PerformanceModule,
    LabsModule,
  ],
})
export class AppModule {}
