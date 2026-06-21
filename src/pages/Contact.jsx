import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Shield, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import Toast from '../components/Toast';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Contact() {
  const cfg = useSiteConfig();

  const phone   = cfg.phone    || '+260 97X XXX XXX';
  const whatsapp= cfg.whatsapp || cfg.phone || '';
  const email   = cfg.email    || 'info@goldmotors.zm';
  const address = [cfg.address, cfg.city, cfg.country].filter(Boolean).join(', ') || 'Plot 1234, Cairo Road, Lusaka, Zambia';

  // Parse business hours from config
  const hoursEntries = (() => {
    try {
      const h = typeof cfg.hours === 'string' ? JSON.parse(cfg.hours) : cfg.hours;
      if (h && typeof h === 'object') return Object.entries(h);
    } catch {}
    return [['Monday – Friday','08:00 – 17:00'],['Saturday','08:00 – 14:00'],['Sunday','Closed']];
  })();

  const [form, setForm]     = useState({ name:'', phone:'', email:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [toast, setToast]   = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.message) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' }); return;
    }
    setLoading(true);
    try {
      await api.submitMessage({
        name: form.name, email: form.email, phone: form.phone,
        subject: form.subject || 'General enquiry',
        message: form.message,
      });
      setForm({ name:'', phone:'', email:'', subject:'', message:'' });
      setSent(true);
    } catch {
      setToast({ message: 'Failed to send. Please check your connection and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div style={{ background: 'var(--black)', padding: '48px 0 40px' }}>
        <div className="container">
          <span className="section-label">Get in touch</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,44px)', color: '#fff', marginBottom: '10px' }}>Contact us</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px' }}>Our team is ready to help. Reach out through any of the channels below.</p>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>

          {/* Form */}
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '10px' }}>Message sent</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn btn-black" style={{ marginTop: '20px' }}>Send another</button>
              </div>
            ) : (
              <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>Send us a message</h2>
                <form onSubmit={handleSubmit}>
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
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="label">Subject</label>
                    <input className="input" placeholder="What is this about?" value={form.subject} onChange={set('subject')} />
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="label">Message *</label>
                    <textarea className="input textarea" placeholder="Tell us how we can help..." value={form.message} onChange={set('message')} style={{ minHeight: '130px' }} required />
                  </div>
                  <div style={{ background: 'var(--gold-muted)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Shield size={14} style={{ color: 'var(--gold-deep)', flexShrink: 0, marginTop: '1px' }} />
                    No online payments accepted. All transactions are handled through our financial office.
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Sending...' : <><Send size={15} /> Send message</>}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '16px' }}>Contact details</h3>

              {/* Address */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={16} style={{ color: 'var(--gold-deep)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Address</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{address}</p>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} style={{ color: 'var(--gold-deep)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Phone</p>
                  <a href={`tel:${phone.replace(/\s/g,'')}`} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none' }}>{phone}</a>
                </div>
              </div>

              {/* WhatsApp — only shown if set */}
              {whatsapp && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageCircle size={16} style={{ color: 'var(--gold-deep)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>WhatsApp</p>
                    <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none' }}>{whatsapp}</a>
                  </div>
                </div>
              )}

              {/* Email */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={16} style={{ color: 'var(--gold-deep)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Email</p>
                  <a href={`mailto:${email}`} style={{ fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none' }}>{email}</a>
                </div>
              </div>
            </div>

            {/* Business hours */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Clock size={16} style={{ color: 'var(--gold-deep)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>Business hours</h3>
              </div>
              {hoursEntries.map(([day, hrs]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{day}</span>
                  <span style={{ color: hrs === 'Closed' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 500 }}>{hrs}</span>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', height: '180px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              <MapPin size={28} style={{ color: 'var(--gold-deep)' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>{address}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}