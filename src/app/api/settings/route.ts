import { getSiteSettings, updateSiteSettings } from '@/controllers/admin/settingsController';

export const GET = async () => {
  return await getSiteSettings();
};

export const PUT = async (req: Request) => {
  return await updateSiteSettings(req);
};
