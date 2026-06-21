import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{const a=localStorage.getItem('gm-cookies');if(!a)setTimeout(()=>setVisible(true),1400);},[]);
  const accept  = ()=>{localStorage.setItem('gm-cookies','accepted'); setVisible(false);};
  const decline = ()=>{localStorage.setItem('gm-cookies','declined'); setVisible(false);};
  if(!visible) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div style={{display:'flex',alignItems:'flex-start',gap:'10px',flex:1}}>
        <Cookie size={16} style={{color:'var(--gold)',flexShrink:0,marginTop:'2px'}}/>
        <p style={{fontSize:'13px',lineHeight:1.5}}>We use cookies to improve your experience.{' '}<Link to="/privacy" style={{color:'var(--gold)',textDecoration:'underline'}}>Learn more</Link></p>
      </div>
      <div style={{display:'flex',gap:'8px',flexShrink:0}}>
        <button onClick={decline} style={{padding:'7px 14px',borderRadius:'6px',fontSize:'12px',fontWeight:500,border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.6)',background:'transparent',cursor:'pointer',fontFamily:'var(--font-body)'}}>Decline</button>
        <button onClick={accept}  style={{padding:'7px 16px',borderRadius:'6px',fontSize:'12px',fontWeight:600,background:'var(--gold)',color:'var(--black)',border:'none',cursor:'pointer',fontFamily:'var(--font-body)'}}>Accept</button>
      </div>
    </div>
  );
}