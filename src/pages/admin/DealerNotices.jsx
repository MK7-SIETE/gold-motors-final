import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, Zap, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';

const TYPE_STYLES = {
  info: {
    icon: Info, iconColor: '#60a5fa',
    bg: 'rgba(96,165,250,0.06)',   border: 'rgba(96,165,250,0.18)',
    badge: 'rgba(96,165,250,0.12)', badgeText: '#60a5fa', label: 'Info',
  },
  warning: {
    icon: AlertTriangle, iconColor: '#fbbf24',
    bg: 'rgba(251,191,36,0.06)',   border: 'rgba(251,191,36,0.18)',
    badge: 'rgba(251,191,36,0.12)', badgeText: '#fbbf24', label: 'Warning',
  },
  action: {
    icon: Zap, iconColor: 'var(--gold)',
    bg: 'rgba(232,184,0,0.06)',    border: 'rgba(232,184,0,0.2)',
    badge: 'rgba(232,184,0,0.12)', badgeText: 'var(--gold)', label: 'Action required',
  },
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const days = Math.floor(h / 24);
  if (days < 7) return days + 'd ago';
  return new Date(d).toLocaleDateString();
}

export default function DealerNotices() {
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | unread | read

  useEffect(() => {
    api.getDealerNotices()
      .then(data => setNotices(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.markNoticeRead(id).catch(() => {});
    setNotices(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notices.filter(n => !n.is_read);
    await Promise.all(unread.map(n => api.markNoticeRead(n.id).catch(() => {})));
    setNotices(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notices.filter(n => !n.is_read).length;

  const filtered = notices.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return  n.is_read;
    return true;
  });

  const pillStyle = active => ({
    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
    background: active ? 'var(--gold-muted)' : 'transparent',
    color: active ? 'var(--gold-deep)' : 'var(--text-muted)',
    outline: active ? '1px solid var(--gold-border)' : 'none',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 4 }}>
            Notices
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {notices.length === 0
              ? 'No notices from the platform yet.'
              : `${notices.length} notice${notices.length !== 1 ? 's' : ''} · ${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--gold-muted)', border: '1px solid var(--gold-border)', borderRadius: 8, color: 'var(--gold-deep)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            <CheckCircle size={14} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter pills */}
      {notices.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 4, width: 'fit-content' }}>
          <button style={pillStyle(filter === 'all')}    onClick={() => setFilter('all')}>All ({notices.length})</button>
          <button style={pillStyle(filter === 'unread')} onClick={() => setFilter('unread')}>Unread ({unreadCount})</button>
          <button style={pillStyle(filter === 'read')}   onClick={() => setFilter('read')}>Read ({notices.length - unreadCount})</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Bell size={36} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.3 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notices yet.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, opacity: 0.6, marginTop: 4 }}>
            Platform announcements from your admin will appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0' }}>No {filter} notices.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(notice => {
            const s    = TYPE_STYLES[notice.type] || TYPE_STYLES.info;
            const Icon = s.icon;
            return (
              <div
                key={notice.id}
                style={{
                  display: 'flex', gap: 16, padding: '18px 20px',
                  background: notice.is_read ? 'var(--bg-card)' : s.bg,
                  border: `1px solid ${notice.is_read ? 'var(--border)' : s.border}`,
                  borderLeft: notice.is_read ? `1px solid var(--border)` : `3px solid ${s.iconColor}`,
                  borderRadius: 10, transition: 'all 0.2s',
                }}
              >
                {/* Icon */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: s.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: notice.is_read ? 0.5 : 1 }}>
                  <Icon size={17} style={{ color: s.iconColor }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: notice.is_read ? 500 : 700, color: 'var(--text-primary)' }}>
                      {notice.title}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: s.badge, color: s.badgeText, fontWeight: 600 }}>
                      {s.label}
                    </span>
                    {!notice.is_read && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--gold)', color: 'var(--black)', fontWeight: 700 }}>
                        New
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line', marginBottom: 10 }}>
                    {notice.body}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {timeAgo(notice.created_at)}
                    </span>
                    {notice.expires_at && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        · Expires {new Date(notice.expires_at).toLocaleDateString()}
                      </span>
                    )}
                    {notice.is_read ? (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                        <CheckCircle size={11} style={{ color: 'var(--success)' }} /> Read
                      </span>
                    ) : (
                      <button
                        onClick={() => markRead(notice.id)}
                        style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: s.iconColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <CheckCircle size={13} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
