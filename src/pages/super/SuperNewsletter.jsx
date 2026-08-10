import { useState, useEffect } from 'react';
import { Send, PlusCircle, Trash2, Eye, Car, Tag, FileText, Users, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';

const TYPE_LABELS = {
  custom:    { label: 'General Message', icon: FileText, color: '#6c757d' },
  new_car:   { label: 'New Car Arrival', icon: Car,      color: '#C5A45D' },
  promotion: { label: 'Promotion',       icon: Tag,      color: '#28a745' },
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '6px',
  border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
  fontFamily: 'inherit', outline: 'none',
};
const labelStyle = { display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#444' };
const btnStyle = (color = '#C5A45D', text = '#fff') => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '10px 20px', borderRadius: '6px', border: 'none',
  background: color, color: text, fontWeight: 600, fontSize: '14px',
  cursor: 'pointer', transition: 'opacity .15s',
});

export default function SuperNewsletter() {
  const [newsletters, setNewsletters]     = useState([]);
  const [subscribers, setSubscribers]     = useState({ total: 0, active: 0, list: [] });
  const [cars, setCars]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [toast, setToast]                 = useState(null);
  const [composing, setComposing]         = useState(false);
  const [previewId, setPreviewId]         = useState(null);
  const [sending, setSending]             = useState(null);
  const [showSubs, setShowSubs]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSend, setConfirmSend]     = useState(null);

  const [form, setForm] = useState({ subject: '', type: 'custom', body: '', car_id: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [nl, subs, carsData] = await Promise.all([
        api.getNewsletters(),
        api.getSubscribers(),
        api.getSuperCars(),
      ]);
      setNewsletters(nl.data || nl);
      setSubscribers({
        total: subs.total || 0,
        active: subs.active || 0,
        list: subs.subscribers || [],
      });
      setCars(carsData.data || carsData);
    } catch {
      showToast('Failed to load data', false);
    } finally {
      setLoading(false);
    }
  }

  function openCompose(newsletter = null) {
    if (newsletter) {
      setForm({
        subject: newsletter.subject,
        type:    newsletter.type,
        body:    newsletter.body || '',
        car_id:  newsletter.car_id || '',
      });
      setEditId(newsletter.id);
    } else {
      setForm({ subject: '', type: 'custom', body: '', car_id: '' });
      setEditId(null);
    }
    setComposing(true);
  }

  async function saveDraft() {
    if (!form.subject.trim()) { showToast('Subject is required', false); return; }
    setSaving(true);
    try {
      const payload = { ...form, car_id: form.car_id || null };
      if (editId) {
        await api.updateNewsletter(editId, payload);
        showToast('Draft updated');
      } else {
        await api.createNewsletter(payload);
        showToast('Draft saved');
      }
      setComposing(false);
      loadAll();
    } catch {
      showToast('Save failed', false);
    } finally {
      setSaving(false);
    }
  }

  async function sendNewsletter(id) {
    setSending(id);
    setConfirmSend(null);
    try {
      const res = await api.sendNewsletter(id);
      showToast(res.message || 'Sent!');
      loadAll();
    } catch (err) {
      showToast(err?.message || 'Send failed', false);
    } finally {
      setSending(null);
    }
  }

  async function deleteNewsletter(id) {
    setConfirmDelete(null);
    try {
      await api.deleteNewsletter(id);
      showToast('Draft deleted');
      loadAll();
    } catch {
      showToast('Delete failed', false);
    }
  }

  async function removeSubscriber(id) {
    try {
      await api.deleteSubscriber(id);
      showToast('Subscriber removed');
      loadAll();
    } catch {
      showToast('Failed to remove', false);
    }
  }

  const previewItem = newsletters.find(n => n.id === previewId);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading…</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.ok ? '#28a745' : '#dc3545',
          color: '#fff', padding: '12px 24px', borderRadius: 8,
          fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,.2)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Newsletter</h2>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Compose and send updates to your subscribers</p>
        </div>
        <button style={btnStyle()} onClick={() => openCompose()}>
          <PlusCircle size={16} /> New Newsletter
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Subscribers', value: subscribers.active, icon: Users,       color: '#C5A45D' },
          { label: 'Total Sent',          value: newsletters.filter(n => n.status === 'sent').length, icon: CheckCircle, color: '#28a745' },
          { label: 'Drafts',              value: newsletters.filter(n => n.status === 'draft').length, icon: Clock, color: '#6c757d' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: color + '18', borderRadius: 8, padding: 10 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscriber list toggle */}
      <div style={{ marginBottom: 24 }}>
        <button style={btnStyle('#f5f5f5', '#333')} onClick={() => setShowSubs(v => !v)}>
          <Users size={15} /> {showSubs ? 'Hide' : 'View'} Subscribers ({subscribers.active} active)
        </button>
        {showSubs && (
          <div style={{ marginTop: 12, background: '#fff', border: '1px solid #eee', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  {['Name', 'Email', 'Status', 'Subscribed', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers.list.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 16px' }}>{s.name || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>{s.email}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ background: s.is_active ? '#e8f5e9' : '#fce4ec', color: s.is_active ? '#2e7d32' : '#c62828', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {s.is_active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#888', fontSize: 13 }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button onClick={() => removeSubscriber(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {subscribers.list.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>No subscribers yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Newsletter list */}
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
        {newsletters.length === 0 ? 'No newsletters yet' : 'Newsletters'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {newsletters.map(nl => {
          const typeInfo = TYPE_LABELS[nl.type] || TYPE_LABELS.custom;
          const Icon = typeInfo.icon;
          const isSent = nl.status === 'sent';
          return (
            <div key={nl.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: typeInfo.color + '18', borderRadius: 8, padding: 10, flexShrink: 0 }}>
                <Icon size={18} color={typeInfo.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{nl.subject}</div>
                <div style={{ fontSize: 13, color: '#888', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span>{typeInfo.label}</span>
                  {nl.car && <span>🚗 {nl.car.year} {nl.car.make} {nl.car.model}</span>}
                  {isSent && <span>✅ Sent to {nl.recipients_count} · {new Date(nl.sent_at).toLocaleDateString()}</span>}
                  {!isSent && <span style={{ color: '#C5A45D' }}>📝 Draft</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button title="Preview" onClick={() => setPreviewId(nl.id)} style={{ ...btnStyle('#f5f5f5', '#333'), padding: '8px 12px' }}>
                  <Eye size={15} />
                </button>
                {!isSent && (
                  <>
                    <button title="Edit" onClick={() => openCompose(nl)} style={{ ...btnStyle('#f5f5f5', '#333'), padding: '8px 14px', fontSize: 13 }}>
                      Edit
                    </button>
                    <button title="Send" onClick={() => setConfirmSend(nl.id)} disabled={sending === nl.id} style={btnStyle()} >
                      {sending === nl.id ? 'Sending…' : <><Send size={14} /> Send</>}
                    </button>
                    <button title="Delete" onClick={() => setConfirmDelete(nl.id)} style={{ ...btnStyle('#fce4ec', '#c62828'), padding: '8px 12px' }}>
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose modal */}
      {composing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editId ? 'Edit Draft' : 'New Newsletter'}</h3>
              <button onClick={() => setComposing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Type */}
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {Object.entries(TYPE_LABELS).map(([key, { label, color }]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))} style={{
                      flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      border: `2px solid ${form.type === key ? color : '#eee'}`,
                      background: form.type === key ? color + '15' : '#fafafa',
                      color: form.type === key ? color : '#555',
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={labelStyle}>Subject *</label>
                <input style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. New 2024 Toyota Land Cruiser just arrived!" />
              </div>

              {/* Feature a car */}
              <div>
                <label style={labelStyle}>Feature a Car (optional)</label>
                <select style={inputStyle} value={form.car_id} onChange={e => setForm(f => ({ ...f, car_id: e.target.value }))}>
                  <option value="">— No car featured —</option>
                  {cars.map(c => (
                    <option key={c.id} value={c.id}>{c.year} {c.make} {c.model} {c.price ? `— ZMW ${Number(c.price).toLocaleString()}` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Body */}
              <div>
                <label style={labelStyle}>Message</label>
                <textarea style={{ ...inputStyle, minHeight: 160, resize: 'vertical' }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your message here…" />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
                <button style={btnStyle('#f5f5f5', '#333')} onClick={() => setComposing(false)}>Cancel</button>
                <button style={btnStyle()} onClick={saveDraft} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Preview</h3>
              <button onClick={() => setPreviewId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ background: '#C5A45D', borderRadius: '8px 8px 0 0', padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Mukuba Motors</div>
            </div>
            <div style={{ border: '1px solid #eee', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '24px 28px' }}>
              {previewItem.type === 'promotion' && <span style={{ background: '#C5A45D', color: '#fff', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🎉 Special Promotion</span>}
              {previewItem.type === 'new_car'   && <span style={{ background: '#C5A45D', color: '#fff', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🚗 New Arrival</span>}
              <div style={{ fontSize: 18, fontWeight: 700, color: '#C5A45D', margin: '16px 0 12px' }}>{previewItem.subject}</div>
              {previewItem.car && (
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
                  <strong>🚗 {previewItem.car.year} {previewItem.car.make} {previewItem.car.model}</strong>
                  {previewItem.car.price && <div style={{ color: '#C5A45D', fontWeight: 700 }}>ZMW {Number(previewItem.car.price).toLocaleString()}</div>}
                </div>
              )}
              {previewItem.body && <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{previewItem.body}</div>}
              <div style={{ background: '#C5A45D', color: '#fff', textAlign: 'center', padding: '12px', borderRadius: 6, marginTop: 20, fontWeight: 600 }}>View Our Full Inventory →</div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={btnStyle('#f5f5f5', '#333')} onClick={() => setPreviewId(null)}>Close</button>
              {previewItem.status !== 'sent' && (
                <button style={btnStyle()} onClick={() => { setPreviewId(null); setConfirmSend(previewItem.id); }}>
                  <Send size={14} /> Send Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 360, textAlign: 'center' }}>
            <AlertCircle size={36} color="#dc3545" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px' }}>Delete draft?</h3>
            <p style={{ color: '#888', marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={btnStyle('#f5f5f5', '#333')} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={btnStyle('#dc3545')} onClick={() => deleteNewsletter(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm send */}
      {confirmSend && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 380, textAlign: 'center' }}>
            <Send size={36} color="#C5A45D" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px' }}>Send newsletter?</h3>
            <p style={{ color: '#888', marginBottom: 24 }}>This will be sent to <strong>{subscribers.active} active subscribers</strong>. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={btnStyle('#f5f5f5', '#333')} onClick={() => setConfirmSend(null)}>Cancel</button>
              <button style={btnStyle()} onClick={() => sendNewsletter(confirmSend)}><Send size={14} /> Send</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
