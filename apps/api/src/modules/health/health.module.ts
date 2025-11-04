import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HEALTH_CHECKS } from './health.constant';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule.forRoot({ errorLogStyle: 'pretty' })],
  controllers: [HealthController],
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
          inject: [...providers.map((p: any) => p.provide || p)],
        },
      ],
    };
  }
}
