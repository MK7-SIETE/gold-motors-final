import { useState, useEffect } from 'react';
import { Save, Building, Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { api } from '../../services/api';
import Toast from '../../components/Toast';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function Profile() {
  const [form, setForm]     = useState({ name:'', phone:'', email:'', address:'', about:'', facebook:'', instagram:'', twitter:'' });
  const [hours, setHours]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  useEffect(() => {
    api.getProfile().then(data => {
      if (data.user)   setForm(f => ({ ...f, name: data.user.name || '', email: data.user.email || '' }));
      if (data.config) {
        const c = data.config;
        setForm(f => ({ ...f, phone: c.phone||'', address: c.address||'', about: c.about||'', facebook: c.facebook||'', instagram: c.instagram||'', twitter: c.twitter||'' }));
        try { setHours(JSON.parse(c.hours||'{}')); } catch { setHours({}); }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));
  const setH = k => e => setHours(h => ({...h, [k]: e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api.updateProfile({ ...form, hours });
      setToast({ message:'Profile updated successfully.', type:'success' });
    } catch {
      setToast({ message:'Failed to save. Please try again.', type:'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color:'var(--text-muted)', padding:'20px' }}>Loading...</p>;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={()=>setToast(null)}/>}
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', color:'var(--text-primary)', marginBottom:'4px' }}>Business profile</h1>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Update your dealership information shown on the website.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'18px', paddingBottom:'12px', borderBottom:'1px solid var(--border)' }}>
                <Building size={16} style={{ color:'var(--gold-deep)' }}/><h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px' }}>Dealership details</h2>
              </div>
              {[{key:'name',label:'Business name',ph:'Mukuba Motors Ltd'},{key:'phone',label:'Phone number',ph:'+260 97X XXX XXX'},{key:'email',label:'Email address',ph:'info@mukubamotors.zm'},{key:'address',label:'Physical address',ph:'Plot 1234, Cairo Road, Lusaka'}].map(({key,label,ph})=>(
                <div className="form-group" key={key}><label className="label">{label}</label><input className="input" placeholder={ph} value={form[key]} onChange={set(key)}/></div>
              ))}
              <div className="form-group">
                <label className="label">About the dealership</label>
                <textarea className="input textarea" value={form.about} onChange={set('about')} style={{ minHeight:'90px' }}/>
              </div>
            </div>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border)' }}>
                <Globe size={16} style={{ color:'var(--gold-deep)' }}/><h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px' }}>Social media</h2>
              </div>
              {[{key:'facebook',label:'Facebook URL'},{key:'instagram',label:'Instagram URL'},{key:'twitter',label:'Twitter / X URL'}].map(({key,label})=>(
                <div className="form-group" key={key}><label className="label">{label}</label><input className="input" placeholder="https://..." value={form[key]} onChange={set(key)} type="url"/></div>
              ))}
            </div>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid var(--border)' }}>
              <Clock size={16} style={{ color:'var(--gold-deep)' }}/><h2 style={{ fontFamily:'var(--font-display)', fontSize:'18px' }}>Business hours</h2>
            </div>
            {DAYS.map(day => (
              <div key={day} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'13px', color:'var(--text-secondary)', minWidth:'90px' }}>{day}</span>
                <input className="input" value={hours[day]||''} onChange={setH(day)} placeholder="08:00 – 17:00 or Closed" style={{ fontSize:'13px', padding:'7px 10px' }}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop:'20px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving...' : <><Save size={15}/> Save profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}
