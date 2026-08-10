import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';
export default function NotFound() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', textAlign:'center', background:'var(--bg)' }}>
      <img src={logo} alt="Mukuba Motors" style={{ height:'60px', objectFit:'contain', mixBlendMode:'multiply', marginBottom:'28px' }} />
      <AlertCircle size={48} style={{ color:'var(--text-muted)', marginBottom:'16px' }} />
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,48px)', marginBottom:'10px' }}>Page not found</h1>
      <p style={{ color:'var(--text-muted)', fontSize:'16px', maxWidth:'400px', lineHeight:1.7, marginBottom:'28px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center' }}>
        <Link to="/" className="btn btn-black">Back to home</Link>
        <Link to="/inventory" className="btn btn-outline">Browse inventory <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}