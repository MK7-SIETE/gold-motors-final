import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, MessageSquare, TrendingUp, Eye, Plus, ArrowRight, Clock, Star, Bell, AlertTriangle, Info, Zap, X } from 'lucide-react';
import { api } from '../../services/api';

function formatPrice(n) { return 'K ' + Number(n).toLocaleString('en-ZM'); }
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m/60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h/24) + 'd ago';
}

const NOTICE_STYLES = {
  info: {
    bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.2)',
    icon: Info, iconColor: '#60a5fa', titleColor: '#93c5fd',
  },
  warning: {
    bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)',
    icon: AlertTriangle, iconColor: '#fbbf24', titleColor: '#fcd34d',
  },
  action: {
    bg: 'rgba(232,184,0,0.08)', border: 'rgba(232,184,0,0.25)',
    icon: Zap, iconColor: 'var(--gold)', titleColor: 'var(--gold)',
  },
};

function NoticeCard({ notice, onDismiss }) {
  const s = NOTICE_STYLES[notice.type] || NOTICE_STYLES.info;
  const Icon = s.icon;
  return (
    <div style={{ display:'flex', gap:14, padding:'14px 18px', background:s.bg, border:`1px solid ${s.border}`, borderRadius:10, alignItems:'flex-start' }}>
      <Icon size={16} style={{ color:s.iconColor, flexShrink:0, marginTop:2 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:s.titleColor, marginBottom:3 }}>{notice.title}</div>
        <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, whiteSpace:'pre-line' }}>{notice.body}</div>
        {notice.expires_at && (
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:5 }}>
            Expires {new Date(notice.expires_at).toLocaleDateString()}
          </div>
        )}
      </div>
      <button onClick={() => onDismiss(notice.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', flexShrink:0, padding:2, lineHeight:1 }}>
        <X size={14} />
      </button>
    </div>
  );
}

function StatCard({ icon:Icon, label, value, color='var(--gold)', link }) {
  return (
    <Link to={link||'#'} style={{ textDecoration:'none' }}>
      <div className="admin-stat-card">
        <div style={{ width:'42px', height:'42px', borderRadius:'var(--radius-md)', background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={20} style={{ color }}/>
        </div>
        <div>
          <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'4px' }}>{label}</p>
          <p style={{ fontSize:'26px', fontWeight:600, fontFamily:'var(--font-display)', color:'var(--text-primary)', lineHeight:1 }}>{value}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats,    setStats]    = useState({ total_cars:0, available_cars:0, featured_cars:0, unread_messages:0 });
  const [messages, setMessages] = useState([]);
  const [cars,     setCars]     = useState([]);
  const [notices,  setNotices]  = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gm-dismissed-notices') || '[]'); }
    catch { return []; }
  });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDealerStats(),
      api.getMessages(),
      api.getDealerCars(),
      api.getDealerNotices(),
    ]).then(([s, m, c, n]) => {
      setStats(s);
      const msgList = Array.isArray(m) ? m : m.data ?? [];
      const carList = Array.isArray(c) ? c : c.data ?? [];
      const noticeList = Array.isArray(n) ? n : [];
      setMessages(msgList.slice(0, 5));
      setCars(carList.slice(0, 5));
      setNotices(noticeList);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visibleNotices = notices.filter(n => !dismissed.includes(n.id));

  const dismissNotice = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    sessionStorage.setItem('gm-dismissed-notices', JSON.stringify(updated));
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', color:'var(--text-primary)', marginBottom:'4px' }}>Dashboard</h1>
          <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Welcome back. Here is your dealership overview.</p>
        </div>
        <Link to="/dealer/cars/new" className="btn btn-primary btn-sm"><Plus size={15}/> Add car</Link>
      </div>

      {/* Notices from super admin */}
      {visibleNotices.length > 0 && (
        <div style={{ marginBottom:24, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
            <Bell size={13} style={{ color:'var(--gold)' }} />
            <span style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', letterSpacing:'0.05em', textTransform:'uppercase' }}>
              Platform notices
            </span>
          </div>
          {visibleNotices.map(notice => (
            <NoticeCard key={notice.id} notice={notice} onDismiss={dismissNotice} />
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>Loading...</p>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'16px', marginBottom:'28px' }}>
            <StatCard icon={Car}           label="Total vehicles"  value={stats.total_cars}     link="/dealer/cars"     color="var(--black)"/>
            <StatCard icon={Eye}           label="Available"       value={stats.available_cars}  link="/dealer/cars"     color="var(--success)"/>
            <StatCard icon={Star}          label="Featured"        value={stats.featured_cars}   link="/dealer/cars"     color="var(--gold-deep)"/>
            <StatCard icon={MessageSquare} label="Unread messages" value={stats.unread_messages} link="/dealer/messages" color="var(--gold-deep)"/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px' }}>
            {/* Recent messages */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'18px' }}>Recent messages</h3>
                <Link to="/dealer/messages" style={{ fontSize:'12px', color:'var(--gold-deep)', display:'flex', alignItems:'center', gap:'4px' }}>View all <ArrowRight size={12}/></Link>
              </div>
              {messages.length === 0
                ? <p style={{ padding:'24px', color:'var(--text-muted)', fontSize:'14px', textAlign:'center' }}>No messages yet.</p>
                : messages.map(msg => (
                  <Link to="/dealer/messages" key={msg.id} style={{ display:'flex', gap:'12px', padding:'14px 20px', borderBottom:'1px solid var(--border)', textDecoration:'none', transition:'background 0.15s', ...(msg.is_read?{}:{borderLeft:'3px solid var(--gold)'}) }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:msg.is_read?'var(--bg-elevated)':'var(--gold-muted)', border:'1px solid '+(msg.is_read?'var(--border)':'var(--gold-border)'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:msg.is_read?'var(--text-muted)':'var(--gold-deep)', flexShrink:0 }}>{(msg.name||'?')[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
                        <p style={{ fontSize:'13px', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{msg.name}</p>
                        <p style={{ fontSize:'11px', color:'var(--text-muted)', flexShrink:0, display:'flex', alignItems:'center', gap:'3px' }}><Clock size={10}/>{timeAgo(msg.created_at)}</p>
                      </div>
                      <p style={{ fontSize:'12px', color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{msg.subject}</p>
                    </div>
                  </Link>
                ))
              }
            </div>

            {/* Current inventory */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'18px' }}>Current inventory</h3>
                <Link to="/dealer/cars" style={{ fontSize:'12px', color:'var(--gold-deep)', display:'flex', alignItems:'center', gap:'4px' }}>Manage <ArrowRight size={12}/></Link>
              </div>
              {cars.length === 0
                ? <p style={{ padding:'24px', color:'var(--text-muted)', fontSize:'14px', textAlign:'center' }}>No cars yet.</p>
                : cars.map(car => (
                  <Link to={'/dealer/cars/'+car.id} key={car.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 20px', borderBottom:'1px solid var(--border)', textDecoration:'none', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ width:'44px', height:'36px', borderRadius:'8px', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, overflow:'hidden', border:'1px solid var(--border)' }}>
                      {car.images?.[0]?.url ? <img src={car.images[0].url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : '🚗'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{car.make} {car.model}</p>
                      <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{car.year} · {formatPrice(car.price)}</p>
                    </div>
                    <span className={'badge '+(car.is_available?'badge-success':'badge-danger')}>{car.is_available?'Available':'Sold'}</span>
                  </Link>
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}
