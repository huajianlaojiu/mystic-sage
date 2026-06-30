"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const m = await import("@/lib/supabase");
      const { error } = await m.getBrowserClient().auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else window.location.href = "/reading";
    } catch {
      setMsg("Configure Supabase in .env.local first");
    } finally { setLoading(false); }
  }

  return (
    <>
      <section className="page-header"><h1>Welcome back</h1><p>Sign in to access your readings and account.</p></section>
      <section className="section">
        <div className="container" style={{maxWidth:420,margin:"0 auto"}}>
          <form onSubmit={handleLogin}>
            {msg && <p style={{color:"#ff5050",fontSize:13,marginBottom:12,textAlign:"center"}}>{msg}</p>}
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:16}} />
            <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:24}} />
            <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",justifyContent:"center",opacity:loading?0.6:1}}>{loading?"Signing in...":"Sign In"}</button>
          </form>
          <p style={{textAlign:"center",marginTop:20,fontSize:13,color:"var(--text-muted)"}}>No account? <Link href="/auth/register" style={{color:"var(--accent)"}}>Create one</Link></p>
        </div>
      </section>
    </>
  );
}
