import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Fuel, Gauge, Settings, Calendar, Palette, Users, DoorOpen, Zap, Layers, Shield, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import Toast from '../components/Toast';
import CarCard from '../components/CarCard';

function formatPrice(n) { return 'K ' + Number(n).toLocaleString('en-ZM'); }

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar]           = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm]         = useState({ name:'', email:'', phone:'', message:'' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getCar(id)
      .then(data => {
        setCar(data);
        setLoading(false);
        // Load related
        api.getCars({ type: data.body_type, per_page: 4 })
          .then(r => {
            const list = Array.isArray(r) ? r : (r.data || []);
            setRelated(list.filter(c => String(c.id) !== String(id)).slice(0,3));
          }).catch(()=>{});
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { setToast({ message:'Please fill in all required fields.', type:'error' }); return; }
    setSubmitting(true);
    try {
      await api.submitMessage({ ...form, subject:'Enquiry: ' + car.make + ' ' + car.model, car_id: car.id, type:'car_enquiry' });
      setForm({ name:'', email:'', phone:'', message:'' });
      setToast({ message:'Enquiry sent! Our team will contact you shortly.', type:'success' });
    } catch {
      setToast({ message:'Failed to send. Please try again.', type:'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>Loading...</div>;

  if (!car) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'40px 20px', textAlign:'center' }}>
      <AlertCircle size={48} style={{ color:'var(--text-muted)' }} />
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'26px' }}>Vehicle not found</h2>
      <p style={{ color:'var(--text-muted)' }}>This listing may have been sold or removed.</p>
      <Link to="/inventory" className="btn btn-black">Back to inventory</Link>
    </div>
  );

  const specs = [
    { icon:Calendar, label:'Year',         value:car.year                         },
    { icon:Gauge,    label:'Mileage',       value:Number(car.mileage).toLocaleString()+' km' },
    { icon:Fuel,     label:'Fuel type',     value:car.fuel                         },
    { icon:Settings, label:'Transmission',  value:car.transmission                 },
    { icon:Palette,  label:'Colour',        value:car.color                        },
    { icon:Layers,   label:'Body type',     value:car.body_type                    },
    { icon:Zap,      label:'Engine',        value:car.engine                       },
    { icon:Zap,      label:'Power',         value:car.power                        },
    { icon:Zap,      label:'Torque',        value:car.torque                       },
    { icon:Users,    label:'Seats',         value:car.seats                        },
    { icon:DoorOpen, label:'Doors',         value:car.doors                        },
    { icon:Settings, label:'Drive',         value:car.drive                        },
    { icon:Shield,   label:'Condition',     value:car.condition                    },
  ].filter(s => s.value);

  const images = car.images || [];

  return (
    <div style={{ background:'var(--bg)', minHeight:'70vh' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div style={{ background:'var(--black)', padding:'20px 0' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.6)', fontSize:'14px', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>
            <ChevronLeft size={16}/> Back to inventory
          </button>
        </div>
      </div>

      <div className="container section-sm">
        <div className="car-detail__grid">
          <div>
            <div className="car-detail__gallery-img" style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', border:'1px solid var(--border)' }}>
              {images.length > 0
                ? <img src={images[activeImg].url} alt={car.make+' '+car.model} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                : <div style={{ fontSize:'64px', opacity:0.2 }}>🚗</div>
              }
            </div>
            {images.length > 1 && (
              <div style={{ display:'flex', gap:'8px', overflowX:'auto' }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)} className="car-detail__thumb" style={{ flexShrink:0, borderRadius:'8px', overflow:'hidden', border:'2px solid '+(i===activeImg?'var(--gold)':'var(--border)'), cursor:'pointer', padding:0 }}>
                    <img src={img.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop:'28px' }}>
              <h3 className="car-detail__section-title" style={{ fontFamily:'var(--font-display)', marginBottom:'16px' }}>Specifications</h3>
              <div className="car-detail__specs-grid" style={{ display:'grid', gap:'1px', background:'var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden', border:'1px solid var(--border)' }}>
                {specs.map(({ icon:Icon, label, value }) => (
                  <div key={label} style={{ background:'var(--bg-card)', padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:'10px' }}>
                    <Icon size={15} style={{ color:'var(--gold-deep)', flexShrink:0, marginTop:'2px' }}/>
                    <div>
                      <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'2px' }}>{label}</p>
                      <p style={{ fontSize:'14px', fontWeight:500, color:'var(--text-primary)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {car.features?.length > 0 && (
              <div style={{ marginTop:'24px' }}>
                <h3 className="car-detail__section-title" style={{ fontFamily:'var(--font-display)', marginBottom:'14px' }}>Features</h3>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {car.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'20px', fontSize:'13px', color:'var(--text-secondary)' }}>
                      <CheckCircle size={12} style={{ color:'var(--success)', flexShrink:0 }}/>{f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {car.description && (
              <div style={{ marginTop:'24px' }}>
                <h3 className="car-detail__section-title" style={{ fontFamily:'var(--font-display)', marginBottom:'10px' }}>About this vehicle</h3>
                <p style={{ fontSize:'14px', color:'var(--text-secondary)', lineHeight:1.7 }}>{car.description}</p>
              </div>
            )}
          </div>

          <div className="car-detail__sidebar">
            <div className="card car-detail__sidebar-card">
              {car.is_featured && <div className="badge badge-gold" style={{ marginBottom:'10px' }}>Featured</div>}
              <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'4px' }}>{car.year} · {car.condition} · {car.body_type}</p>
              <h1 className="car-detail__title" style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', lineHeight:1.2, marginBottom:'8px' }}>{car.make} {car.model}</h1>
              <p className="car-detail__price" style={{ fontWeight:700, color:'var(--gold-deep)', marginBottom:'16px' }}>{formatPrice(car.price)}</p>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'20px' }}>
                <span className="badge badge-muted"><Gauge size={11}/>{Number(car.mileage).toLocaleString()} km</span>
                <span className="badge badge-muted"><Fuel size={11}/>{car.fuel}</span>
                <span className="badge badge-muted"><Settings size={11}/>{car.transmission}</span>
              </div>
              <div style={{ background:'var(--gold-muted)', border:'1px solid var(--gold-border)', borderRadius:'var(--radius-md)', padding:'12px 14px', marginBottom:'20px', fontSize:'12px', color:'var(--text-secondary)', lineHeight:1.6 }}>
                <Shield size={14} style={{ color:'var(--gold-deep)', display:'inline', marginRight:'6px', verticalAlign:'middle' }}/>
                All transactions are processed through our financial office. No online payment required.
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'18px', marginBottom:'14px' }}>Enquire about this vehicle</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label className="label">Full name *</label><input className="input" placeholder="Your name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
                <div className="form-group" style={{ marginTop:'14px' }}><label className="label">Phone number *</label><input className="input" placeholder="+260 97X XXX XXX" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} required/></div>
                <div className="form-group" style={{ marginTop:'14px' }}><label className="label">Email address *</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
                <div className="form-group" style={{ marginTop:'14px' }}><label className="label">Message</label><textarea className="input textarea" placeholder={'I am interested in the '+car.make+' '+car.model+'.'} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{ minHeight:'80px' }}/></div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'4px' }} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send enquiry'}
                </button>
              </form>
              <div style={{ marginTop:'14px', display:'flex', gap:'8px' }}>
                <a href="tel:+260970000000" className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}><Phone size={14}/> Call</a>
                <a href="mailto:info@mukubamotors.zm" className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}><Mail size={14}/> Email</a>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop:'48px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <h2 className="car-detail__related-title" style={{ fontFamily:'var(--font-display)' }}>You may also like</h2>
              <Link to="/inventory" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="car-detail__related-grid" style={{ display:'grid' }}>
              {related.map(c => <div key={c.id} className="card card-hover"><CarCard car={c}/></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
