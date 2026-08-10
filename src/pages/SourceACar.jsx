import { useState } from 'react';
import { Globe, ClipboardList, CheckCircle, Ship, DollarSign, Clock, FileText, Shield, Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import Toast from '../components/Toast';
import { useSiteConfig } from '../context/SiteConfigContext';

const STEPS = [
  { icon: ClipboardList, title: 'Tell us what you need',  desc: 'Share the make, model, year, colour and budget. The more detail the better.' },
  { icon: Globe,         title: 'We search globally',     desc: 'Our network covers Japan, UAE, United Kingdom, and South Africa.' },
  { icon: CheckCircle,   title: 'You review and approve', desc: 'We present options with photos, specs and a full landed cost breakdown.' },
  { icon: Ship,          title: 'We handle everything',   desc: 'Shipping, insurance, customs clearance and delivery to your door.' },
];
const GUIDE_ITEMS = [
  { icon: DollarSign, title: 'What does it cost?',        desc: 'The landed cost includes vehicle price, freight, insurance, ZRA import duties, and our sourcing fee. Full breakdown before you commit.' },
  { icon: Clock,      title: 'How long does it take?',    desc: 'Japan and UAE shipments take 4–8 weeks. UK sourcing takes 6–10 weeks. We keep you updated throughout.' },
  { icon: FileText,   title: 'What documents do I need?', desc: 'Your national ID or passport, a utility bill, and your ZRA tax number. We guide you through everything.' },
  { icon: Shield,     title: 'Is it safe?',               desc: 'All vehicles come with original auction inspection reports. We only work with verified suppliers and licensed clearing agents.' },
];
const MAKES = ['Toyota','Mitsubishi','Nissan','Honda','BMW','Mercedes-Benz','Land Rover','Volkswagen','Mazda','Subaru','Other'];
const YEARS = Array.from({length:15},(_,i) => String(new Date().getFullYear() - i));

export default function SourceACar() {
  const cfg       = useSiteConfig();
  const phone     = cfg.phone    || '+260 97X XXX XXX';
  const whatsapp  = cfg.whatsapp || cfg.phone || '';
  const email     = cfg.email    || 'info@mukubamotors.zm';
  const hours     = (() => {
    try {
      const h = typeof cfg.hours === 'string' ? JSON.parse(cfg.hours) : cfg.hours;
      if (h && typeof h === 'object') {
        const entries = Object.entries(h);
        const mon = entries.find(([d]) => d === 'Monday');
        const sat = entries.find(([d]) => d === 'Saturday');
        if (mon && sat) return `Mon – Sat: ${mon[1]}`;
        if (entries.length) return `${entries[0][0]}: ${entries[0][1]}`;
      }
    } catch {}
    return 'Mon – Sat: 08:00 – 17:00';
  })();

  const [form, setForm]     = useState({ name:'', phone:'', email:'', make:'', model:'', year:'', color:'', budget:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [toast, setToast]   = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.make || !form.model) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' }); return;
    }
    setLoading(true);
    try {
      await api.submitMessage({
        name: form.name, email: form.email, phone: form.phone,
        subject: 'Import request: ' + form.make + ' ' + form.model,
        message: 'Year: ' + (form.year || 'Any') + ' | Colour: ' + (form.color || 'Any') + ' | Budget: ' + (form.budget || 'Not stated') + ' | Notes: ' + form.notes,
        type: 'import_request',
      });
      setForm({ name:'', phone:'', email:'', make:'', model:'', year:'', color:'', budget:'', notes:'' });
      setSent(true);
    } catch {
      setToast({ message: 'Failed to submit. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Hero */}
      <div className="source-page-hero">
        <div className="container">
          <span className="section-label">Import service</span>
          <h1>Can't find it here?<br />We'll source it for you.</h1>
          <p>We source vehicles directly from Japan, UAE, United Kingdom and beyond. Tell us exactly what you want.</p>
          <div className="source-country-grid">
            {[['Japan','Primary source'],['UAE','Luxury vehicles'],['UK','European imports'],['South Africa','Local sourcing']].map(([country, label]) => (
              <div key={country}>
                <p className="source-country-name">{country}</p>
                <p className="source-country-label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="section" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="section-label">The process</span>
            <h2 className="section-title">How it works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '24px' }}>
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--black)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <Icon size={20} style={{ color: 'var(--gold)', marginBottom: '10px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request form */}
      <section id="request" className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>

            <div>
              <span className="section-label">Make a request</span>
              <h2 className="section-title" style={{ marginBottom: '8px' }}>Tell us what you want</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                Fill in as much detail as possible. We respond within 24 hours with options and a landed cost estimate — no commitment required.
              </p>

              {sent ? (
                <div className="success-box" style={{ textAlign: 'left', maxWidth: '100%' }}>
                  <div className="success-icon">✓</div>
                  <h3>Request received!</h3>
                  <p>Our team will contact you within 24 hours with sourcing options and a cost estimate.</p>
                  <button className="btn btn-black" onClick={() => setSent(false)}>Submit another request</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label">Full name *</label>
                      <input className="input" placeholder="Your name" value={form.name} onChange={set('name')} required />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label">Phone number *</label>
                      <input className="input" placeholder="+260 97X XXX XXX" value={form.phone} onChange={set('phone')} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="label">Email address *</label>
                    <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                  </div>
                  <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label">Make *</label>
                      <select className="select" value={form.make} onChange={set('make')} required>
                        <option value="">Select make</option>
                        {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label">Model *</label>
                      <input className="input" placeholder="e.g. Land Cruiser" value={form.model} onChange={set('model')} required />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label">Preferred year</label>
                      <select className="select" value={form.year} onChange={set('year')}>
                        <option value="">Any year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="label">Preferred colour</label>
                      <input className="input" placeholder="e.g. White, any" value={form.color} onChange={set('color')} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="label">Budget (K)</label>
                    <input className="input" placeholder="e.g. K 250,000" value={form.budget} onChange={set('budget')} />
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="label">Additional notes</label>
                    <textarea className="input textarea" placeholder="Specific features, urgency, or anything else we should know..." value={form.notes} onChange={set('notes')} style={{ minHeight: '90px' }} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} disabled={loading}>
                    {loading ? 'Submitting...' : <><span>Submit request</span><ArrowRight size={16} /></>}
                  </button>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>No commitment required. We respond within 24 hours.</p>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '16px' }}>Prefer to talk?</h3>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn btn-black" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>
                  <Phone size={15} /> {phone}
                </a>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
                <a href={`mailto:${email}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  <Mail size={15} /> {email}
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>{hours}</p>
              </div>

              <div id="guide" className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '16px' }}>Import guide</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {GUIDE_ITEMS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} style={{ color: 'var(--gold)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}