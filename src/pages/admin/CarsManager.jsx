import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Star } from 'lucide-react';
import { api } from '../../services/api';
import Toast from '../../components/Toast';

function formatPrice(n) { return 'K ' + Number(n).toLocaleString('en-ZM'); }

export default function CarsManager() {
  const [cars, setCars]     = useState([]);
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState(null);

  const load = () => api.getDealerCars().then(data => { setCars(Array.isArray(data)?data:[]); setLoading(false); }).catch(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = cars.filter(c => (c.make+' '+c.model+' '+c.body_type).toLowerCase().includes(query.toLowerCase()));

  const toggle = async id => {
    await api.toggleCar(id).catch(console.error);
    load();
  };

  const del = async id => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    await api.deleteCar(id).catch(console.error);
    setCars(prev => prev.filter(c => c.id !== id));
    setToast({ message:'Listing deleted.', type:'success' });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={()=>setToast(null)}/>}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', color:'var(--text-primary)', marginBottom:'4px' }}>Cars</h1>
          <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>{cars.length} total listings</p>
        </div>
        <Link to="/dealer/cars/new" className="btn btn-primary btn-sm"><Plus size={15}/> Add new car</Link>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'9px 14px', marginBottom:'16px' }}>
        <Search size={15} style={{ color:'var(--text-muted)' }}/>
        <input type="text" placeholder="Search cars..." value={query} onChange={e=>setQuery(e.target.value)} style={{ border:'none', outline:'none', background:'transparent', fontSize:'14px', color:'var(--text-primary)', width:'100%' }}/>
      </div>
      {loading ? <p style={{ color:'var(--text-muted)', padding:'20px' }}>Loading...</p> : (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead><tr>{['Vehicle','Year','Price','Status','Featured','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(car => (
                  <tr key={car.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'44px', height:'36px', borderRadius:'6px', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', overflow:'hidden', flexShrink:0 }}>
                          {car.images?.[0]?.url ? <img src={car.images[0].url} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : '🚗'}
                        </div>
                        <div>
                          <p style={{ fontWeight:600, color:'var(--text-primary)' }}>{car.make} {car.model}</p>
                          <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{car.body_type} · {car.fuel}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:'var(--text-secondary)' }}>{car.year}</td>
                    <td style={{ fontWeight:700, color:'var(--gold-deep)' }}>{formatPrice(car.price)}</td>
                    <td><span className={'badge '+(car.is_available?'badge-success':'badge-danger')}>{car.is_available?'Available':'Sold'}</span></td>
                    <td>{car.is_featured&&<Star size={14} style={{ color:'var(--gold)', fill:'var(--gold)' }}/>}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <button onClick={()=>toggle(car.id)} className="admin-action-btn" title={car.is_available?'Mark sold':'Mark available'}>{car.is_available?<EyeOff size={13}/>:<Eye size={13}/>}</button>
                        <Link to={'/dealer/cars/'+car.id} className="admin-action-btn"><Edit size={13}/></Link>
                        <button onClick={()=>del(car.id)} className="admin-action-btn danger"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length===0&&<p style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)' }}>No vehicles match your search.</p>}
        </div>
      )}
    </div>
  );
}
