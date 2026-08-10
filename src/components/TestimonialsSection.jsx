import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const FALLBACK = [
  { id: 1, name: 'Chanda M.',  car_bought: 'Toyota Hilux 2020',  message: 'Excellent service and very professional team. My Hilux was in perfect condition — exactly as advertised.', rating: 5 },
  { id: 2, name: 'Grace N.',   car_bought: 'Honda CR-V 2019',    message: 'Smooth process from viewing to driving away the same week. Highly recommend Mukuba Motors to anyone looking for a reliable car.', rating: 5 },
  { id: 3, name: 'Peter K.',   car_bought: 'Nissan X-Trail 2018', message: 'Fair pricing and honest advice. They helped me find exactly what I needed within my budget. Will come back for my next car.', rating: 4 },
];

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '16px' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={16} style={{ color: 'var(--gold)', fill: i <= rating ? 'var(--gold)' : 'none' }} />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK);
  const [current, setCurrent]           = useState(0);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ name: '', car_bought: '', message: '', rating: 5 });
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | loading | success | error

  useEffect(() => {
    api.getTestimonials()
      .then(data => { if (Array.isArray(data) && data.length > 0) setTestimonials(data); })
      .catch(() => {}); // keep fallback silently
  }, []);

  // Auto-advance
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const prev = () => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(c => (c + 1) % testimonials.length);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await api.submitTestimonial({ ...form, rating: Number(form.rating) });
      setSubmitStatus('success');
      setForm({ name: '', car_bought: '', message: '', rating: 5 });
    } catch {
      setSubmitStatus('error');
    }
  };

  const t = testimonials[current];

  return (
    <section className="section" style={{ background: 'var(--black)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-label" style={{ color: 'var(--gold)' }}>Customer reviews</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3.5vw,38px)', color: '#fff', marginTop: '6px' }}>
            What our customers say
          </h2>
        </div>

        {/* Carousel */}
        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,4vw,48px)', textAlign: 'center', minHeight: '200px' }}>
            <Stars rating={t.rating} />
            <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px' }}>
              "{t.message}"
            </p>
            <p style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{t.name}</p>
            {t.car_bought && (
              <p style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '4px' }}>{t.car_bought}</p>
            )}
          </div>

          {testimonials.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous" style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={next} aria-label="Next" style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {testimonials.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to review ${i + 1}`}
                style={{ width: '7px', height: '7px', borderRadius: '50%', border: 'none', background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, transition: 'background 0.2s' }} />
            ))}
          </div>
        )}

        {/* Leave a review CTA */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Leave a review
            </button>
          ) : submitStatus === 'success' ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px', maxWidth: '480px', margin: '0 auto', color: '#4ade80' }}>
              ✓ Thank you! Your review is awaiting approval and will appear here once approved.
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#fff', marginBottom: '18px' }}>Share your experience</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="label" style={{ color: 'rgba(255,255,255,0.6)' }}>Your name *</label>
                    <input name="name" className="input" value={form.name} onChange={handle} required placeholder="Full name"
                      style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'rgba(255,255,255,0.6)' }}>Car you bought</label>
                    <input name="car_bought" className="input" value={form.car_bought} onChange={handle} placeholder="e.g. Toyota Hilux"
                      style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label className="label" style={{ color: 'rgba(255,255,255,0.6)' }}>Rating *</label>
                  <select name="rating" className="select" value={form.rating} onChange={handle}
                    style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    <option value={5}>★★★★★ — Excellent</option>
                    <option value={4}>★★★★☆ — Very Good</option>
                    <option value={3}>★★★☆☆ — Good</option>
                    <option value={2}>★★☆☆☆ — Fair</option>
                    <option value={1}>★☆☆☆☆ — Poor</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label" style={{ color: 'rgba(255,255,255,0.6)' }}>Your review *</label>
                  <textarea name="message" className="input textarea" value={form.message} onChange={handle} required
                    placeholder="Tell us about your experience..." rows={4}
                    style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} />
                </div>
                {submitStatus === 'error' && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '10px' }}>Something went wrong. Please try again.</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitStatus === 'loading'}>
                    {submitStatus === 'loading' ? 'Submitting...' : 'Submit review'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}