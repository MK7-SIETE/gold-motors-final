import { useState, useEffect } from 'react';
import { RefreshCw, LogIn, LogOut, AlertTriangle, Shield, UserX } from 'lucide-react';
import { api } from '../../services/api';

const EVENT_META = {
  login_success: { icon: LogIn,       color: '#86efac', bg: 'rgba(34,197,94,0.1)',  label: 'Login'       },
  login_fail:    { icon: AlertTriangle,color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',label: 'Failed login' },
  logout:        { icon: LogOut,       color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)', label: 'Logout' },
  impersonate:   { icon: UserX,        color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',label: 'Impersonate'  },
  password_change:{ icon: Shield,      color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',label: 'Password changed' },
};

const EventIcon = ({ type }) => {
  const m = EVENT_META[type] ?? EVENT_META.login_success;
  const Icon = m.icon;
  return (
    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={13} style={{ color: m.color }} />
    </div>
  );
};

export default function SuperSecurity() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('');

  const load = () => {
    setLoading(true); setError(null);
    api.getSecurityLog()
      .then(data => {
        const items = Array.isArray(data) ? data : data.data ?? [];
        setLogs(items);
        setLoading(false);
      })
      .catch(err => { setError(err.message || 'Failed to load security log.'); setLoading(false); });
  };

  useEffect(load, []);

  const filtered = filter ? logs.filter(l => l.event_type === filter) : logs;

  const filterBtn = (type, label) => (
    <button
      onClick={() => setFilter(f => f === type ? '' : type)}
      style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)', background: filter === type ? 'rgba(232,184,0,0.12)' : 'rgba(255,255,255,0.04)', color: filter === type ? 'var(--gold)' : 'rgba(255,255,255,0.35)', outline: filter === type ? '1px solid rgba(232,184,0,0.2)' : 'none' }}
    >{label}</button>
  );

  const formatTime = iso => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: '#fff', marginBottom: '4px' }}>Security log</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{logs.length} events recorded</p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filterBtn('login_success', 'Logins')}
        {filterBtn('login_fail',    'Failed')}
        {filterBtn('logout',        'Logouts')}
        {filterBtn('impersonate',   'Impersonate')}
      </div>

      {error && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fca5a5', marginBottom: '16px' }}>{error}</div>}

      {loading && !logs.length && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Loading security log...</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
          No events{filter ? ' matching this filter' : ''} yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.map(log => {
          const meta = EVENT_META[log.event_type];
          return (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <EventIcon type={log.event_type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: meta?.color ?? '#fff' }}>{meta?.label ?? log.event_type}</span>
                  {log.user && (
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      — {log.user.name ?? log.user.email}
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginLeft: '5px' }}>({log.user.role})</span>
                    </span>
                  )}
                  {log.meta?.email && !log.user && (
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>— {log.meta.email}</span>
                  )}
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.ip_address ?? 'Unknown IP'}
                  {log.user_agent ? ` · ${log.user_agent.slice(0, 60)}...` : ''}
                </p>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0, textAlign: 'right' }}>
                {formatTime(log.created_at)}
              </p>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}