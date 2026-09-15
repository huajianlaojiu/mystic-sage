"use client";
import { useState } from "react";
import Link from "next/link";
import { gtagEvent } from "@/lib/analytics";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // The account is created by our own API route rather than by the browser
  // client: Supabase Auth's outbound mail never reached users, so the
  // confirmation link is generated server-side and sent over the app's Resend
  // integration, which is the channel that demonstrably delivers.
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(""); setDone(false);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        gtagEvent("sign_up", { method: "email" });
        setDone(true);
        setMsg(data.message || "Check your email for the confirmation link.");
      } else {
        setMsg(data.error || "Could not create the account. Please try again.");
      }
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="page-header"><h1>Create your account</h1><p>Free access to daily readings. Upgrade anytime for premium insights.</p></section>
      <section className="section">
        <div className="container" style={{maxWidth:420,margin:"0 auto"}}>
          {done ? (
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>✦</div>
              <h2 style={{fontFamily:"var(--font-serif)",fontSize:22,color:"var(--text-primary)",marginBottom:10}}>Check your inbox</h2>
              <p style={{fontSize:14,color:"var(--text-muted)",lineHeight:1.7,marginBottom:20}}>
                We sent a confirmation link to <strong style={{color:"var(--text-primary)"}}>{email}</strong>.
                Click it to finish setting up your account. It can take a minute to arrive, and it is worth checking the spam folder.
              </p>
              <p style={{fontSize:13,color:"var(--text-muted)"}}>
                Wrong address? <button type="button" onClick={() => { setDone(false); setMsg(""); }} style={{background:"none",border:"none",color:"var(--accent)",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Start again</button>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleRegister}>
                {msg && <p style={{color:"#ff5050",fontSize:13,marginBottom:12,textAlign:"center"}}>{msg}</p>}
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:16}} />
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete="new-password" style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:8}} />
                <p style={{fontSize:11,color:"var(--text-muted)",marginBottom:24}}>At least 8 characters.</p>
                <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",justifyContent:"center",opacity:loading?0.6:1}}>{loading?"Creating...":"Create Account"}</button>
              </form>
              <p style={{textAlign:"center",marginTop:20,fontSize:13,color:"var(--text-muted)"}}>Already have an account? <Link href="/auth/login" style={{color:"var(--accent)"}}>Sign in</Link></p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
