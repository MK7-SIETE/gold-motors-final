import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

const StatusBadge = ({ status }) => {
  const map = {
    ok:      { color: '#86efac', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  icon: CheckCircle,    label: 'OK'       },
    healthy: { color: '#86efac', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  icon: CheckCircle,    label: 'Healthy'  },
    degraded:{ color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', icon: AlertTriangle,  label: 'Degraded' },
    error:   { color: '#fca5a5', bg: 'rgba(220,38,38,0.1)',  border: 'rgba(220,38,38,0.2)',  icon: XCircle,        label: 'Error'    },
  };
  const s = map[status] ?? map.ok;
  const Icon = s.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <Icon size={12} /> {s.label}
    </span>
  );
};

const Row = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#fff', fontFamily: mono ? 'monospace' : undefined }}>{value ?? '—'}</span>
  </div>
);

const formatBytes = bytes => {
  if (!bytes) return '—';
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(1)} KB`;
};

export default function SuperHealth() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = () => {
    setLoading(true); setError(null);
    api.getSystemHealth()
      .then(d => { setData(d); setLastRefresh(new Date()); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load health data.'); setLoading(false); });
  };

  useEffect(load, []);

  const diskPct = data?.storage?.used_pct ?? 0;

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: '#fff', marginBottom: '4px' }}>System health</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            {lastRefresh ? `Last refreshed ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {error && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fca5a5', marginBottom: '20px' }}>{error}</div>}

      {loading && !data && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Checking systems...</p>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Overall status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <StatusBadge status={data.status} />
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>Overall platform status</span>
          </div>

          {/* Services */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px 20px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Services</p>
            {Object.entries(data.services ?? {}).map(([name, svc]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#fff', textTransform: 'capitalize' }}>{name}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginLeft: '8px' }}>({svc.driver})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {svc.latency_ms && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{svc.latency_ms}ms</span>}
                  <StatusBadge status={svc.status} />
                </div>
              </div>
            ))}
          </div>

          {/* Storage */}
          {data.storage?.total_bytes && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Storage</p>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
                  <span>{formatBytes(data.storage.used_bytes)} used</span>
                  <span>{diskPct}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${diskPct}%`, background: diskPct > 85 ? '#ef4444' : diskPct > 70 ? '#f59e0b' : 'var(--gold)', borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
              </div>
              <Row label="Total"     value={formatBytes(data.storage.total_bytes)} />
              <Row label="Used"      value={formatBytes(data.storage.used_bytes)} />
              <Row label="Free"      value={formatBytes(data.storage.free_bytes)} />
            </div>
          )}

          {/* Runtime */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px 20px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Runtime</p>
            <Row label="PHP version"     value={data.runtime?.php_version}     mono />
            <Row label="Laravel version" value={data.runtime?.laravel_version} mono />
            <Row label="Environment"     value={data.runtime?.environment}     mono />
            <Row label="Debug mode"      value={data.runtime?.debug_mode ? 'ON ⚠️' : 'Off'} />
            <Row label="Server uptime"   value={data.runtime?.uptime} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}