import { useState, useEffect } from 'react';
import { Trash2, Mail, Clock, Car, X } from 'lucide-react';
import { api } from '../../services/api';
import Toast from '../../components/Toast';

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h/24) + 'd ago';
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = () => api.getMessages().then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const unread = messages.filter(m => !m.is_read).length;

  const open = async msg => {
    setSelected(msg);
    if (!msg.is_read) {
      await api.markRead(msg.id).catch(() => {});
      setMessages(prev => prev.map(m => m.id === msg.id ? {...m, is_read:true} : m));
    }
  };

  const del = async id => {
    if (!window.confirm('Delete this message?')) return;
    await api.deleteMessage(id).catch(() => {});
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setToast({ message:'Message deleted.', type:'success' });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)}/>}
      <div style={{ marginBottom:'20px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', color:'var(--text-primary)', marginBottom:'4px' }}>Messages</h1>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>{messages.length} total · {unread} unread</p>
      </div>
      {loading ? <p style={{ color:'var(--text-muted)' }}>Loading...</p> : (
        <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 1.4fr':'1fr', gap:'16px', alignItems:'start' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            {messages.length===0 && <p style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)' }}>No messages yet.</p>}
            {messages.map(msg => (
              <div key={msg.id} onClick={() => open(msg)} style={{ display:'flex', gap:'12px', padding:'14px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 0.15s', background:selected?.id===msg.id?'var(--bg-elevated)':'transparent', borderLeft:msg.is_read?'none':'3px solid var(--gold)' }}
                onMouseEnter={e=>{if(selected?.id!==msg.id)e.currentTarget.style.background='var(--bg-elevated)';}} onMouseLeave={e=>{if(selected?.id!==msg.id)e.currentTarget.style.background='transparent';}}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:msg.is_read?'var(--bg-elevated)':'var(--gold-muted)', border:'1px solid '+(msg.is_read?'var(--border)':'var(--gold-border)'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:msg.is_read?'var(--text-muted)':'var(--gold-deep)', flexShrink:0 }}>{msg.name[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'space-between' }}>
                    <p style={{ fontSize:'13px', fontWeight:msg.is_read?400:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{msg.name}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                      <span style={{ fontSize:'11px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'3px' }}><Clock size={10}/>{timeAgo(msg.created_at)}</span>
                      <button onClick={e=>{e.stopPropagation();del(msg.id);}} className="admin-action-btn danger" style={{ width:'24px', height:'24px', borderRadius:'4px' }}><Trash2 size={12}/></button>
                    </div>
                  </div>
                  <p style={{ fontSize:'12px', color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{msg.subject}</p>
                </div>
              </div>
            ))}
          </div>
          {selected && (
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px' }}>{selected.subject}</h2>
                <button onClick={() => setSelected(null)} style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }}><X size={18}/></button>
              </div>
              <div style={{ display:'flex', gap:'12px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'var(--gold-muted)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color:'var(--gold-deep)', flexShrink:0 }}>{selected.name[0]}</div>
                <div>
                  <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'2px' }}>{selected.name}</p>
                  <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>{selected.email} · {selected.phone}</p>
                  <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px', display:'flex', alignItems:'center', gap:'4px' }}><Clock size={11}/>{timeAgo(selected.created_at)}</p>
                </div>
              </div>
              {selected.car_id && <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', background:'var(--gold-muted)', border:'1px solid var(--gold-border)', borderRadius:'var(--radius-md)', marginBottom:'16px', fontSize:'13px', color:'var(--gold-deep)' }}><Car size={14}/> Re: vehicle listing #{selected.car_id}</div>}
              <p style={{ fontSize:'15px', color:'var(--text-primary)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{selected.message}</p>
              <div style={{ marginTop:'20px', display:'flex', gap:'8px' }}>
                <a href={'mailto:'+selected.email+'?subject=Re: '+selected.subject} className="btn btn-black btn-sm"><Mail size={14}/> Reply by email</a>
                <a href={'tel:'+selected.phone} className="btn btn-ghost btn-sm">Call</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
