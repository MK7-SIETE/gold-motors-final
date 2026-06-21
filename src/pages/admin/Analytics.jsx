import { useState, useEffect } from 'react';
import { TrendingUp, Eye, MessageSquare, Car, Star, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

function formatPrice(n) { return 'K ' + Number(n).toLocaleString('en-ZM'); }

function Bar({ label, value, max, color='var(--gold)' }) {
  const pct = max > 0 ? Math.round((value/max)*100) : 0;
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'5px' }}>
        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{label}</span>
        <span style={{ color:'var(--text-muted)' }}>{value}</span>
      </div>
      <div style={{ height:'8px', background:'var(--bg-elevated)', borderRadius:'4px', overflow:'hidden', border:'1px solid var(--border)' }}>
        <div style={{ height:'100%', width:pct+'%', background:color, borderRadius:'4px', transition:'width 0.8s ease' }}/>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDealerStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color:'var(--text-muted)', padding:'20px' }}>Loading...</p>;
  if (!stats)  return <p style={{ color:'var(--text-muted)', padding:'20px' }}>Could not load analytics.</p>;

  const topMax = stats.top_cars?.[0]?.views || 1;

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', color:'var(--text-primary)', marginBottom:'4px' }}>Analytics</h1>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Overview of inventory performance and enquiry activity.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'14px', marginBottom:'24px' }}>
        {[
          { icon:Car,           label:'Total listings', value:stats.total_cars,       color:'var(--black)'    },
          { icon:Eye,           label:'Available',      value:stats.available_cars,    color:'var(--success)'  },
          { icon:Star,          label:'Featured',       value:stats.featured_cars,     color:'var(--gold-deep)'},
          { icon:MessageSquare, label:'Enquiries',      value:stats.total_messages,    color:'#6366f1'         },
          { icon:TrendingUp,    label:'Total views',    value:stats.total_views||0,    color:'var(--gold-deep)'},
        ].map(({ icon:Icon, label, value, color }) => (
          <div key={label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'18px' }}>
            <Icon size={18} style={{ color, marginBottom:'8px' }}/>
            <p style={{ fontSize:'26px', fontWeight:600, fontFamily:'var(--font-display)', color:'var(--text-primary)', lineHeight:1 }}>{value}</p>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px' }}>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', marginBottom:'20px' }}>Most viewed listings</h2>
          {(stats.top_cars||[]).map(car => <Bar key={car.id} label={car.make+' '+car.model} value={car.views} max={topMax}/>)}
          {(!stats.top_cars||stats.top_cars.length===0) && <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>No view data yet.</p>}
        </div>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', marginBottom:'20px' }}>Enquiry breakdown</h2>
          {[
            { label:'Total enquiries',  value:stats.total_messages,    color:'var(--black)'    },
            { label:'Unread messages',  value:stats.unread_messages,   color:'var(--gold-deep)'},
          ].map(({ label, value, color }) => <Bar key={label} label={label} value={value} max={Math.max(stats.total_messages,1)} color={color}/>)}
          <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'16px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px' }}><DollarSign size={16} style={{ color:'var(--gold-deep)' }}/> Inventory value</h3>
            <p style={{ fontSize:'30px', fontWeight:700, color:'var(--gold-deep)', fontFamily:'var(--font-body)' }}>{formatPrice(stats.inventory_value||0)}</p>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>Value of available stock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
