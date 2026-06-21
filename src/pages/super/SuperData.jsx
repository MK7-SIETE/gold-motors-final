import { useState, useEffect } from 'react';
import { Car, MessageSquare, Search, Trash2, Mail, Clock, X, Package } from 'lucide-react';
import { api } from '../../services/api';

const TAB_CARS = 'cars';
const TAB_MSGS = 'messages';

const MSG_TYPES = [
  { key: 'all',            label: 'All' },
  { key: 'car_enquiry',    label: 'Car enquiry' },
  { key: 'import_request', label: 'Import request' },
  { key: 'general',        label: 'General' },
];

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

const pillStyle = active => ({
  padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
  cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  background: active ? 'rgba(232,184,0,0.12)' : 'transparent',
  color: active ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
  outline: active ? '1px solid rgba(232,184,0,0.2)' : 'none',
});

const typePillStyle = active => ({
  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
  cursor: 'pointer', border: '1px solid', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  background: active ? 'rgba(232,184,0,0.1)' : 'transparent',
  color: active ? 'var(--gold)' : 'rgba(255,255,255,0.25)',
  borderColor: active ? 'rgba(232,184,0,0.25)' : 'rgba(255,255,255,0.08)',
});

function TypeBadge({ type }) {
  const map = {
    car_enquiry:    { label: 'Car enquiry',    color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)' },
    import_request: { label: 'Import request', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
    general:        { label: 'General',        color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
  };
  const s = map[type] ?? map.general;
  return (
    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`, flexShrink: 0 }}>
      {s.label}
    </span>
  );
}

export default function SuperData() {
  const [tab, setTab]               = useState(TAB_CARS);
  const [cars, setCars]             = useState([]);
  const [msgs, setMsgs]             = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [search, setSearch]         = useState('');
  const [msgType, setMsgType]       = useState('all');
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    setCarsLoading(true);
    api.getSuperCars()
      .then(data => setCars(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setCarsLoading(false));
  }, []);

  useEffect(() => {
    setMsgsLoading(true);
    api.getSuperMessages()
      .then(data => setMsgs(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setMsgsLoading(false));
  }, []);

  const filteredCars = cars.filter(c =>
    !search || `${c.make} ${c.model} ${c.year} ${c.user?.name ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMsgs = msgs.filter(m => {
    const matchType = msgType === 'all' || m.type === msgType;
    const matchSearch = !search ||
      `${m.name} ${m.email} ${m.subject ?? ''} ${m.car?.user?.name ?? ''}`.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const unread = msgs.filter(m => !m.is_read).length;

  const openMsg = async msg => {
    setSelected(msg);
    if (!msg.is_read) {
      await api.superMarkRead(msg.id).catch(() => {});
      setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      if (selected?.id === msg.id) setSelected(prev => ({ ...prev, is_read: true }));
    }
  };

  const delMsg = async id => {
    if (!window.confirm('Delete this message?')) return;
    await api.deleteMessage(id).catch(() => {});
    setMsgs(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const countForType = key => key === 'all' ? msgs.length : msgs.filter(m => m.type === key).length;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: '#fff', marginBottom: '4px' }}>Full data access</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>All cars and messages across every dealer.</p>
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '4px' }}>
          <button style={pillStyle(tab === TAB_CARS)} onClick={() => { setTab(TAB_CARS); setSelected(null); }}>
            <Car size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Cars ({cars.length})
          </button>
          <button style={pillStyle(tab === TAB_MSGS)} onClick={() => { setTab(TAB_MSGS); setSelected(null); }}>
            <MessageSquare size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Messages ({msgs.length}){unread > 0 && <span style={{ marginLeft: '6px', background: 'var(--gold)', color: '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: 700 }}>{unread}</span>}
          </button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === TAB_CARS ? 'Search make, model, dealer...' : 'Search name, email, dealer...'}
            style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Message type filter */}
      {tab === TAB_MSGS && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {MSG_TYPES.map(t => (
            <button key={t.key} style={typePillStyle(msgType === t.key)} onClick={() => { setMsgType(t.key); setSelected(null); }}>
              {t.label} ({countForType(t.key)})
            </button>
          ))}
        </div>
      )}

      {/* Cars tab */}
      {tab === TAB_CARS && (
        carsLoading ? <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Loading cars...</p> :
        filteredCars.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No cars found.</p> :
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredCars.map(car => (
            <div key={car.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              {car.images?.[0]?.url ? (
                <img src={car.images[0].url} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '56px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '2px' }}>{car.year} {car.make} {car.model}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  {car.price ? `K ${Number(car.price).toLocaleString()}` : 'No price'}
                  {' · '}
                  <span style={{ color: 'rgba(232,184,0,0.6)' }}>{car.user?.name ?? 'Unknown dealer'}</span>
                </p>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, flexShrink: 0, background: car.is_available ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)', color: car.is_available ? '#86efac' : 'rgba(255,255,255,0.3)', border: `1px solid ${car.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)'}` }}>
                {car.is_available ? 'Available' : 'Sold'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages tab — split layout */}
      {tab === TAB_MSGS && (
        msgsLoading ? <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Loading messages...</p> :
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.4fr' : '1fr', gap: '16px', alignItems: 'start' }}>

          {/* Message list */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            {filteredMsgs.length === 0
              ? <p style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No messages found.</p>
              : filteredMsgs.map(msg => (
                <div key={msg.id} onClick={() => openMsg(msg)}
                  style={{ display: 'flex', gap: '12px', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.15s',
                    background: selected?.id === msg.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderLeft: msg.is_read ? 'none' : '3px solid var(--gold)' }}
                  onMouseEnter={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = 'transparent'; }}>

                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700,
                    background: msg.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(232,184,0,0.12)',
                    color: msg.is_read ? 'rgba(255,255,255,0.3)' : 'var(--gold)',
                    border: `1px solid ${msg.is_read ? 'rgba(255,255,255,0.08)' : 'rgba(232,184,0,0.2)'}` }}>
                    {msg.name[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <p style={{ fontSize: '13px', fontWeight: msg.is_read ? 400 : 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10}/>{timeAgo(msg.created_at)}</span>
                        <button onClick={e => { e.stopPropagation(); delMsg(msg.id); }}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TypeBadge type={msg.type} />
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.subject}</p>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(232,184,0,0.5)', marginTop: '2px' }}>
                      {msg.car?.user?.name ?? (msg.car_id ? 'Unknown dealer' : 'No dealer')}
                    </p>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Message detail */}
          {selected && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#fff', marginBottom: '6px' }}>{selected.subject}</h2>
                  <TypeBadge type={selected.type} />
                </div>
                <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}><X size={18}/></button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(232,184,0,0.12)', border: '1px solid rgba(232,184,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                  {selected.name[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{selected.name}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>{selected.email} · {selected.phone}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11}/>{timeAgo(selected.created_at)}
                    {selected.car?.user?.name && (
                      <span style={{ marginLeft: '8px', color: 'rgba(232,184,0,0.5)' }}>· {selected.car.user.name}</span>
                    )}
                  </p>
                </div>
              </div>

              {selected.car_id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#93c5fd' }}>
                  <Car size={14}/> Re: vehicle listing #{selected.car_id}
                  {selected.car && <span style={{ color: 'rgba(255,255,255,0.3)' }}>— {selected.car.year} {selected.car.make} {selected.car.model}</span>}
                </div>
              )}

              {selected.type === 'import_request' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.15)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#c084fc' }}>
                  <Package size={14}/> Import request
                </div>
              )}

              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selected.message}</p>

              <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--gold)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <Mail size={14}/> Reply by email
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Call
                  </a>
                )}
                <button onClick={() => delMsg(selected.id)}
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(239,68,68,0.08)', color: '#f87171', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                  <Trash2 size={14}/> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}