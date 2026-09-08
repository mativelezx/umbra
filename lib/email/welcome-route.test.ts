// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const data=vi.hoisted(()=>({user:{id:'qa-user',email:'qa@example.com',created_at:''} as null|{id:string;email:string;created_at:string},send:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({createClient:async()=>({auth:{getUser:async()=>({data:{user:data.user}})}})}));
vi.mock('@/lib/email/resend',()=>({sendWelcomeEmail:data.send}));
import { POST } from '@/app/api/account/welcome/route';
const request=(origin='http://localhost')=>new Request('http://localhost/api/account/welcome',{method:'POST',headers:{origin,host:'localhost'}});
beforeEach(()=>{data.user={id:'qa-user',email:'qa@example.com',created_at:new Date().toISOString()};data.send.mockReset();});
it('does not send without a session',async()=>{data.user=null;expect((await POST(request())).status).toBe(401);expect(data.send).not.toHaveBeenCalled();});
it('rejects a foreign origin',async()=>{expect((await POST(request('https://foreign.example'))).status).toBe(403);expect(data.send).not.toHaveBeenCalled();});
it('does not send to an account older than the welcome window',async()=>{data.user!.created_at='2020-01-01';expect(await(await POST(request())).json()).toEqual({ok:true,sent:false});expect(data.send).not.toHaveBeenCalled();});
it('uses the authenticated email and a stable deduplication key',async()=>{expect((await POST(request())).status).toBe(200);expect(data.send).toHaveBeenCalledWith(expect.objectContaining({to:'qa@example.com',idempotencyKey:'umbra-welcome-qa-user'}));});
it('reports an optional email failure without claiming delivery',async()=>{data.send.mockRejectedValue(new Error('fixture'));expect(await(await POST(request())).json()).toEqual({ok:false,error:'welcome_email_unavailable'});});
