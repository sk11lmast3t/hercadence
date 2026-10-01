import type {
  MedicationDto,
  MedicationDtoWrite,
  MedicationEntry,
  MedicationEntryInput,
} from './medication.types';

export function mapMedicationDtoToDomain(dto: MedicationDto): MedicationEntry {
  return {
    id: dto.id,
    name: dto.name,
    dosage: dto.dosage ?? null,
    frequency: dto.frequency ?? null,
    isActive: dto.is_active,
    createdAt: dto.created_at,
  };
}

export function mapMedicationDomainToDto(
  entry: MedicationEntry | MedicationEntryInput,
  trustedClerkUserId: string
): MedicationDtoWrite {
  return {
    ...(entry.id ? { id: entry.id } : {}),
    clerk_user_id: trustedClerkUserId,
    name: entry.name,
    dosage: entry.dosage ?? null,
    frequency: entry.frequency ?? null,
    ...(entry.isActive === undefined ? {} : { is_active: entry.isActive }),
    ...(entry.createdAt === undefined ? {} : { created_at: entry.createdAt }),
  };
}
