import { z } from 'zod';
import { createEdgeClient } from '@/lib/supabase/edge';
import { BFI2SAnswersSchema, BFI2S_VERSION, createSelfReport } from '@/lib/assessment/bfi2s';

export const runtime = 'edge';
const Input = z.object({ profileId: z.string().uuid(), instrument: z.literal(BFI2S_VERSION), answers: BFI2SAnswersSchema, accepted: z.literal(true) }).strict();

export async function POST(req: Request) {
  const session = new Response();
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: session.headers });
  // JSON-only same-origin endpoint. RLS and explicit ownership both apply.
  const origin = req.headers.get('origin');
  // Next's local Edge adapter normalizes req.url to localhost even when the
  // browser uses 127.0.0.1. Host retains the browser's actual host and port.
  const requestUrl = new URL(req.url);
  const expectedOrigin = `${requestUrl.protocol}//${req.headers.get('host') ?? requestUrl.host}`;
  if (origin && origin !== expectedOrigin) return reply({ ok: false, error: 'origin' }, 403);
  if (!req.headers.get('content-type')?.includes('application/json')) return reply({ ok: false, error: 'validation' }, 415);
  if (Number(req.headers.get('content-length') ?? 0) > 4096) return reply({ ok: false, error: 'validation' }, 413);
  const supabase = createEdgeClient(req, session);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return reply({ ok: false, error: 'session_expired' }, 401);
  let input;
  try {
    const text = await req.text();
    if (text.length > 4096) return reply({ ok: false, error: 'validation' }, 413);
    input = Input.parse(JSON.parse(text));
  } catch { return reply({ ok: false, error: 'validation' }, 400); }
  const { data: consent, error: consentError } = await supabase.from('consent_records').select('id').eq('user_id', user.id).limit(1).maybeSingle();
  if (consentError) return reply({ ok: false, error: 'consent_unavailable' }, 503);
  if (!consent) return reply({ ok: false, error: 'consent_required' }, 403);
  const { data: profile, error: readError } = await supabase.from('psychological_profiles').select('id, analysis_raw, updated_at').eq('id', input.profileId).eq('user_id', user.id).maybeSingle();
  if (readError) return reply({ ok: false, error: 'storage_unavailable' }, 503);
  if (!profile) return reply({ ok: false, error: 'not_found' }, 404);
  const completedAt = new Date().toISOString();
  const selfReport = createSelfReport(input.answers, completedAt);
  const previous = profile.analysis_raw && typeof profile.analysis_raw === 'object' && !Array.isArray(profile.analysis_raw) ? profile.analysis_raw : {};
  // Compare-and-swap: never overwrite a concurrently regenerated profile.
  // No service-role client; the authenticated user's RLS applies to this write.
  const { data: saved, error } = await supabase.from('psychological_profiles')
    .update({ analysis_raw: { ...previous, selfReport }, updated_at: completedAt })
    .eq('id', input.profileId).eq('user_id', user.id).eq('updated_at', profile.updated_at)
    .select('id').maybeSingle();
  if (error) return reply({ ok: false, error: 'storage_unavailable' }, 503);
  if (!saved) return reply({ ok: false, error: 'profile_changed' }, 409);
  // These answers are not inserted into research_dataset and never train ML.
  return reply({ ok: true, data: { selfReport } });
}
