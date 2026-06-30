"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const m = await import("@/lib/supabase");
      const { error } = await m.getBrowserClient().auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth/callback" } });
      if (error) setMsg(error.message);
      else setMsg("Check your email for the confirmation link!");
    } catch { setMsg("Configure Supabase in .env.local first"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <section className="page-header"><h1>Create your account</h1><p>Free access to daily readings. Upgrade anytime for premium insights.</p></section>
      <section className="section">
        <div className="container" style={{maxWidth:420,margin:"0 auto"}}>
          <form onSubmit={handleRegister}>
            {msg && <p style={{color:msg.includes("Check")?"var(--green)":"#ff5050",fontSize:13,marginBottom:12,textAlign:"center"}}>{msg}</p>}
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:16}} />
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:24}} />
            <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",justifyContent:"center",opacity:loading?0.6:1}}>{loading?"Creating...":"Create Account"}</button>
          </form>
          <p style={{textAlign:"center",marginTop:20,fontSize:13,color:"var(--text-muted)"}}>Already have an account? <Link href="/auth/login" style={{color:"var(--accent)"}}>Sign in</Link></p>
        </div>
      </section>
    </>
  );
}
