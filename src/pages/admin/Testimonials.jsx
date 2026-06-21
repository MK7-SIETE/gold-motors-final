import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Star, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import Toast from '../../components/Toast';

function Stars({ rating }) {
  return (
    <span style={{ color: 'var(--gold)', fontSize: '13px' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} style={{ fill: i <= rating ? 'var(--gold)' : 'none', display: 'inline' }} />
      ))}
    </span>
  );
}

const STATUS_STYLES = {
  pending:  { bg: 'var(--bg-elevated)', color: 'var(--text-muted)',    border: 'var(--border)',       label: 'Pending'  },
  approved: { bg: '#f0fdf4',            color: '#16a34a',              border: '#bbf7d0',             label: 'Approved' },
  rejected: { bg: '#fef2f2',            color: '#dc2626',              border: '#fecaca',             label: 'Rejected' },
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all'); // all | pending | approved | rejected
  const [toast, setToast]               = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.getDealerTestimonials()
      .then(data => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load testimonials.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.updateTestimonialStatus(id, status);
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      showToast(`Review ${status}.`);
    } catch {
      showToast('Action failed. Please try again.', 'error');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      showToast('Review deleted.');
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  const filtered = filter === 'all' ? testimonials : testimonials.filter(t => t.status === filter);

  const counts = {
    all:      testimonials.length,
    pending:  testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    rejected: testimonials.filter(t => t.status === 'rejected').length,
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '4px' }}>Customer Reviews</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Approve reviews to show them publicly on the homepage.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              border: '1px solid ' + (filter === f ? 'var(--gold)' : 'var(--border)'),
              background: filter === f ? 'var(--gold-muted)' : 'var(--bg-card)',
              color: filter === f ? 'var(--gold-deep)' : 'var(--text-secondary)',
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading reviews...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          <AlertCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '14px' }}>No {filter === 'all' ? '' : filter + ' '}reviews yet.</p>
          {filter === 'pending' && <p style={{ fontSize: '13px', marginTop: '6px' }}>New reviews submitted by customers will appear here.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(t => {
            const style = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
            return (
              <div key={t.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                {/* Status indicator */}
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.color, flexShrink: 0, marginTop: '6px' }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{t.name}</span>
                    <Stars rating={t.rating} />
                    {t.car_bought && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        {t.car_bought}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: style.bg, color: style.color, border: '1px solid ' + style.border, fontWeight: 500 }}>
                      {style.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>"{t.message}"</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />
                    {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {t.status !== 'approved' && (
                    <button onClick={() => updateStatus(t.id, 'approved')}
                      title="Approve"
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                      <CheckCircle size={15} />
                    </button>
                  )}
                  {t.status !== 'rejected' && (
                    <button onClick={() => updateStatus(t.id, 'rejected')}
                      title="Reject"
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                      <XCircle size={15} />
                    </button>
                  )}
                  <button onClick={() => remove(t.id)}
                    title="Delete"
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}