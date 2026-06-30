"use client";
import { useState } from "react";
import Link from "next/link";

const PAYPAL_EMAIL = "mountain0342@gmail.com";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

function PayPalForm({ itemName, amount, label, className }: { itemName: string; amount: string; label: string; className: string }) {
  return (
    <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post" target="_blank">
      <input type="hidden" name="cmd" value="_xclick" />
      <input type="hidden" name="business" value={PAYPAL_EMAIL} />
      <input type="hidden" name="item_name" value={itemName} />
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="currency_code" value="USD" />
      <input type="hidden" name="return" value={SITE_URL + "/success"} />
      <input type="hidden" name="cancel_return" value={SITE_URL + "/pricing"} />
      <button type="submit" className={className}>{label}</button>
    </form>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <section className="page-header">
        <h1>Simple, transparent pricing</h1>
        <p>No hidden fees. No surprises. Choose the option that works best for you.</p>
      </section>
      <section className="section">
        <div className="container">
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:40}}>
            <label style={{fontSize:14,color:annual?"var(--text-muted)":"var(--text-primary)",fontWeight:annual?400:600,cursor:"pointer"}} onClick={()=>setAnnual(false)}>Monthly</label>
            <div onClick={()=>setAnnual(!annual)} style={{position:"relative",width:48,height:26,background:annual?"rgba(180,100,255,0.25)":"rgba(255,255,255,0.08)",borderRadius:13,cursor:"pointer"}}>
              <div style={{position:"absolute",top:3,left:annual?25:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.25s"}} />
            </div>
            <label style={{fontSize:14,color:annual?"var(--text-primary)":"var(--text-muted)",fontWeight:annual?600:400,cursor:"pointer"}} onClick={()=>setAnnual(true)}>Annual <span style={{color:"var(--accent)",fontWeight:600,fontSize:12}}>Save 25%</span></label>
          </div>

          <div className="pricing-grid" style={{maxWidth:900,margin:"0 auto"}}>
            <div className="pricing-card" style={{textAlign:"center"}}>
              <h3>Daily Pull</h3>
              <div className="subtitle">Free forever</div>
              <div className="price">$0<span>/mo</span></div>
              <div className="desc">Perfect for curious minds and daily reflection.</div>
              <ul>
                <li>Daily free tarot card pull</li>
                <li>Daily horoscope</li>
                <li>Basic numerology reading</li>
                <li>Shareable card templates</li>
                <li>Community access</li>
              </ul>
              <Link href="/reading" className="btn-pricing secondary">Get Started Free</Link>
            </div>

            <div className="pricing-card featured" style={{textAlign:"center"}}>
              <div className="badge">Most Popular</div>
              <h3>Mystic Plus</h3>
              <div className="subtitle">For regular seekers</div>
              <div className="price">{annual ? "$169" : "$19"}<span>/{annual ? "yr" : "mo"}</span></div>
              <div className="desc">Unlock deeper insights with premium content.</div>
              <ul>
                <li>Everything in Free, plus</li>
                <li>Extended daily readings (3 cards)</li>
                <li>Weekly astrology forecast</li>
                <li>Priority psychic matching</li>
                <li>10% off 1-on-1 sessions</li>
                <li>Ad-free experience</li>
              </ul>
              <PayPalForm itemName={annual?"Mystic Plus - Annual":"Mystic Plus - Monthly"} amount={annual?"169.00":"19.00"} label={annual?"Subscribe Annual ($169)":"Subscribe Monthly ($19)"} className="btn-pricing primary" />
            </div>

            <div className="pricing-card" style={{textAlign:"center"}}>
              <h3>Sage Premium</h3>
              <div className="subtitle">For deep transformation</div>
              <div className="price">{annual ? "$349" : "$39"}<span>/{annual ? "yr" : "mo"}</span></div>
              <div className="desc">The full MysticSage experience.</div>
              <ul>
                <li>Everything in Plus, plus</li>
                <li>Monthly full birth chart report</li>
                <li>1 free 15-min reading / month</li>
                <li>Priority booking</li>
                <li>25% off 1-on-1 sessions</li>
                <li>Exclusive member events</li>
              </ul>
              <PayPalForm itemName={annual?"Sage Premium - Annual":"Sage Premium - Monthly"} amount={annual?"349.00":"39.00"} label={annual?"Subscribe Annual ($349)":"Subscribe Monthly ($39)"} className="btn-pricing secondary" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-tag">Premium Reports</div>
          <h2 className="section-title">One-time report purchases</h2>
          <p className="section-sub">Deep-dive reports delivered to your inbox within 48 hours.</p>
          <div className="pricing-grid" style={{maxWidth:800,margin:"0 auto"}}>
            <div className="pricing-card" style={{textAlign:"center"}}>
              <h3>Birth Chart Report</h3>
              <div className="price">$29</div>
              <div className="desc">A comprehensive 20+ page report of your complete natal chart.</div>
              <PayPalForm itemName="Birth Chart Report" amount="29.00" label="Order Now ($29)" className="btn-pricing secondary" />
            </div>
            <div className="pricing-card" style={{textAlign:"center"}}>
              <h3>Annual Forecast</h3>
              <div className="price">$49</div>
              <div className="desc">Your complete year ahead with monthly transits.</div>
              <PayPalForm itemName="Annual Forecast Report" amount="49.00" label="Order Now ($49)" className="btn-pricing secondary" />
            </div>
            <div className="pricing-card" style={{textAlign:"center"}}>
              <h3>Couples Compatibility</h3>
              <div className="price">$59</div>
              <div className="desc">Full synastry analysis for two people.</div>
              <PayPalForm itemName="Couples Compatibility Report" amount="59.00" label="Order Now ($59)" className="btn-pricing secondary" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
