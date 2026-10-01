import { describe, expect, it } from 'vitest';
import {
  mapMedicationDomainToDto,
  mapMedicationDtoToDomain,
} from './medication.mappers';
import { MedicationDto, MedicationEntry, MedicationEntryInput } from './medication.types';

describe('Medication mappers', () => {
  it('maps every approved DTO field into the domain', () => {
    const dto: MedicationDto = {
      id: 'med-1',
      clerk_user_id: 'user-1',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      is_active: true,
      created_at: '2026-09-30T08:00:00.000Z',
    };

    expect(mapMedicationDtoToDomain(dto)).toEqual({
      id: 'med-1',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      isActive: true,
      createdAt: '2026-09-30T08:00:00.000Z',
    });
  });

  it('maps nullable dosage and frequency to nullable domain values', () => {
    const dto: MedicationDto = {
      id: 'med-2',
      clerk_user_id: 'user-1',
      name: 'Medication',
      dosage: null,
      frequency: null,
      is_active: false,
      created_at: '2026-09-29T08:00:00.000Z',
    };

    expect(mapMedicationDtoToDomain(dto)).toMatchObject({
      dosage: null,
      frequency: null,
      isActive: false,
    });
  });

  it('maps domain fields to the DTO using trusted ownership', () => {
    const entry: MedicationEntry = {
      id: 'med-3',
      name: 'Magnesium',
      dosage: '200 mg',
      frequency: 'At night',
      isActive: true,
      createdAt: '2026-09-28T08:00:00.000Z',
    };

    expect(mapMedicationDomainToDto(entry, 'trusted-user')).toEqual({
      id: 'med-3',
      clerk_user_id: 'trusted-user',
      name: 'Magnesium',
      dosage: '200 mg',
      frequency: 'At night',
      is_active: true,
      created_at: '2026-09-28T08:00:00.000Z',
    });
  });

  it('does not allow caller-supplied ownership to override the trusted owner', () => {
    const entry = {
      name: 'Zinc',
      dosage: null,
      frequency: null,
      clerk_user_id: 'malicious-user',
    } as MedicationEntryInput & { clerk_user_id: string };

    expect(mapMedicationDomainToDto(entry, 'trusted-user').clerk_user_id).toBe('trusted-user');
  });
});
