import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { RedisModule } from '@/modules/redis';

import { HEALTH_CHECKS } from './health.constant';
import { HealthController } from './health.controller';
import { extractProviderToken } from './health.util';
import { RedisHealthIndicator } from './indicators';

@Module({
  imports: [TerminusModule.forRoot({ errorLogStyle: 'pretty' }), RedisModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {
  public static forRoot(providers: Provider[]): DynamicModule {
    return {
      module: HealthModule,
      providers: [
        ...providers,

        {
          provide: HEALTH_CHECKS,
          useFactory: (...checks) => checks,
          inject: providers.map(extractProviderToken),
        },
      ],
    };
  }
}
