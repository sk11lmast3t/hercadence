// src/features/bodyMetrics/bodyMetrics.mappers.test.ts
// Unit tests for Body Metrics DTO ↔ Domain mapper.
// Tests actual database fields from migration 009 (flat schema).

import { describe, expect, it } from 'vitest';
import {
  mapBodyMetricDtoToDomain,
  mapBodyMetricDomainToDto,
  BodyMetricDto,
} from './bodyMetrics.mappers';

describe('mapBodyMetricDtoToDomain — DTO → Domain', () => {
  it('maps all present fields', () => {
    const dto: BodyMetricDto = {
      id: 'uuid-1',
      clerk_user_id: 'user-a',
      measured_date: '2026-09-10',
      weight: 68.5,
      weight_unit: 'kg',
      waist_cm: 76.0,
      hip_cm: 94.0,
      body_fat_pct: 24.5,
      notes: 'Morning',
      created_at: '2026-09-10T07:00:00Z',
    };

    const domain = mapBodyMetricDtoToDomain(dto);

    expect(domain.id).toBe('uuid-1');
    expect(domain.userId).toBe('user-a');
    expect(domain.measuredDate).toBe('2026-09-10');
    expect(domain.weight).toBe(68.5);
    expect(domain.weightUnit).toBe('kg');
    expect(domain.waistCm).toBe(76.0);
    expect(domain.hipCm).toBe(94.0);
    expect(domain.bodyFatPct).toBe(24.5);
    expect(domain.notes).toBe('Morning');
    expect(domain.createdAt).toBe('2026-09-10T07:00:00Z');
  });

  it('maps lb weight_unit correctly', () => {
    const dto: BodyMetricDto = {
      measured_date: '2026-09-11',
      weight: 150.0,
      weight_unit: 'lb',
    };
    const domain = mapBodyMetricDtoToDomain(dto);
    expect(domain.weightUnit).toBe('lb');
  });

  it('falls back weight_unit to kg when null', () => {
    const dto: BodyMetricDto = {
      measured_date: '2026-09-12',
      weight_unit: null,
    };
    const domain = mapBodyMetricDtoToDomain(dto);
    expect(domain.weightUnit).toBe('kg');
  });

  it('converts null numeric fields to undefined', () => {
    const dto: BodyMetricDto = {
      measured_date: '2026-09-13',
      weight: null,
      waist_cm: null,
      hip_cm: null,
      body_fat_pct: null,
      notes: null,
      created_at: null,
    };
    const domain = mapBodyMetricDtoToDomain(dto);
    expect(domain.weight).toBeUndefined();
    expect(domain.waistCm).toBeUndefined();
    expect(domain.hipCm).toBeUndefined();
    expect(domain.bodyFatPct).toBeUndefined();
    expect(domain.notes).toBeUndefined();
    expect(domain.createdAt).toBeUndefined();
  });

  it('maps id and clerk_user_id to undefined when absent', () => {
    const dto: BodyMetricDto = { measured_date: '2026-09-14' };
    const domain = mapBodyMetricDtoToDomain(dto);
    expect(domain.id).toBeUndefined();
    expect(domain.userId).toBeUndefined();
  });

  it('round-trips measured_date without mutation', () => {
    const dto: BodyMetricDto = { measured_date: '2026-01-01' };
    expect(mapBodyMetricDtoToDomain(dto).measuredDate).toBe('2026-01-01');
  });
});

describe('mapBodyMetricDomainToDto — Domain → DTO', () => {
  it('maps all present fields', () => {
    const domain = {
      id: 'uuid-2',
      userId: 'user-b',
      measuredDate: '2026-09-10',
      weight: 72.0,
      weightUnit: 'kg' as const,
      waistCm: 80.0,
      hipCm: 96.0,
      bodyFatPct: 26.0,
      notes: 'After breakfast',
    };

    const dto = mapBodyMetricDomainToDto(domain);

    expect(dto.id).toBe('uuid-2');
    expect(dto.clerk_user_id).toBe('user-b');
    expect(dto.measured_date).toBe('2026-09-10');
    expect(dto.weight).toBe(72.0);
    expect(dto.weight_unit).toBe('kg');
    expect(dto.waist_cm).toBe(80.0);
    expect(dto.hip_cm).toBe(96.0);
    expect(dto.body_fat_pct).toBe(26.0);
    expect(dto.notes).toBe('After breakfast');
  });

  it('maps lb unit correctly', () => {
    const dto = mapBodyMetricDomainToDto({
      measuredDate: '2026-09-15',
      weightUnit: 'lb',
    });
    expect(dto.weight_unit).toBe('lb');
  });

  it('defaults weight_unit to kg when undefined', () => {
    const dto = mapBodyMetricDomainToDto({ measuredDate: '2026-09-16' });
    expect(dto.weight_unit).toBe('kg');
  });

  it('converts undefined numeric fields to null', () => {
    const dto = mapBodyMetricDomainToDto({ measuredDate: '2026-09-17' });
    expect(dto.weight).toBeNull();
    expect(dto.waist_cm).toBeNull();
    expect(dto.hip_cm).toBeNull();
    expect(dto.body_fat_pct).toBeNull();
    expect(dto.notes).toBeNull();
  });

  it('omits id and clerk_user_id when not supplied', () => {
    const dto = mapBodyMetricDomainToDto({ measuredDate: '2026-09-18' });
    expect(dto.id).toBeUndefined();
    expect(dto.clerk_user_id).toBeUndefined();
  });

  it('round-trips a full entry without data loss', () => {
    const original: BodyMetricDto = {
      id: 'uuid-3',
      clerk_user_id: 'user-c',
      measured_date: '2026-09-20',
      weight: 65.5,
      weight_unit: 'kg',
      waist_cm: 74.0,
      hip_cm: 90.0,
      body_fat_pct: 22.1,
      notes: 'Evening',
    };

    const domain = mapBodyMetricDtoToDomain(original);
    const roundTripped = mapBodyMetricDomainToDto(domain);

    expect(roundTripped.measured_date).toBe(original.measured_date);
    expect(roundTripped.weight).toBe(original.weight);
    expect(roundTripped.weight_unit).toBe(original.weight_unit);
    expect(roundTripped.waist_cm).toBe(original.waist_cm);
    expect(roundTripped.hip_cm).toBe(original.hip_cm);
    expect(roundTripped.body_fat_pct).toBe(original.body_fat_pct);
    expect(roundTripped.notes).toBe(original.notes);
  });
});
