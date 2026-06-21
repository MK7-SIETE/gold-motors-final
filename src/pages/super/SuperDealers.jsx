import { useState, useEffect } from 'react';
import { Plus, ToggleLeft, ToggleRight, Trash2, X, AlertCircle, CheckCircle, Bell, Info, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../../services/api';

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
  color: '#fff', fontSize: '14px', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)',
  marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
};
const btnStyle = (bg = 'var(--gold)', color = '#000') => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 16px', background: bg, border: 'none',
  borderRadius: '8px', color, fontWeight: 600, fontSize: '13px',
  cursor: 'pointer', fontFamily: 'var(--font-body)',
});

const NOTICE_TYPE_STYLES = {
  info:    { icon: Info,          color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  label: 'Info'    },
  warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', label: 'Warning' },
  action:  { icon: Zap,           color: 'var(--gold)', bg: 'rgba(232,184,0,0.08)', border: 'rgba(232,184,0,0.25)', label: 'Action'  },
};

export default function SuperDealers() {
  const [tab, setTab] = useState('dealers'); // 'dealers' | 'notices'

  // ── Dealers state ──────────────────────────────────────────────
  const [dealers,       setDealers]       = useState([]);
  const [dealersLoad,   setDealersLoad]   = useState(true);
  const [showCreate,    setShowCreate]    = useState(false);
  const [form,          setForm]          = useState({ name: '', email: '', password: '' });
  const [creating,      setCreating]      = useState(false);
  const [formError,     setFormError]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Notices state ──────────────────────────────────────────────
  const [notices,      setNotices]      = useState([]);
  const [noticesLoad,  setNoticesLoad]  = useState(true);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm,   setNoticeForm]   = useState({ title: '', body: '', type: 'info', expires_at: '' });
  const [savingNotice, setSavingNotice] = useState(false);
  const [noticeFormError, setNoticeFormError] = useState(null);

  // ── Shared ─────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load dealers ───────────────────────────────────────────────
  const loadDealers = () => {
    setDealersLoad(true);
    api.getSuperDealers()
      .then(data => setDealers(Array.isArray(data) ? data : data.data ?? []))
      .catch(err  => showToast(err?.message || 'Failed to load dealers', 'error'))
      .finally(() => setDealersLoad(false));
  };

  // ── Load notices ───────────────────────────────────────────────
  const loadNotices = () => {
    setNoticesLoad(true);
    api.getSuperNotices()
      .then(data => setNotices(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load notices', 'error'))
      .finally(() => setNoticesLoad(false));
  };

  useEffect(() => { loadDealers(); loadNotices(); }, []);

  // ── Dealer actions ─────────────────────────────────────────────
  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true); setFormError(null);
    try {
      await api.createDealer(form);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      loadDealers();
      showToast('Dealer account created.');
    } catch (err) {
      setFormError(err.errors ? Object.values(err.errors).flat().join(' ') : err.message || 'Failed to create dealer.');
      setCreating(false);
    }
  };

  const handleSuspend = async id => {
    try {
      const res = await api.suspendDealer(id);
      setDealers(ds => ds.map(d => d.id === id ? { ...d, is_active: res.is_active } : d));
      showToast(res.message);
    } catch { showToast('Action failed.', 'error'); }
  };

  const handleDelete = async id => {
    try {
      await api.deleteDealer(id);
      setDealers(ds => ds.filter(d => d.id !== id));
      setConfirmDelete(null);
      showToast('Dealer deleted.');
    } catch { showToast('Delete failed.', 'error'); }
  };

  // ── Notice actions ─────────────────────────────────────────────
  const handleCreateNotice = async e => {
    e.preventDefault();
    setSavingNotice(true); setNoticeFormError(null);
    try {
      const payload = { ...noticeForm, expires_at: noticeForm.expires_at || null };
      await api.createNotice(payload);
      setShowNoticeForm(false);
      setNoticeForm({ title: '', body: '', type: 'info', expires_at: '' });
      loadNotices();
      showToast('Notice sent to all dealers.');
    } catch (err) {
      setNoticeFormError(err.errors ? Object.values(err.errors).flat().join(' ') : err.message || 'Failed to create notice.');
      setSavingNotice(false);
    }
  };

  const handleToggleNotice = async id => {
    try {
      const res = await api.toggleNotice(id);
      setNotices(ns => ns.map(n => n.id === id ? { ...n, is_active: res.is_active } : n));
      showToast(res.message);
    } catch { showToast('Failed to update notice.', 'error'); }
  };

  const handleDeleteNotice = async id => {
    try {
      await api.deleteNotice(id);
      setNotices(ns => ns.filter(n => n.id !== id));
      showToast('Notice deleted.');
    } catch { showToast('Failed to delete notice.', 'error'); }
  };

  // ── Tab pill style ─────────────────────────────────────────────
  const tabStyle = active => ({
    padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
    background: active ? 'rgba(232,184,0,0.12)' : 'transparent',
    color: active ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
    outline: active ? '1px solid rgba(232,184,0,0.2)' : 'none',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ maxWidth: 840 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:24, zIndex:9999, display:'flex', alignItems:'center', gap:8, padding:'12px 18px', borderRadius:10, fontSize:13, fontWeight:500, backdropFilter:'blur(8px)', background: toast.type === 'error' ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.12)', border:`1px solid ${toast.type === 'error' ? 'rgba(220,38,38,0.25)' : 'rgba(34,197,94,0.2)'}`, color: toast.type === 'error' ? '#fca5a5' : '#86efac' }}>
          {toast.type === 'error' ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:24, color:'#fff', marginBottom:4 }}>
            {tab === 'dealers' ? 'Dealer accounts' : 'Platform notices'}
          </h1>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>
            {tab === 'dealers'
              ? `${dealers.length} dealer${dealers.length !== 1 ? 's' : ''} registered`
              : "Notices appear on every dealer's dashboard"}
          </p>
        </div>
        {tab === 'dealers'
          ? <button style={btnStyle()} onClick={() => setShowCreate(true)}><Plus size={15}/> New dealer</button>
          : <button style={btnStyle()} onClick={() => setShowNoticeForm(true)}><Bell size={15}/> Send notice</button>
        }
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:24, padding:4, width:'fit-content', marginBottom:24 }}>
        <button style={tabStyle(tab === 'dealers')} onClick={() => setTab('dealers')}>Dealers ({dealers.length})</button>
        <button style={tabStyle(tab === 'notices')} onClick={() => setTab('notices')}>
          Notices {notices.filter(n => n.is_active).length > 0 && `(${notices.filter(n => n.is_active).length} active)`}
        </button>
      </div>

      {/* ── DEALERS TAB ─────────────────────────────────────────── */}
      {tab === 'dealers' && (
        <>
          {/* Create dealer modal */}
          {showCreate && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
              <div style={{ background:'#0e0e0c', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:28, width:'100%', maxWidth:400 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <h2 style={{ color:'#fff', fontSize:16, fontFamily:'var(--font-display)' }}>Create dealer account</h2>
                  <button onClick={() => setShowCreate(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}><X size={18}/></button>
                </div>
                {formError && <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fca5a5', marginBottom:16 }}>{formError}</div>}
                <form onSubmit={handleCreate}>
                  {[['Full name','text','name'],['Email','email','email'],['Password','password','password']].map(([label, type, key]) => (
                    <div key={key} style={{ marginBottom:14 }}>
                      <label style={labelStyle}>{label}</label>
                      <input style={inputStyle} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required minLength={key === 'password' ? 8 : undefined} />
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:10, marginTop:20 }}>
                    <button type="button" onClick={() => setShowCreate(false)} style={{ flex:1, padding:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13 }}>Cancel</button>
                    <button type="submit" disabled={creating} style={{ flex:1, padding:10, background:'var(--gold)', border:'none', borderRadius:8, color:'#000', fontWeight:600, cursor: creating?'not-allowed':'pointer', fontFamily:'var(--font-body)', fontSize:13, opacity: creating?0.7:1 }}>{creating ? 'Creating...' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Confirm delete modal */}
          {confirmDelete !== null && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
              <div style={{ background:'#0e0e0c', border:'1px solid rgba(220,38,38,0.2)', borderRadius:14, padding:28, width:'100%', maxWidth:360, textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'rgba(220,38,38,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Trash2 size={20} style={{ color:'#ef4444' }}/>
                </div>
                <h2 style={{ color:'#fff', fontSize:16, marginBottom:8 }}>Delete dealer?</h2>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginBottom:24 }}>This permanently deletes the account and all associated data. Cannot be undone.</p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setConfirmDelete(null)} style={{ flex:1, padding:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13 }}>Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete)} style={{ flex:1, padding:10, background:'#ef4444', border:'none', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13 }}>Delete</button>
                </div>
              </div>
            </div>
          )}

          {dealersLoad
            ? <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>Loading dealers...</p>
            : dealers.length === 0
            ? <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(255,255,255,0.2)', fontSize:14 }}>No dealer accounts yet.</div>
            : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {dealers.map(dealer => (
                  <div key={dealer.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(232,184,0,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--gold)', flexShrink:0 }}>
                      {dealer.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:500, color:'#fff', marginBottom:2 }}>{dealer.name}</p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dealer.email}</p>
                    </div>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:'0.04em', background: dealer.is_active?'rgba(34,197,94,0.1)':'rgba(220,38,38,0.1)', color: dealer.is_active?'#86efac':'#fca5a5', border:`1px solid ${dealer.is_active?'rgba(34,197,94,0.2)':'rgba(220,38,38,0.2)'}`, flexShrink:0 }}>
                      {dealer.is_active ? 'Active' : 'Suspended'}
                    </span>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>{new Date(dealer.created_at).toLocaleDateString()}</p>
                    <button onClick={() => handleSuspend(dealer.id)} title={dealer.is_active?'Suspend':'Activate'} style={{ background:'none', border:'none', cursor:'pointer', color: dealer.is_active?'#f59e0b':'#86efac', flexShrink:0, padding:4 }}>
                      {dealer.is_active ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                    </button>
                    <button onClick={() => setConfirmDelete(dealer.id)} title="Delete" style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(220,38,38,0.5)', flexShrink:0, padding:4 }}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </>
      )}

      {/* ── NOTICES TAB ─────────────────────────────────────────── */}
      {tab === 'notices' && (
        <>
          {/* Create notice modal */}
          {showNoticeForm && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
              <div style={{ background:'#0e0e0c', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:28, width:'100%', maxWidth:460 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <h2 style={{ color:'#fff', fontSize:16, fontFamily:'var(--font-display)' }}>Send notice to all dealers</h2>
                  <button onClick={() => setShowNoticeForm(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}><X size={18}/></button>
                </div>
                {noticeFormError && <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fca5a5', marginBottom:16 }}>{noticeFormError}</div>}
                <form onSubmit={handleCreateNotice}>
                  {/* Type selector */}
                  <div style={{ marginBottom:16 }}>
                    <label style={labelStyle}>Type</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {Object.entries(NOTICE_TYPE_STYLES).map(([key, { label, color }]) => (
                        <button key={key} type="button" onClick={() => setNoticeForm(f => ({ ...f, type: key }))} style={{ flex:1, padding:'9px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, border:`2px solid ${noticeForm.type === key ? color : 'rgba(255,255,255,0.08)'}`, background: noticeForm.type === key ? color+'15' : 'transparent', color: noticeForm.type === key ? color : 'rgba(255,255,255,0.35)', fontFamily:'var(--font-body)', transition:'all 0.15s' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={labelStyle}>Title *</label>
                    <input style={inputStyle} value={noticeForm.title} onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. System maintenance this weekend" />
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={labelStyle}>Message *</label>
                    <textarea style={{ ...inputStyle, minHeight:100, resize:'vertical' }} value={noticeForm.body} onChange={e => setNoticeForm(f => ({ ...f, body: e.target.value }))} required placeholder="What do dealers need to know?" />
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <label style={labelStyle}>Expires on (optional)</label>
                    <input type="date" style={inputStyle} value={noticeForm.expires_at} onChange={e => setNoticeForm(f => ({ ...f, expires_at: e.target.value }))} />
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button type="button" onClick={() => setShowNoticeForm(false)} style={{ flex:1, padding:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13 }}>Cancel</button>
                    <button type="submit" disabled={savingNotice} style={{ flex:1, padding:10, background:'var(--gold)', border:'none', borderRadius:8, color:'#000', fontWeight:600, cursor: savingNotice?'not-allowed':'pointer', fontFamily:'var(--font-body)', fontSize:13, opacity: savingNotice?0.7:1 }}>
                      {savingNotice ? 'Sending...' : 'Send to all dealers'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {noticesLoad
            ? <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>Loading notices...</p>
            : notices.length === 0
            ? (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <Bell size={32} style={{ color:'rgba(255,255,255,0.1)', marginBottom:12 }} />
                <p style={{ color:'rgba(255,255,255,0.2)', fontSize:14 }}>No notices sent yet.</p>
                <p style={{ color:'rgba(255,255,255,0.12)', fontSize:13 }}>Send a notice to communicate with all dealers at once.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {notices.map(notice => {
                  const s = NOTICE_TYPE_STYLES[notice.type] || NOTICE_TYPE_STYLES.info;
                  const Icon = s.icon;
                  return (
                    <div key={notice.id} style={{ display:'flex', gap:14, padding:'16px 18px', background: notice.is_active ? s.bg : 'rgba(255,255,255,0.02)', border:`1px solid ${notice.is_active ? s.border : 'rgba(255,255,255,0.06)'}`, borderRadius:10, alignItems:'flex-start', opacity: notice.is_active ? 1 : 0.5 }}>
                      <Icon size={16} style={{ color: notice.is_active ? s.color : 'rgba(255,255,255,0.2)', flexShrink:0, marginTop:2 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:700, color: notice.is_active ? s.color : 'rgba(255,255,255,0.3)' }}>{notice.title}</span>
                          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background: notice.is_active ? s.bg : 'rgba(255,255,255,0.04)', color: notice.is_active ? s.color : 'rgba(255,255,255,0.2)', border:`1px solid ${notice.is_active ? s.border : 'rgba(255,255,255,0.06)'}` }}>
                            {notice.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>{notice.body}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:6 }}>
                          Created {new Date(notice.created_at).toLocaleDateString()}
                          {notice.expires_at && ` · Expires ${new Date(notice.expires_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button onClick={() => handleToggleNotice(notice.id)} title={notice.is_active?'Deactivate':'Activate'} style={{ background:'none', border:'none', cursor:'pointer', color: notice.is_active?'#f59e0b':'#86efac', padding:4 }}>
                          {notice.is_active ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                        </button>
                        <button onClick={() => handleDeleteNotice(notice.id)} title="Delete" style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(220,38,38,0.5)', padding:4 }}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </>
      )}
    </div>
  );
}
