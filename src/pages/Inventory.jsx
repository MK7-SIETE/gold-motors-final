import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Car } from 'lucide-react';
import CarCard from '../components/CarCard';
import { api } from '../services/api';

const BODY_TYPES    = ['All','SUV','Sedan','Pickup','Hatchback','Coupe','Van'];
const FUEL_TYPES    = ['All','Petrol','Diesel','Hybrid','Electric'];
const TRANSMISSIONS = ['All','Automatic','Manual'];
const SORT_OPTIONS  = [
  { label:'Newest first',    value:'newest'    },
  { label:'Price: Low–High', value:'price_asc' },
  { label:'Price: High–Low', value:'price_desc'},
  { label:'Lowest mileage',  value:'mileage'   },
  { label:'Year: Newest',    value:'year'      },
];

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [query,    setQuery]    = useState(searchParams.get('search') || '');
const [bodyType, setBodyType] = useState(searchParams.get('body_type') || 'All');
const [fuel,     setFuel]     = useState(searchParams.get('fuel') || 'All');
const [trans,    setTrans]    = useState(searchParams.get('transmission') || 'All');
  const [sort,     setSort]     = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [cars, setCars]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (query)              params.search       = query;
    if (bodyType !== 'All') params.body_type    = bodyType;
    if (fuel !== 'All')     params.fuel         = fuel;
    if (trans !== 'All')    params.transmission = trans;

    api.getCars(params)
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setCars(list);
        setTotal(data.total || list.length);
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, [query, bodyType, fuel, trans, sort]);

  const activeFilters = [
    bodyType !== 'All' && { label: bodyType, clear: () => setBodyType('All') },
    fuel     !== 'All' && { label: fuel,     clear: () => setFuel('All')     },
    trans    !== 'All' && { label: trans,    clear: () => setTrans('All')    },
    query              && { label: '"' + query + '"', clear: () => setQuery('') },
  ].filter(Boolean);

  const clearAll = () => { setBodyType('All'); setFuel('All'); setTrans('All'); setQuery(''); };

  return (
    <div style={{ background:'var(--bg)', minHeight:'70vh' }}>
      <div style={{ background:'var(--black)', padding:'40px 0 28px' }}>
        <div className="container">
          <span className="section-label">Browse stock</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,40px)', color:'#fff', marginBottom:'8px' }}>Our inventory</h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'15px' }}>{total} vehicles available</p>
        </div>
      </div>

      <div style={{ background:'var(--bg-card)', borderBottom:'1px solid var(--border)', position:'sticky', top:'calc(var(--topbar-height) + var(--nav-height))', zIndex:80 }}>
        <div className="container" style={{ padding:'12px 24px' }}>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:'200px', display:'flex', alignItems:'center', gap:'8px', border:'1.5px solid var(--border)', borderRadius:'var(--radius-md)', padding:'9px 14px', background:'var(--bg-card)' }}>
              <Search size={15} style={{ color:'var(--text-muted)', flexShrink:0 }} />
              <input type="text" placeholder="Search by make, model, body type..." value={query} onChange={e => setQuery(e.target.value)}
                style={{ border:'none', outline:'none', background:'transparent', fontSize:'14px', color:'var(--text-primary)', width:'100%' }} />
              {query && <button onClick={() => setQuery('')} style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer' }}><X size={14}/></button>}
            </div>
            <button onClick={() => setShowFilters(f => !f)} className="btn btn-ghost btn-sm">
              <SlidersHorizontal size={15}/> Filters
              {activeFilters.length > 0 && <span className="badge badge-gold" style={{ padding:'1px 7px', fontSize:'10px' }}>{activeFilters.length}</span>}
            </button>
            <div style={{ position:'relative' }}>
              <select value={sort} onChange={e => setSort(e.target.value)} className="select" style={{ width:'auto', padding:'9px 32px 9px 12px', fontSize:'13px' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
            </div>
          </div>
          {showFilters && (
            <div style={{ paddingTop:'14px', display:'flex', gap:'20px', flexWrap:'wrap' }}>
              {[{label:'Body type',opts:BODY_TYPES,val:bodyType,set:setBodyType},{label:'Fuel type',opts:FUEL_TYPES,val:fuel,set:setFuel},{label:'Transmission',opts:TRANSMISSIONS,val:trans,set:setTrans}].map(({ label, opts, val, set }) => (
                <div key={label}>
                  <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>{label}</p>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    {opts.map(opt => <button key={opt} onClick={() => set(opt)} className={'filter-pill' + (val === opt ? ' filter-pill--active' : '')} style={{ padding:'5px 12px', fontSize:'12px' }}>{opt}</button>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeFilters.length > 0 && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', paddingTop:'10px', alignItems:'center' }}>
              <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>Active:</span>
              {activeFilters.map(f => (
                <button key={f.label} onClick={f.clear} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:500, background:'var(--gold-muted)', color:'var(--gold-deep)', border:'1px solid var(--gold-border)', cursor:'pointer', fontFamily:'var(--font-body)' }}>
                  {f.label} <X size={11}/>
                </button>
              ))}
              <button onClick={clearAll} style={{ fontSize:'12px', color:'var(--gold-deep)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:500 }}>Clear all</button>
            </div>
          )}
        </div>
      </div>

      <div className="container section-sm">
        <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'20px' }}>
          <strong style={{ color:'var(--text-primary)' }}>{cars.length}</strong> vehicle{cars.length !== 1 ? 's' : ''} found
        </p>
        {loading ? (
          <div style={{ textAlign:'center', padding:'64px 20px', color:'var(--text-muted)' }}>Loading vehicles...</div>
        ) : cars.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 20px' }}>
            <Car size={48} style={{ color:'var(--border-strong)', margin:'0 auto 16px' }} />
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'22px', marginBottom:'8px' }}>No vehicles match your search</h3>
            <p style={{ color:'var(--text-muted)', marginBottom:'20px' }}>Try adjusting your filters or search term.</p>
            <button onClick={clearAll} className="btn btn-black">Clear filters</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
            {cars.map(car => <div key={car.id} className="card card-hover"><CarCard car={car} /></div>)}
          </div>
        )}
        <div style={{ marginTop:'48px', padding:'24px', background:'var(--gold-muted)', border:'1px solid var(--gold-border)', borderRadius:'var(--radius-lg)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <p style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'4px' }}>Can't find what you're looking for?</p>
            <p style={{ fontSize:'14px', color:'var(--text-secondary)' }}>We source vehicles from Japan, UAE, UK and beyond.</p>
          </div>
          <Link to="/source-a-car" className="btn btn-black">Source a car</Link>
        </div>
      </div>
    </div>
  );
}
