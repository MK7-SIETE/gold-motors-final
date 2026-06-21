import { useState, useEffect } from 'react';
import { Shield, Award, Users, Heart, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const VALUES = [
  { icon:Shield, title:'Integrity',      desc:'We are honest about every vehicle we sell — condition, history, and price. No hidden surprises.' },
  { icon:Award,  title:'Quality',        desc:'Every car on our lot is personally selected and inspected. We would not sell what we would not drive.' },
  { icon:Heart,  title:'Customer first', desc:'Our job is not to sell you a car — it is to find you the right one. We take that difference seriously.' },
  { icon:Users,  title:'Community',      desc:'We are a Zambian business. We invest in our customers, our team, and our community.' },
];

const TEAM = [
  { name:'General Manager',   role:'Gold Motors',              initials:'GM' },
  { name:'Sales Consultant',  role:'New & pre-owned vehicles',  initials:'SC' },
  { name:'Import Specialist', role:'Japan & UAE sourcing',      initials:'IS' },
  { name:'Finance Office',    role:'All transactions',          initials:'FO' },
];

// Shown only if the API returns no approved reviews yet
const FALLBACK_TESTIMONIALS = [
  { id:1, name:'Mwansa C.',   car_bought:'Land Cruiser',   rating:5, message:'I was nervous buying a used car but the team at Gold Motors made the whole process transparent and easy. The Land Cruiser I bought has been perfect. Highly recommend.' },
  { id:2, name:'Grace B.',    car_bought:'Toyota Prado',   rating:5, message:'They sourced a Toyota Prado from Japan for me within 6 weeks. The price was fair, the car arrived in excellent condition, and they handled everything. Exceptional service.' },
  { id:3, name:'David P.',    car_bought:'BMW X5',         rating:5, message:'Professional from start to finish. The BMW X5 was exactly as described. I appreciated that they never pressured me and answered every question honestly.' },
  { id:4, name:'Chanda M.',   car_bought:'First car',      rating:5, message:'Bought my first car here. The team took time to explain everything about the vehicle and the purchase process. I felt confident the whole way through.' },
  { id:5, name:'Bwalya N.',   car_bought:'Pickup truck',   rating:5, message:'Sourced a pickup from South Africa. On time, on budget, no drama. Will be coming back for my next vehicle without question.' },
  { id:6, name:'Thandiwe K.', car_bought:'Import vehicle', rating:5, message:'The import process seemed complicated but Gold Motors made it simple. They kept me updated every step and delivered the car to my door. Outstanding.' },
];

function Stars({ count }) {
  return (
    <div style={{ display:'flex', gap:'2px', marginBottom:'10px' }}>
      {Array(count).fill(null).map((_,i) => <Star key={i} size={14} style={{ color:'var(--gold)', fill:'var(--gold)' }} />)}
    </div>
  );
}

export default function About() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    api.getTestimonials()
      .then(data => { if (Array.isArray(data) && data.length > 0) setTestimonials(data); })
      .catch(() => {}); // keep fallback silently
  }, []);

  return (
    <div style={{ background:'var(--bg)' }}>

      <div style={{ background:'var(--black)', padding:'56px 0 48px' }}>
        <div className="container" style={{ maxWidth:'700px' }}>
          <span className="section-label">Our story</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,48px)', color:'#fff', lineHeight:1.2, marginBottom:'16px' }}>Built on trust.<br />Driven by quality.</h1>
          <p style={{ fontSize:'16px', color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>Gold Motors General Dealers Limited is a Zambian pre-owned vehicle dealership with a simple mission: give every customer a vehicle they can trust, at a price that is fair, with service that is honest.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'48px', alignItems:'center' }}>
            <div>
              <span className="section-label">Who we are</span>
              <h2 className="section-title" style={{ marginBottom:'16px' }}>A dealership built different</h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.8, marginBottom:'16px' }}>Gold Motors was founded with one belief: buying a used car in Zambia should not feel like a gamble. Too many buyers have been burned by hidden faults, inflated prices, and dishonest sellers.</p>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.8, marginBottom:'16px' }}>We started Gold Motors to change that. Every vehicle we stock is personally selected and inspected. Every price is honest. Every customer gets the same straightforward service.</p>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.8 }}>Through our import sourcing service, we find vehicles from Japan, UAE, UK and South Africa — giving Zambian buyers access to the global market without the risk of navigating it alone.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {[['50+','Vehicles sold'],['6+','Countries sourced from'],['100%','Satisfaction target'],['24hrs','Average response time']].map(([num, label]) => (
                <div key={label} style={{ padding:'24px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', textAlign:'center' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:600, color:'var(--gold)', lineHeight:1 }}>{num}</p>
                  <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'6px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background:'var(--bg-section)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'44px' }}>
            <span className="section-label">What we stand for</span>
            <h2 className="section-title">Our values</h2>
          </div>
          <div className="features-grid">
            {VALUES.map(({ icon:Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-card__icon"><Icon size={20} /></div>
                <div className="feature-card__title">{title}</div>
                <div className="feature-card__desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'44px' }}>
            <span className="section-label">The people behind it</span>
            <h2 className="section-title">Our team</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px' }}>
            {TEAM.map(({ name, role, initials }) => (
              <div key={name} style={{ textAlign:'center', padding:'28px 20px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
                <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'var(--black)', color:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:600, fontFamily:'var(--font-display)', margin:'0 auto 14px' }}>{initials}</div>
                <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'4px' }}>{name}</p>
                <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews section — loads real data, falls back to placeholder ── */}
      <section className="section" style={{ background:'var(--black)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'44px' }}>
            <span className="section-label">What our customers say</span>
            <h2 className="section-title" style={{ color:'#fff' }}>Real experiences</h2>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'15px', marginTop:'10px' }}>From buyers across Zambia who trusted us with their next vehicle.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px' }}>
            {testimonials.map((t) => (
              <div key={t.id} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--radius-lg)', padding:'24px', display:'flex', flexDirection:'column', gap:'12px' }}>
                <Quote size={20} style={{ color:'var(--gold)', opacity:0.6 }} />
                <Stars count={t.rating} />
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, flex:1 }}>"{t.message}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'12px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'var(--gold-muted)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:600, color:'var(--gold)' }}>
                    {t.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'#fff' }}>{t.name}</p>
                    {t.car_bought && (
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{t.car_bought}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <h2 className="cta-section__title">Ready to find your vehicle?</h2>
          <p className="cta-section__sub">Browse our current inventory or talk to our team today.</p>
          <div className="cta-section__btns">
            <Link to="/inventory" className="btn btn-primary btn-lg">Browse inventory</Link>
            <Link to="/source-a-car" className="btn btn-white btn-lg">Source a car</Link>
          </div>
        </div>
      </section>
    </div>
  );
}