import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, MessageSquare, Users, Clock, Mail, ArrowRight,
  TrendingUp, Shield, Activity, ChevronRight, Send,
  AlertCircle, CheckCircle, Eye
} from 'lucide-react';
import { api } from '../../services/api';

const BASE = '/gm-x9k2-control/panel';

// ── Clickable stat card ───────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, loading, to, sub }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '20px',
        cursor: to ? 'pointer' : 'default',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (to) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.055)';
          e.currentTarget.style.borderColor = color + '40';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Glow accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80, borderRadius: '50%',
        background: color + '10',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: color + '15',
          border: '1px solid ' + color + '25',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color }} />
        </div>
        {to && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)', marginTop: 2 }} />}
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 6 }}>
        {loading ? <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.15)' }}>—</span> : (value ?? '—')}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>{label}</div>
      {sub && !loading && (
        <div style={{ fontSize: 11, color: color, marginTop: 4, opacity: 0.8 }}>{sub}</div>
      )}
    </div>
  );
}

// ── Quick action button ───────────────────────────────────────
function QuickAction({ label, icon: Icon, color, to, desc }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = color + '35';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: color + '15', border: '1px solid ' + color + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{desc}</div>
      </div>
      <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────
function SectionHead({ title, linkLabel, to }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
        {title}
      </h3>
      {to && (
        <button onClick={() => navigate(to)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {linkLabel} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────
export default function SuperDash() {
  const navigate = useNavigate();
  const [stats,       setStats]       = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [dealers,     setDealers]     = useState([]);
  const [subscribers, setSubscribers] = useState(null);
  const [newsletters, setNewsletters] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [s, m, d, subs, nl] = await Promise.all([
          api.getSuperStats(),
          api.getSuperMessages().catch(() => []),
          api.getSuperDealers().catch(() => []),
          api.getSubscribers().catch(() => ({ active: 0, total: 0 })),
          api.getNewsletters().catch(() => []),
        ]);
        setStats(s);
        // Show only last 4 unread messages
        const msgList = Array.isArray(m) ? m : (m?.data || []);
        setMessages(msgList.filter(msg => !msg.read_at).slice(0, 4));
        setDealers(Array.isArray(d) ? d.slice(0, 4) : []);
        setSubscribers(subs);
        setNewsletters(Array.isArray(nl) ? nl.slice(0, 3) : []);
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 900, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
          {greeting} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: 0 }}>
          Platform admin — full control, visible only to you.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#fca5a5', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
        <StatCard label="Total cars"      value={stats?.total_cars}          icon={Car}           color="var(--gold)"            loading={loading} to={`${BASE}/data`}       sub="across all dealers" />
        <StatCard label="Available"       value={stats?.available_cars}       icon={TrendingUp}    color="#4ade80"                loading={loading} to={`${BASE}/data`}       sub="listed publicly" />
        <StatCard label="Unread messages" value={stats?.unread_messages}      icon={MessageSquare} color="#818cf8"                loading={loading} to={`${BASE}/data`}       sub={stats?.unread_messages > 0 ? 'needs attention' : 'all clear'} />
        <StatCard label="Active dealers"  value={stats?.active_dealers}       icon={Users}         color="#f59e0b"                loading={loading} to={`${BASE}/dealers`}   sub={`of ${stats?.total_dealers ?? '—'} total`} />
        <StatCard label="Subscribers"     value={subscribers?.active}         icon={Mail}          color="#22d3ee"                loading={loading} to={`${BASE}/newsletter`} sub="newsletter list" />
        <StatCard label="Pending reviews" value={stats?.pending_testimonials} icon={Clock}         color="#a78bfa"                loading={loading}                           sub="awaiting approval" />
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recent unread messages */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 20px 8px' }}>
            <SectionHead title="Unread messages" linkLabel="View all" to={`${BASE}/data`} />
            {loading ? (
              <div style={{ padding: '20px 0', color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>Loading…</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                <CheckCircle size={14} style={{ color: '#4ade80' }} /> No unread messages
              </div>
            ) : messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => navigate(`${BASE}/data`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(129,140,248,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#818cf8',
                }}>
                  {(msg.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.subject || msg.message?.slice(0, 50) || '—'}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Recent dealers */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 20px 8px' }}>
            <SectionHead title="Dealers" linkLabel="Manage" to={`${BASE}/dealers`} />
            {loading ? (
              <div style={{ padding: '20px 0', color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>Loading…</div>
            ) : dealers.length === 0 ? (
              <div style={{ padding: '16px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No dealers yet</div>
            ) : dealers.map(dealer => (
              <div
                key={dealer.id}
                onClick={() => navigate(`${BASE}/dealers`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(245,158,11,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#f59e0b',
                }}>
                  {(dealer.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{dealer.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{dealer.email}</div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                  background: dealer.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                  color: dealer.is_active ? '#4ade80' : '#f87171',
                }}>
                  {dealer.is_active ? 'Active' : 'Suspended'}
                </div>
              </div>
            ))}
          </div>

          {/* Recent newsletters */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 20px 8px' }}>
            <SectionHead title="Newsletter" linkLabel="Compose" to={`${BASE}/newsletter`} />
            {loading ? (
              <div style={{ padding: '20px 0', color: 'rgba(255,255,255,0.15)', fontSize: 13 }}>Loading…</div>
            ) : newsletters.length === 0 ? (
              <div
                onClick={() => navigate(`${BASE}/newsletter`)}
                style={{ padding: '14px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={13} /> No newsletters yet — click to compose one
              </div>
            ) : newsletters.map(nl => (
              <div
                key={nl.id}
                onClick={() => navigate(`${BASE}/newsletter`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nl.subject}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                    {nl.status === 'sent' ? `✅ Sent to ${nl.recipients_count} · ${new Date(nl.sent_at).toLocaleDateString()}` : '📝 Draft'}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right column — quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            Quick actions
          </h3>
          <QuickAction label="Manage dealers"   icon={Users}          color="#f59e0b" to={`${BASE}/dealers`}    desc="Add, suspend or remove" />
          <QuickAction label="Send newsletter"  icon={Send}           color="#22d3ee" to={`${BASE}/newsletter`} desc="Compose & send to subscribers" />
          <QuickAction label="Hero images"      icon={Eye}            color="var(--gold)" to={`${BASE}/hero-images`} desc="Update homepage slideshow" />
          <QuickAction label="Business profile" icon={Shield}         color="#a78bfa" to={`${BASE}/profile`}   desc="Contact, hours & socials" />
          <QuickAction label="System health"    icon={Activity}       color="#4ade80" to={`${BASE}/health`}    desc="Server & API status" />
          <QuickAction label="Security log"     icon={Shield}         color="#f87171" to={`${BASE}/security`}  desc="Login activity & alerts" />

          {/* Newsletter subscriber count widget */}
          {!loading && subscribers && (
            <div
              onClick={() => navigate(`${BASE}/newsletter`)}
              style={{
                marginTop: 8, padding: '16px', cursor: 'pointer',
                background: 'rgba(34,211,238,0.04)',
                border: '1px solid rgba(34,211,238,0.12)',
                borderRadius: 12, textAlign: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(34,211,238,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(34,211,238,0.04)';
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: '#22d3ee' }}>{subscribers.active}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>active subscribers</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>{subscribers.total} total · click to manage</div>
            </div>
          )}
        </div>

      </div>

      {/* Footer note */}
      <div style={{ marginTop: 28, padding: '12px 16px', background: 'rgba(232,184,0,0.03)', border: '1px solid rgba(232,184,0,0.08)', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
        Super admin URL: <code style={{ color: 'rgba(232,184,0,0.4)' }}>/gm-x9k2-control</code> — never link to this from the public site.
      </div>

    </div>
  );
}