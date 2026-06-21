import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import logo from '../../assets/logo.png';

export default function AdminLogin() {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { dealerLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.dealerLogin({ email, password: pass });
      dealerLogin(data);
      navigate('/dealer/dashboard');
    } catch (err) {
      setError(err?.errors?.email?.[0] || err?.message || 'Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <img src={logo} alt="Gold Motors" />
        <h1>Dealer Portal</h1>
        <p className="subtitle">Sign in to manage your listings</p>
        {error && <div className="admin-login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" value={email} required autoFocus
              onChange={e => setEmail(e.target.value)}
              placeholder="you@goldmotors.zm" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={pass} required
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width:'100%', justifyContent:'center', marginTop:'8px' }}
            disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:'20px' }}>
          Gold Motors General Dealers Ltd · Staff access only
        </p>
      </div>
    </div>
  );
}
