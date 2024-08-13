import { Resolver } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';

@Resolver()
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}
}
