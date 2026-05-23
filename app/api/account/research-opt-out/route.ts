import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { SessionExpiredError, NotFoundError } from '@/lib/errors';
import { computeHash } from '@/lib/security/peppers';

export const runtime = 'nodejs';

const ResearchPatchSchema = z.object({
  research_opt_in: z.boolean(),
  /**
   * Cuando research_opt_in=false, opcionalmente eliminar la
   * contribución existente del dataset (Ley 25.326 art. 17 oposición
   * con efectos retroactivos). Sin esto, los registros pasados quedan
   * pseudonimizados pero presentes hasta el delete account.
   */
  purge_existing: z.boolean().optional(),
});

/**
 * POST /api/account/research-opt-out
 *
 * Toggle de oposición al tratamiento con fines de investigación bajo
 * Ley 25.326 art. 17. Endpoint server-side que mueve la lógica fuera
 * del cliente, agrega validación Zod y opcionalmente purga el dataset
 * de research del usuario.
 */
export const POST = withErrorHandler(async (req) => {
  const body = ResearchPatchSchema.parse(await req.json());

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new SessionExpiredError();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      research_opt_in: body.research_opt_in,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('research_opt_in')
    .single();

  if (error || !data) {
    console.error('[account/research-opt-out] update failed', error);
    throw new NotFoundError('profile');
  }

  let purged = 0;
  if (!body.research_opt_in && body.purge_existing) {
    const userHash = await computeHash('research', user.id);
    const service = createServiceClient();
    const { count } = await service
      .from('research_dataset')
      .delete({ count: 'exact' })
      .eq('user_hash', userHash);
    purged = count ?? 0;
  }

  return {
    research_opt_in: data.research_opt_in,
    purged_records: purged,
  };
});
