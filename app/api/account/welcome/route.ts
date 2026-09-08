import { createClient } from '@/lib/supabase/server';
import { sendWelcomeForNewAccount } from '@/lib/email/welcome';
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
  try {
    const sent = await sendWelcomeForNewAccount(user, siteUrl);
    return Response.json({ok:true,sent});
  } catch {
    // Welcome mail is optional; failing to send never invalidates registration.
    return Response.json({ok:false,error:'welcome_email_unavailable'},{status:503});
  }
}
