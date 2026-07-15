import type { OrgSettingsDto } from '@coresphere/shared';
import { OrgSettingsModel, toOrgSettingsDto, type OrgSettingsHydrated } from './settings.model';
import type { UpdateSettingsInput } from './settings.schemas';

/** Loads the singleton settings document, creating it with defaults if absent. */
async function loadOrCreate(): Promise<OrgSettingsHydrated> {
  const existing = await OrgSettingsModel.findOne().exec();
  if (existing) return existing;
  return OrgSettingsModel.create({});
}

export const settingsService = {
  async get(): Promise<OrgSettingsDto> {
    return toOrgSettingsDto(await loadOrCreate());
  },

  async update(input: UpdateSettingsInput): Promise<OrgSettingsDto> {
    const settings = await loadOrCreate();
    if (input.name !== undefined) settings.name = input.name;
    if (input.legalName !== undefined) settings.legalName = input.legalName;
    if (input.email !== undefined) settings.email = input.email;
    if (input.phone !== undefined) settings.phone = input.phone;
    if (input.address !== undefined) settings.address = input.address;
    if (input.currency !== undefined) settings.currency = input.currency;
    if (input.timezone !== undefined) settings.timezone = input.timezone;
    if (input.fiscalYearStartMonth !== undefined) settings.fiscalYearStartMonth = input.fiscalYearStartMonth;
    await settings.save();
    return toOrgSettingsDto(settings);
  },
};
