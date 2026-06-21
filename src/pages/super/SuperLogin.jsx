import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function SuperLogin() {
  const [email, setEmail]     = useState('');
  const [pass,  setPass]      = useState('');
  const [show,  setShow]      = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { superLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await api.superLogin({ email, password: pass });
      superLogin(data);
      navigate('/gm-x9k2-control/panel');
    } catch (err) {
      setError(err.errors?.email?.[0] || err.message || 'Access denied.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#050504', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'340px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(232,184,0,0.08)', border:'1px solid rgba(232,184,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Shield size={22} style={{ color:'var(--gold)' }}/>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'#fff', marginBottom:'6px' }}>Platform access</h1>
          <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'13px' }}>Restricted area</p>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'var(--radius-lg)', padding:'28px' }}>
          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#fca5a5' }}>
              <AlertCircle size={14}/>{error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.35)', marginBottom:'6px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Access key</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#fff' }}/>
            </div>
            <div className="form-group" style={{ marginTop:'14px', position:'relative' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'rgba(255,255,255,0.35)', marginBottom:'6px', letterSpacing:'0.06em', textTransform:'uppercase' }}>Passphrase</label>
              <input className="input" type={show?'text':'password'} value={pass} onChange={e => setPass(e.target.value)} required
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', paddingRight:'44px' }}/>
              <button type="button" onClick={() => setShow(s => !s)} style={{ position:'absolute', right:'12px', bottom:'10px', color:'rgba(255,255,255,0.25)', background:'none', border:'none', cursor:'pointer' }}>
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px', marginTop:'18px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
