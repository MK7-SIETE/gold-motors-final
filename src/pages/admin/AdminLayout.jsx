import { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, MessageSquare, BarChart2, LogOut, Menu, Bell, Star, Info, AlertTriangle, Zap, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import logo from '../../assets/logo.png';

const NAV = [
  { label:'Dashboard',  href:'/dealer/dashboard',   icon:LayoutDashboard },
  { label:'Cars',       href:'/dealer/cars',         icon:Car             },
  { label:'Messages',   href:'/dealer/messages',     icon:MessageSquare   },
  { label:'Notices',    href:'/dealer/notices',      icon:Bell            },
  { label:'Reviews',    href:'/dealer/testimonials', icon:Star            },
  { label:'Analytics',  href:'/dealer/analytics',    icon:BarChart2       },
];

const NOTICE_ICONS  = { info: Info, warning: AlertTriangle, action: Zap };
const NOTICE_COLORS = { info: '#60a5fa', warning: '#fbbf24', action: 'var(--gold)' };

export default function AdminLayout() {
  const { dealer, dealerLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen,    setBellOpen]    = useState(false);
  const [unread,      setUnread]      = useState(0);
  const [notices,     setNotices]     = useState([]);
  const bellRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  if (!dealer) return <Navigate to="/dealer/login" replace />;

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handler = e => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reload counts on every page change
  useEffect(() => {
    api.getDealerStats()
      .then(s => setUnread(s.unread_messages || 0))
      .catch(() => {});

    api.getDealerNotices()
      .then(data => setNotices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    await api.dealerLogout().catch(() => {});
    dealerLogout();
    navigate('/dealer/login');
  };

  const markRead = async (id) => {
    await api.markNoticeRead(id).catch(() => {});
    setNotices(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadNotices = notices.filter(n => !n.is_read);
  const totalAlerts   = unread + unreadNotices.length;

  const SidebarContent = () => (
    <>
      <div style={{ padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <img src={logo} alt="Mukuba Motors" style={{ height:'42px', objectFit:'contain', display:'block' }}/>
        <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'8px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Dealer admin panel</p>
      </div>
      <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
        {NAV.map(({ label, href, icon:Icon }) => {
          const active = location.pathname.startsWith(href);
          const badge  = label === 'Messages' ? unread
                       : label === 'Notices'  ? unreadNotices.length
                       : 0;
          return (
            <Link key={href} to={href} onClick={() => setSidebarOpen(false)}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'var(--radius-sm)', marginBottom:'2px', fontSize:'14px', fontWeight:500, textDecoration:'none', transition:'all 0.18s', color:active?'var(--gold)':'rgba(255,255,255,0.5)', background:active?'rgba(232,184,0,0.1)':'transparent' }}>
              <Icon size={17}/>{label}
              {badge > 0 && (
                <span style={{ marginLeft:'auto', background:'var(--gold)', color:'var(--black)', fontSize:'10px', fontWeight:700, borderRadius:'10px', padding:'1px 7px' }}>{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'var(--radius-sm)', width:'100%', fontSize:'14px', color:'rgba(255,255,255,0.35)', background:'transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', transition:'color 0.18s' }}
          onMouseEnter={e => e.currentTarget.style.color='#fca5a5'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
          <LogOut size={17}/> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--font-body)' }}>
      <aside style={{ width:'240px', background:'var(--black)', display:'flex', flexDirection:'column', flexShrink:0 }} className="admin-sidebar-desktop">
        <SidebarContent/>
      </aside>

      {sidebarOpen && (
        <>
          <aside style={{ position:'fixed', inset:0, width:'260px', background:'var(--black)', display:'flex', flexDirection:'column', zIndex:200 }}><SidebarContent/></aside>
          <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199 }}/>
        </>
      )}

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Top bar */}
        <div style={{ height:'56px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 20px', gap:'12px', position:'sticky', top:0, zIndex:90 }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{ display:'none', color:'var(--text-secondary)', background:'none', border:'none', cursor:'pointer' }} className="admin-hamburger-btn">
            <Menu size={22}/>
          </button>
          <p style={{ fontSize:'14px', fontWeight:500, color:'var(--text-primary)', flex:1 }}>
            {NAV.find(n => location.pathname.startsWith(n.href))?.label || 'Admin'}
          </p>

          {/* Bell dropdown */}
          <div ref={bellRef} style={{ position:'relative' }}>
            <button
              onClick={() => setBellOpen(o => !o)}
              style={{ position:'relative', width:'36px', height:'36px', borderRadius:'var(--radius-sm)', border:`1px solid ${bellOpen ? 'var(--gold)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', color: bellOpen ? 'var(--gold)' : 'var(--text-secondary)', background: bellOpen ? 'rgba(232,184,0,0.06)' : 'transparent', cursor:'pointer', transition:'all 0.15s' }}
            >
              <Bell size={16}/>
              {totalAlerts > 0 && (
                <span style={{ position:'absolute', top:'-4px', right:'-4px', minWidth:'16px', height:'16px', borderRadius:'10px', background:'var(--gold)', color:'var(--black)', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
                  {totalAlerts}
                </span>
              )}
            </button>

            {bellOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, width:320, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', zIndex:200, overflow:'hidden' }}>

                {/* Header */}
                <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Notifications</span>
                  {totalAlerts > 0 && (
                    <span style={{ fontSize:11, background:'var(--gold)', color:'var(--black)', borderRadius:10, padding:'1px 8px', fontWeight:700 }}>{totalAlerts}</span>
                  )}
                </div>

                {/* Unread messages */}
                {unread > 0 && (
                  <Link to="/dealer/messages" onClick={() => setBellOpen(false)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid var(--border)', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(129,140,248,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <MessageSquare size={14} style={{ color:'#818cf8' }}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{unread} unread message{unread !== 1 ? 's' : ''}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>Tap to view your inbox</div>
                    </div>
                    <ArrowRight size={13} style={{ color:'var(--text-muted)' }}/>
                  </Link>
                )}

                {/* Unread notices */}
                {unreadNotices.map(notice => {
                  const Icon  = NOTICE_ICONS[notice.type]  || Info;
                  const color = NOTICE_COLORS[notice.type] || '#60a5fa';
                  return (
                    <div key={notice.id} style={{ display:'flex', gap:10, padding:'13px 16px', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background: color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon size={14} style={{ color }}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{notice.title}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5, whiteSpace:'pre-line' }}>{notice.body}</div>
                      </div>
                      <button onClick={() => markRead(notice.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:2, flexShrink:0 }} title="Mark as read">
                        <X size={13}/>
                      </button>
                    </div>
                  );
                })}

                {/* Empty state */}
                {totalAlerts === 0 && (
                  <div style={{ padding:'28px 16px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
                    <Bell size={20} style={{ marginBottom:8, opacity:0.3 }}/>
                    <div>All caught up</div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
                  <Link to="/dealer/notices" onClick={() => setBellOpen(false)} style={{ fontSize:12, color:'var(--gold)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    All notices <ArrowRight size={11}/>
                  </Link>
                  <Link to="/dealer/messages" onClick={() => setBellOpen(false)} style={{ fontSize:12, color:'var(--text-muted)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    All messages <ArrowRight size={11}/>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--gold)', color:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, fontFamily:'var(--font-display)' }}>
            {dealer?.name?.[0] || 'G'}
          </div>
        </div>

        <main style={{ flex:1, padding:'24px', overflowY:'auto' }}><Outlet/></main>
      </div>

      <style>{`
        @media(max-width:768px){
          .admin-sidebar-desktop{display:none!important}
          .admin-hamburger-btn{display:flex!important}
        }
      `}</style>
    </div>
  );
}
