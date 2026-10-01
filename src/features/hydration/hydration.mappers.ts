import { HydrationLogDto, HydrationLogDomain } from './hydration.types';

export function mapHydrationDtoToDomain(dto: HydrationLogDto): HydrationLogDomain {
  return {
    id: dto.id,
    userId: dto.clerk_user_id,
    logDate: dto.log_date,
    amountMl: dto.amount_ml,
    goalMl: dto.goal_ml ?? 2000,
    entries: dto.entries?.map(e => ({
      time: e.time,
      amountMl: e.amount_ml,
      type: e.type,
    })),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapHydrationDomainToDto(
  domain: Omit<HydrationLogDomain, 'id' | 'userId'> & { id?: string; userId?: string }
): HydrationLogDto {
  const dto: HydrationLogDto = {
    log_date: domain.logDate,
    amount_ml: domain.amountMl,
    goal_ml: domain.goalMl ?? 2000,
  };

  if (domain.id) {
    dto.id = domain.id;
  }
  if (domain.userId) {
    dto.clerk_user_id = domain.userId;
  }
  if (domain.entries) {
    dto.entries = domain.entries.map(e => ({
      time: e.time,
      amount_ml: e.amountMl,
      type: e.type,
    }));
  }

  return dto;
}
