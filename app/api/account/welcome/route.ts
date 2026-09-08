import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { requestOrigin as appOrigin } from '@/lib/auth/request-origin';

export const runtime='nodejs';
export async function POST(req: Request): Promise<Response> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || appOrigin(req);
  const requestOrigin=req.headers.get('origin');
  const requestUrl=new URL(req.url);
  const expectedOrigin=`${requestUrl.protocol}//${req.headers.get('host') ?? requestUrl.host}`;
  if (requestOrigin && requestOrigin !== expectedOrigin) return Response.json({ok:false,error:'origin'},{status:403});
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user?.email) return Response.json({ok:false,error:'unauthorized'},{status:401});
  const age=Date.now()-new Date(user.created_at).getTime();
  // No repeat-welcome endpoint for existing users. Resend deduplicates retries
  // for 24h; the one-hour account window stays strictly inside that period.
  if (!Number.isFinite(age) || age<0 || age>60*60*1000) return Response.json({ok:true,sent:false});
  try {
    await sendWelcomeEmail({to:user.email,siteUrl,idempotencyKey:`umbra-welcome-${user.id}`});
    return Response.json({ok:true,sent:true});
  } catch {
    // Welcome mail is optional; failing to send never invalidates registration.
    return Response.json({ok:false,error:'welcome_email_unavailable'},{status:503});
  }
}
