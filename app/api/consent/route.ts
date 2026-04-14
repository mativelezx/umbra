import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { computeHash, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';

export const runtime = 'nodejs';

const ConsentSchema = z.object({
  consentVersion: z.string().min(1).max(50),
  researchOptIn: z.boolean(),
  /**
   * SHA-256 of the consent text as rendered to the user, hex-encoded.
   * Optional for backward compatibility with pre-migration-004 clients;
   * when absent it persists as '' in consent_records and the record is
   * auditable only via consent_version. New clients should always
   * compute and send this to satisfy Ley 25.326 art. 7 verifiability.
   * See ADR-024.
   */
  consentTextHash: z
    .string()
    .regex(/^[a-f0-9]{0,64}$/i, 'hash debe ser hex SHA-256')
    .optional(),
  /** BCP-47 locale of the consent text (es-AR, en, etc.). Default es-AR. */
  locale: z.string().min(2).max(10).optional(),
});

export const POST = withErrorHandler(async (req) => {
  const body = ConsentSchema.parse(await req.json());
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const service = createServiceClient();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';

  const ipHash = await computeHash('consent_ip', ip);

  const { error: consentError } = await service.from('consent_records').insert({
    user_id: user.id,
    consent_version: body.consentVersion,
    consent_text_hash: body.consentTextHash ?? '',
    locale: body.locale ?? 'es-AR',
    ip_hash: ipHash,
    pepper_version: CURRENT_PEPPER_VERSION,
    user_agent: userAgent,
  });

  if (consentError) {
    console.error('[consent] failed to insert', consentError);
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  if (body.researchOptIn) {
    await service
      .from('profiles')
      .update({ research_opt_in: true })
      .eq('id', user.id);
  }

  return { consentRecorded: true };
});
