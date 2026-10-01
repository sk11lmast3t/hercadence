import { CycleDto, CycleEntry } from './cycle.types';

export function mapCycleDto(dto: CycleDto): CycleEntry {
  return {
    startDate: dto.start_date,
    cycleLengthDays: dto.cycle_length ?? 28,
    periodLengthDays: dto.period_length ?? 5,
  };
}