import { Outlet, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Shield, LayoutDashboard, Users, Database, Settings, Activity, Lock, Image, Mail, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const NAV = [
  { to: '',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: 'dealers',      icon: Users,           label: 'Dealers'      },
  { to: 'data',         icon: Database,        label: 'Data access'  },
  { to: 'hero-images',  icon: Image,           label: 'Hero images'  },
  { to: 'newsletter',   icon: Mail,            label: 'Newsletter'   },
  { to: 'profile',      icon: Settings,        label: 'Profile'      },
  { to: 'health',       icon: Activity,        label: 'System health'},
  { to: 'security',     icon: Lock,            label: 'Security log' },
  { to: 'reviews', icon: Star, label: 'Reviews' },
];

const BASE = '/gm-x9k2-control/panel';

export default function SuperLayout() {
  const { superAdmin, superLogout } = useAuth();
  const navigate = useNavigate();
  if (!superAdmin) return <Navigate to="/gm-x9k2-control" replace />;

  const handleLogout = async () => {
    await api.superLogout().catch(() => {});
    superLogout();
    navigate('/gm-x9k2-control');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050504', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px', flexShrink: 0 }}>
        <Shield size={15} style={{ color: 'var(--gold)' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', flex: 1, letterSpacing: '0.04em' }}>PLATFORM ADMIN</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>{superAdmin.email}</span>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', marginLeft: '12px' }}>
          <LogOut size={13} /> Exit
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <nav style={{ width: '200px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '16px 10px' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={label}
              to={to ? `${BASE}/${to}` : BASE}
              end={!to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
                background: isActive ? 'rgba(232,184,0,0.07)' : 'transparent',
                textDecoration: 'none', marginBottom: '2px', transition: 'all 0.15s',
              })}
            >
              <Icon size={15} />{label}
            </NavLink>
          ))}
        </nav>
        <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}