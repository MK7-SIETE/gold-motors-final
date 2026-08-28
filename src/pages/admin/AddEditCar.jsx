import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Star, ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/api';
import Toast from '../../components/Toast';
import { useDraft, loadDraft, clearDraft, timeAgo } from '../../hooks/useDraft';

const FIELDS = [
  {key:'make',    label:'Make *',       placeholder:'e.g. Toyota',         type:'text'},
  {key:'model',   label:'Model *',      placeholder:'e.g. Land Cruiser V8', type:'text'},
  {key:'year',    label:'Year *',       placeholder:'e.g. 2020',            type:'number'},
  {key:'price',   label:'Price (K) *',  placeholder:'e.g. 285000',          type:'number'},
  {key:'mileage', label:'Mileage (km)', placeholder:'e.g. 45000',           type:'number'},
  {key:'color',   label:'Colour',       placeholder:'e.g. White',           type:'text'},
  {key:'engine',  label:'Engine',       placeholder:'e.g. 4.5L V8',         type:'text'},
  {key:'power',   label:'Power',        placeholder:'e.g. 232hp',           type:'text'},
  {key:'torque',  label:'Torque',       placeholder:'e.g. 650Nm',           type:'text'},
  {key:'vin',             label:'VIN / Chassis number', placeholder:'e.g. JTMHV05J...', type:'text'},
  {key:'previous_owners', label:'Previous owners',      placeholder:'e.g. 1',           type:'number'},
];

const SELECTS = [
  {key:'fuel',         label:'Fuel type',    options:['Petrol','Diesel','Hybrid','Electric']},
  {key:'transmission', label:'Transmission', options:['Automatic','Manual']},
  {key:'body_type',    label:'Body type',    options:['SUV','Sedan','Pickup','Hatchback','Coupe','Van']},
  {key:'condition',    label:'Condition',    options:['Foreign Used','Local Used','Brand New']},
  {key:'seats',        label:'Seats',        options:['2','4','5','6','7','8','9']},
  {key:'doors',        label:'Doors',        options:['2','3','4','5']},
  {key:'drive',        label:'Drive',        options:['FWD','RWD','AWD','4WD']},
  {key:'drive_side',          label:'Drive side',          options:['Right-hand drive (RHD)','Left-hand drive (LHD)']},
  {key:'import_origin',       label:'Import origin',       options:['Japan','UAE','United Kingdom','South Africa','Zambia (local)','Other']},
  {key:'registration_status', label:'Registration status', options:['Registered (local plates)','Not yet registered','In transit / clearing']},
];

const EMPTY = {
  make:'',model:'',year:'',price:'',mileage:'',color:'',engine:'',power:'',torque:'',
  vin:'',previous_owners:'',
  fuel:'Petrol',transmission:'Automatic',body_type:'SUV',condition:'Foreign Used',
  seats:'5',doors:'4',drive:'AWD',
  drive_side:'Right-hand drive (RHD)',import_origin:'Japan',registration_status:'Registered (local plates)',
  description:'',is_featured:false,is_available:true,
};

const DRAFT_KEY = 'mm_draft_add_car';

export default function AddEditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm]       = useState(EMPTY);
  const [features, setFeatures] = useState('');
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    api.getCar(id).then(car => {
      setForm({
        make: car.make||'', model: car.model||'', year: car.year||'',
        price: car.price||'', mileage: car.mileage||'', color: car.color||'',
        engine: car.engine||'', power: car.power||'', torque: car.torque||'',
        vin: car.vin||'', previous_owners: car.previous_owners||'',
        fuel: car.fuel||'Petrol', transmission: car.transmission||'Automatic',
        body_type: car.body_type||'SUV', condition: car.condition||'Foreign Used',
        seats: String(car.seats||5), doors: String(car.doors||4), drive: car.drive||'AWD',
        drive_side: car.drive_side||'Right-hand drive (RHD)',
        import_origin: car.import_origin||'Japan',
        registration_status: car.registration_status||'Registered (local plates)',
        description: car.description||'', is_featured: !!car.is_featured, is_available: !!car.is_available,
      });
      setFeatures((car.features||[]).join(', '));
      setImages(car.images||[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Restore an unsaved draft when starting a NEW car. Editing an existing
  // car already loads real data above, so drafts don't apply there.
  useEffect(() => {
    if (isEdit) return;
    const draft = loadDraft(DRAFT_KEY);
    if (draft?.value) {
      setForm(f => ({ ...f, ...draft.value.form }));
      setFeatures(draft.value.features || '');
      setToast({ message: 'Restored your unsaved draft from ' + timeAgo(draft.savedAt) + '.', type:'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quietly auto-saves as you type. Only active while adding a new car —
  // disabled during edit so a stale draft can never overwrite real data.
  useDraft(DRAFT_KEY, { form, features }, !isEdit);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));
  const setCheck = k => e => setForm(f => ({...f, [k]: e.target.checked}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.make || !form.model || !form.year || !form.price) {
      setToast({ message:'Please fill in all required fields.', type:'error' }); return;
    }
    setSaving(true);
    const data = {
      ...form,
      features: features.split(',').map(f => f.trim()).filter(Boolean),
      year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage)||0,
      seats: Number(form.seats), doors: Number(form.doors),
      previous_owners: Number(form.previous_owners)||0,
    };
    try {
      if (isEdit) {
        await api.updateCar(id, data);
        setToast({ message:'Car updated successfully.', type:'success' });
      } else {
        await api.createCar(data);
        clearDraft(DRAFT_KEY);
        setToast({ message:'Car added successfully.', type:'success' });
        setTimeout(() => navigate('/dealer/cars'), 1200);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to save. Please check all fields.', type:'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async e => {
    const files = Array.from(e.target.files);
    if (!files.length || !isEdit) return;
    try {
      const uploaded = await api.uploadImages(id, files);
      setImages(prev => [...prev, ...(Array.isArray(uploaded) ? uploaded : [])]);
      setToast({ message:'Images uploaded.', type:'success' });
    } catch {
      setToast({ message:'Image upload failed.', type:'error' });
    }
  };

  const handleDeleteImage = async imgId => {
    if (!window.confirm('Delete this image?')) return;
    await api.deleteImage(id, imgId).catch(console.error);
    setImages(prev => prev.filter(i => i.id !== imgId));
  };

  if (loading) return <p style={{ color:'var(--text-muted)', padding:'20px' }}>Loading...</p>;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={()=>setToast(null)}/>}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <button onClick={()=>navigate('/dealer/cars')} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>
          <ArrowLeft size={15}/> Cars
        </button>
        <span style={{ color:'var(--border-strong)' }}>/</span>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'var(--text-primary)' }}>{isEdit?'Edit car':'Add new car'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.5fr) minmax(0,1fr)', gap:'20px', alignItems:'start' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px', marginBottom:'18px', paddingBottom:'10px', borderBottom:'1px solid var(--border)' }}>Vehicle details</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                {FIELDS.map(({key,label,placeholder,type})=>(
                  <div key={key}><label className="label">{label}</label><input className="input" type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} required={label.includes('*')}/></div>
                ))}
              </div>
            </div>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px', marginBottom:'18px', paddingBottom:'10px', borderBottom:'1px solid var(--border)' }}>Specifications</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                {SELECTS.map(({key,label,options})=>(
                  <div key={key}><label className="label">{label}</label><select className="select" value={form[key]} onChange={set(key)}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                ))}
              </div>
            </div>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px', marginBottom:'14px' }}>Description & features</h2>
              <textarea className="input textarea" placeholder="Describe this vehicle..." value={form.description} onChange={set('description')} style={{ minHeight:'100px' }}/>
              <div style={{ marginTop:'14px' }}>
                <label className="label">Features (comma separated)</label>
                <input className="input" placeholder="e.g. Leather seats, Sunroof, Reverse camera" value={features} onChange={e=>setFeatures(e.target.value)}/>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px', marginBottom:'14px' }}>Settings</h2>
              {[{key:'is_available',label:'Available for sale',desc:'Show on public site'},{key:'is_featured',label:'Featured listing',desc:'Highlight on homepage'}].map(({key,label,desc})=>(
                <label key={key} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
                  <input type="checkbox" checked={!!form[key]} onChange={setCheck(key)} style={{ marginTop:'2px', accentColor:'var(--gold)' }}/>
                  <div>
                    <p style={{ fontSize:'14px', fontWeight:500, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'6px' }}>{label}{key==='is_featured'&&<Star size={13} style={{ color:'var(--gold)', fill:form.is_featured?'var(--gold)':'none' }}/>}</p>
                    <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px', marginBottom:'14px' }}>Photos</h2>
              {images.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'14px' }}>
                  {images.map(img => (
                    <div key={img.id} style={{ position:'relative', aspectRatio:'1', borderRadius:'8px', overflow:'hidden', border:'1px solid var(--border)' }}>
                      <img src={img.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      {isEdit && <button onClick={()=>handleDeleteImage(img.id)} style={{ position:'absolute', top:'4px', right:'4px', width:'20px', height:'20px', borderRadius:'50%', background:'rgba(0,0,0,0.6)', color:'#fff', border:'none', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>}
                    </div>
                  ))}
                </div>
              )}
              <label style={{ display:'block', border:'2px dashed var(--border)', borderRadius:'var(--radius-md)', padding:'24px 16px', textAlign:'center', cursor:'pointer', transition:'all 0.18s' }} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} disabled={!isEdit}/>
                <Upload size={24} style={{ color:'var(--text-muted)', margin:'0 auto 10px' }}/>
                <p style={{ fontSize:'14px', fontWeight:500, marginBottom:'4px' }}>{isEdit ? 'Click to upload photos' : 'Save car first, then add photos'}</p>
                <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>JPG, PNG up to 5MB each</p>
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={15}/> {isEdit?'Save changes':'Add car'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
