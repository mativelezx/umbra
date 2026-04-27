import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { SessionExpiredError, NotFoundError } from '@/lib/errors';

export const runtime = 'nodejs';

const ProfilePatchSchema = z.object({
  full_name: z.string().min(1).max(120).trim().optional(),
});

/**
 * PATCH /api/account/profile
 *
 * Rectificación de datos personales bajo Ley 25.326 art. 16.
 * Endpoint server-side que valida y persiste el cambio. Reemplaza el
 * UPDATE cliente-side previo (que confiaba en RLS pero saltaba Zod +
 * audit log).
 */
export const PATCH = withErrorHandler(async (req) => {
  const body = ProfilePatchSchema.parse(await req.json());

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const updates: Record<string, unknown> = {};
  if (body.full_name !== undefined) updates.full_name = body.full_name;
  if (Object.keys(updates).length === 0) {
    return { full_name: null, updated: false };
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('full_name')
    .single();

  if (error || !data) {
    console.error('[account/profile] update failed', error);
    throw new NotFoundError('profile');
  }

  return { full_name: data.full_name, updated: true };
});
