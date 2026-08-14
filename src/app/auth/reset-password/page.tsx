"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const m = await import("@/lib/supabase");
        const { data, error } = await m.getBrowserClient().auth.getUser();
        if (error || !data.user) {
          setMsg("Your reset link is invalid or expired. Please request a new one.");
          setReady(false);
        } else {
          setReady(true);
        }
      } catch {
        setMsg("Something went wrong. Please request a new reset link.");
        setReady(false);
      }
    })();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }
    setLoading(true);
    try {
      const m = await import("@/lib/supabase");
      const { error } = await m.getBrowserClient().auth.updateUser({ password: pw });
      if (error) setMsg(error.message);
      else window.location.href = "/auth/login?reset=ok";
    } catch {
      setMsg("Something went wrong. Please try the reset link again.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <section className="page-header"><h1>Reset your password</h1><p>Choose a new password for your account.</p></section>
      <section className="section">
        <div className="container" style={{maxWidth:420,margin:"0 auto"}}>
          {msg && <p style={{color:ready?"#ff5050":"var(--accent)",fontSize:13,marginBottom:12,textAlign:"center"}}>{msg}</p>}
          {ready ? (
            <form onSubmit={handleReset}>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>New password</label>
              <input type="password" value={pw} onChange={e=>setPw(e.target.value)} required minLength={6} style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:16}} />
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:4}}>Confirm new password</label>
              <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} required minLength={6} style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"var(--text-primary)",fontSize:14,fontFamily:"inherit",outline:"none",marginBottom:24}} />
              <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",justifyContent:"center",opacity:loading?0.6:1}}>{loading?"Updating...":"Update password"}</button>
            </form>
          ) : (
            <p style={{textAlign:"center",marginTop:8,fontSize:13,color:"var(--text-muted)"}}>Need a link? <Link href="/auth/login" style={{color:"var(--accent)"}}>Back to sign in</Link></p>
          )}
        </div>
      </section>
    </>
  );
}
