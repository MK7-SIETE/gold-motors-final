import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function NewsletterSection() {
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [status, setStatus]     = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage]   = useState('');

  async function handleSubmit() {
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await api.subscribe({ email: email.trim(), name: name.trim() || undefined });
      setMessage(res.message || 'Subscribed successfully!');
      setStatus('success');
    } catch (err) {
      setMessage(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <section style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2200 100%)',
      padding: '72px 24px',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(184,134,11,.2)', border: '1px solid rgba(184,134,11,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Mail size={24} color="#b8860b" />
        </div>

        <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 700, color: '#fff' }}>
          Stay in the Loop
        </h2>
        <p style={{ margin: '0 0 36px', color: 'rgba(255,255,255,.65)', fontSize: 15, lineHeight: 1.6 }}>
          Get notified about new arrivals, exclusive deals, and promotions — straight to your inbox.
        </p>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(40,167,69,.12)', border: '1px solid rgba(40,167,69,.4)',
            borderRadius: 10, padding: '20px 28px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 12,
          }}>
            <CheckCircle size={22} color="#4caf50" />
            <span style={{ color: '#4caf50', fontWeight: 600 }}>{message}</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  padding: '14px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)',
                  background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: 15,
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    flex: 1, padding: '14px 18px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,.15)',
                    background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: 15, outline: 'none',
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading' || !email.trim()}
                  style={{
                    padding: '14px 22px', background: '#b8860b', color: '#fff', border: 'none',
                    borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, opacity: status === 'loading' ? .7 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {status === 'loading' ? 'Subscribing…' : <><ArrowRight size={16} /> Subscribe</>}
                </button>
              </div>
            </div>

            {status === 'error' && (
              <p style={{ color: '#ef5350', fontSize: 13, margin: 0 }}>{message}</p>
            )}

            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, margin: '12px 0 0' }}>
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
