// src/features/physicalActivity/physicalActivity.mappers.test.ts
import { describe, expect, it } from 'vitest';
import {
  mapPhysicalActivityDtoToDomain,
  mapPhysicalActivityDomainToDto,
  PhysicalActivityDto,
} from './physicalActivity.mappers';
import { PhysicalActivityEntryInput } from './physicalActivity.types';

describe('physicalActivity.mappers', () => {
  describe('mapPhysicalActivityDtoToDomain', () => {
    it('maps all DTO fields correctly to domain', () => {
      const dto: PhysicalActivityDto = {
        id: 'act-123',
        clerk_user_id: 'user_abc',
        log_date: '2026-09-30',
        activity_type: 'Running',
        duration_mins: 45,
        intensity: 'high',
        calories_burned: 350,
        steps: 6000,
        notes: 'Morning park run',
        created_at: '2026-09-30T10:00:00Z',
      };

      const domain = mapPhysicalActivityDtoToDomain(dto);

      expect(domain).toEqual({
        id: 'act-123',
        userId: 'user_abc',
        logDate: '2026-09-30',
        activityType: 'Running',
        durationMins: 45,
        intensity: 'high',
        caloriesBurned: 350,
        steps: 6000,
        notes: 'Morning park run',
        createdAt: '2026-09-30T10:00:00Z',
      });
    });

    it('handles null/undefined optional fields cleanly', () => {
      const dto: PhysicalActivityDto = {
        log_date: '2026-09-30',
        activity_type: null,
        duration_mins: null,
        intensity: null,
        calories_burned: null,
        steps: null,
        notes: null,
      };

      const domain = mapPhysicalActivityDtoToDomain(dto);

      expect(domain).toEqual({
        id: undefined,
        userId: undefined,
        logDate: '2026-09-30',
        activityType: undefined,
        durationMins: undefined,
        intensity: undefined,
        caloriesBurned: undefined,
        steps: undefined,
        notes: undefined,
        createdAt: undefined,
      });
    });
  });

  describe('mapPhysicalActivityDomainToDto', () => {
    it('maps domain input to DTO format with snake_case fields', () => {
      const domainInput: PhysicalActivityEntryInput & { id?: string; userId?: string } = {
        id: 'act-123',
        userId: 'user_abc',
        logDate: '2026-09-30',
        activityType: 'Yoga',
        durationMins: 30,
        intensity: 'low',
        caloriesBurned: 120,
        steps: 1500,
        notes: 'Restorative session',
      };

      const dto = mapPhysicalActivityDomainToDto(domainInput);

      expect(dto).toEqual({
        id: 'act-123',
        clerk_user_id: 'user_abc',
        log_date: '2026-09-30',
        activity_type: 'Yoga',
        duration_mins: 30,
        intensity: 'low',
        calories_burned: 120,
        steps: 1500,
        notes: 'Restorative session',
      });
    });

    it('maps missing optional domain fields to null in DTO', () => {
      const domainInput: PhysicalActivityEntryInput & { id?: string; userId?: string } = {
        logDate: '2026-09-30',
      };

      const dto = mapPhysicalActivityDomainToDto(domainInput);

      expect(dto).toEqual({
        log_date: '2026-09-30',
        activity_type: null,
        duration_mins: null,
        intensity: null,
        calories_burned: null,
        steps: null,
        notes: null,
      });
      expect(dto.id).toBeUndefined();
      expect(dto.clerk_user_id).toBeUndefined();
    });

    it('performs round-trip DTO -> Domain -> DTO conversion accurately', () => {
      const originalDto: PhysicalActivityDto = {
        id: 'act-999',
        clerk_user_id: 'user_xyz',
        log_date: '2026-09-29',
        activity_type: 'Cycling',
        duration_mins: 60,
        intensity: 'moderate',
        calories_burned: 400,
        steps: 0,
        notes: 'Evening ride',
      };

      const domain = mapPhysicalActivityDtoToDomain(originalDto);
      const convertedDto = mapPhysicalActivityDomainToDto({
        ...domain,
        userId: domain.userId,
      });

      expect(convertedDto).toEqual({
        id: originalDto.id,
        clerk_user_id: originalDto.clerk_user_id,
        log_date: originalDto.log_date,
        activity_type: originalDto.activity_type,
        duration_mins: originalDto.duration_mins,
        intensity: originalDto.intensity,
        calories_burned: originalDto.calories_burned,
        steps: originalDto.steps,
        notes: originalDto.notes,
      });
    });
  });
});
