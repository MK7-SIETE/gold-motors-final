import { useState, useEffect } from 'react';
import { Save, Building, Phone, Mail, MapPin, Clock, Globe, Lock, Briefcase } from 'lucide-react';
import { api } from '../../services/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const inputStyle = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', color: '#fff',
  fontSize: '14px', fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: '12px',
  color: 'rgba(255,255,255,0.4)', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '12px', padding: '24px',
  marginBottom: '16px',
};
const sectionHeadStyle = {
  fontSize: '12px', color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  marginBottom: '16px', paddingBottom: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex', alignItems: 'center', gap: '8px',
};
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
  gap: '12px',
};

function Field({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4}
          style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={inputStyle} />
      )}
    </div>
  );
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
      background: type === 'error' ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.12)',
      border: `1px solid ${type === 'error' ? 'rgba(220,38,38,0.25)' : 'rgba(34,197,94,0.2)'}`,
      color: type === 'error' ? '#fca5a5' : '#86efac',
      backdropFilter: 'blur(8px)',
    }}>{msg}</div>
  );
}

const EMPTY_FORM = {
  // Super admin account
  name: '', password: '', password_confirmation: '',
  // Dealership identity
  dealership_name: '', registration_number: '',
  // Contact
  phone: '', whatsapp: '', email: '',
  // Location
  address: '', city: '', country: '',
  // About
  about: '',
  // Social
  facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '',
};

export default function SuperProfile() {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [hours, setHours]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.getSuperProfile()
      .then(data => {
        if (data.user) {
          setForm(f => ({ ...f, name: data.user.name || '' }));
        }
        if (data.config) {
          const c = data.config;
          setForm(f => ({
            ...f,
            dealership_name:     c.dealership_name     || '',
            registration_number: c.registration_number || '',
            phone:               c.phone               || '',
            whatsapp:            c.whatsapp             || '',
            email:               c.email               || '',
            address:             c.address             || '',
            city:                c.city                || '',
            country:             c.country             || '',
            about:               c.about               || '',
            facebook:            c.facebook            || '',
            instagram:           c.instagram           || '',
            twitter:             c.twitter             || '',
            youtube:             c.youtube             || '',
            linkedin:            c.linkedin            || '',
          }));
          try { setHours(JSON.parse(c.hours || '{}')); } catch { setHours({}); }
        }
        setLoading(false);
      })
      .catch(() => { showToast('Failed to load profile.', 'error'); setLoading(false); });
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleHours  = day => e => setHours(h => ({ ...h, [day]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirmation) {
      showToast('Passwords do not match.', 'error'); return;
    }
    setSaving(true);
    try {
      await api.updateSuperProfile({ ...form, hours });
      showToast('Profile updated successfully.');
      setForm(f => ({ ...f, password: '', password_confirmation: '' }));
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '900px' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: '#fff', marginBottom: '4px' }}>Business profile</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Dealership info, site config, and account settings.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>

          {/* Left column */}
          <div>

            {/* Dealership identity */}
            <div style={cardStyle}>
              <div style={sectionHeadStyle}><Building size={14} /> Dealership details</div>
              <Field label="Dealership name"       name="dealership_name"     value={form.dealership_name}     onChange={handleChange} placeholder="Gold Motors General Dealers Ltd" />
              <Field label="Registration number"   name="registration_number" value={form.registration_number} onChange={handleChange} placeholder="e.g. 120240012345" />
              <Field label="About"                 name="about" type="textarea" value={form.about}             onChange={handleChange} placeholder="Tell customers about your dealership..." />
            </div>

            {/* Contact */}
            <div style={cardStyle}>
              <div style={sectionHeadStyle}><Phone size={14} /> Contact information</div>
              <div style={gridStyle}>
                <Field label="Phone number"  name="phone"    value={form.phone}    onChange={handleChange} placeholder="+260 97X XXX XXX" />
                <Field label="WhatsApp"      name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+260 97X XXX XXX" />
              </div>
              <Field label="Email address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="info@goldmotors.zm" />
            </div>

            {/* Location */}
            <div style={cardStyle}>
              <div style={sectionHeadStyle}><MapPin size={14} /> Location</div>
              <Field label="Physical address" name="address" value={form.address} onChange={handleChange} placeholder="Plot 1234, Cairo Road" />
              <div style={gridStyle}>
                <Field label="City"    name="city"    value={form.city}    onChange={handleChange} placeholder="Lusaka" />
                <Field label="Country" name="country" value={form.country} onChange={handleChange} placeholder="Zambia" />
              </div>
            </div>

            {/* Social media */}
            <div style={cardStyle}>
              <div style={sectionHeadStyle}><Globe size={14} /> Social media</div>
              <div style={gridStyle}>
                <Field label="Facebook"   name="facebook"  type="url" value={form.facebook}  onChange={handleChange} placeholder="https://facebook.com/..." />
                <Field label="Instagram"  name="instagram" type="url" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                <Field label="Twitter / X" name="twitter"  type="url" value={form.twitter}   onChange={handleChange} placeholder="https://x.com/..." />
                <Field label="YouTube"    name="youtube"   type="url" value={form.youtube}   onChange={handleChange} placeholder="https://youtube.com/..." />
                <Field label="LinkedIn"   name="linkedin"  type="url" value={form.linkedin}  onChange={handleChange} placeholder="https://linkedin.com/..." />
              </div>
            </div>

            {/* Super admin account */}
            <div style={cardStyle}>
              <div style={sectionHeadStyle}><Briefcase size={14} /> Admin account</div>
              <Field label="Your name" name="name" value={form.name} onChange={handleChange} placeholder="Super admin display name" />
              <div style={{ ...sectionHeadStyle, marginTop: '8px' }}><Lock size={14} /> Change password</div>
              <Field label="New password"     name="password"              type="password" value={form.password}              onChange={handleChange} placeholder="Leave blank to keep current" />
              <Field label="Confirm password" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Repeat new password" />
            </div>

          </div>

          {/* Right column — business hours */}
          <div style={cardStyle}>
            <div style={sectionHeadStyle}><Clock size={14} /> Business hours</div>
            {DAYS.map(day => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', minWidth: '96px' }}>{day}</span>
                <input
                  value={hours[day] || ''}
                  onChange={handleHours(day)}
                  placeholder="08:00 – 17:00 or Closed"
                  style={{ ...inputStyle, fontSize: '13px', padding: '7px 10px' }}
                />
              </div>
            ))}
          </div>

        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', background: 'var(--gold)',
            border: 'none', borderRadius: '8px', color: '#000',
            fontWeight: 600, fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', opacity: saving ? 0.7 : 1,
          }}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}