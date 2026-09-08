import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api/with-error-handler';
import { computeHash, CURRENT_PEPPER_VERSION } from '@/lib/security/peppers';
import { computeConsentTextHash } from '@/lib/consent/text-v1-es-AR';
import { CONSENT_VERSION_V2, CONSENT_LOCALE_V2, CONSENT_TEXT_V2_ES_AR } from '@/lib/consent/text-v2-es-AR';

export const runtime = 'nodejs';

const ConsentSchema = z.object({
  consentVersion: z.literal(CONSENT_VERSION_V2),
  researchOptIn: z.boolean(),
  consentTextHash: z.string().regex(/^[a-f0-9]{64}$/),
  locale: z.literal(CONSENT_LOCALE_V2),
});

export const POST = withErrorHandler(async (req) => {
  const body = ConsentSchema.parse(await req.json());
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }
  const canonicalHash = await computeConsentTextHash(CONSENT_TEXT_V2_ES_AR);
  if (body.consentTextHash !== canonicalHash) {
    return Response.json({ ok: false, error: 'consent_text_mismatch' }, { status: 400 });
  }

  const service = createServiceClient();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const userAgent = req.headers.get('user-agent') ?? 'unknown';

  const ipHash = await computeHash('consent_ip', ip);

  // Both choices commit together. Missing RPC or either failed write must not
  // leave a new acceptance with a different research preference than submitted.
  const { data: consentId, error: consentError } = await service.rpc('record_consent_atomic', {
    p_user_id: user.id,
    p_consent_version: body.consentVersion,
    p_consent_text_hash: canonicalHash,
    p_locale: body.locale,
    p_ip_hash: ipHash,
    p_pepper_version: CURRENT_PEPPER_VERSION,
    p_user_agent: userAgent,
    p_research_opt_in: body.researchOptIn,
  });

  if (consentError || !consentId) {
    console.error('[consent] atomic save failed', consentError);
    if (consentError?.code === 'PGRST202' || consentError?.code === '42883') {
      return Response.json({ ok: false, error: 'consent_unavailable' }, { status: 503 });
    }
    return Response.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  return { consentRecorded: true };
});
