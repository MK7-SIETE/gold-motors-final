import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div style={{position:'fixed',bottom:'24px',right:'20px',zIndex:9998,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'12px 16px',boxShadow:'var(--shadow-lg)',display:'flex',alignItems:'center',gap:'10px',minWidth:'260px',maxWidth:'380px'}}>
      {type === 'success' ? <CheckCircle size={18} style={{color:'var(--success)',flexShrink:0}} /> : <XCircle size={18} style={{color:'var(--danger)',flexShrink:0}} />}
      <span style={{fontSize:'14px',color:'var(--text-primary)',flex:1}}>{message}</span>
      <button onClick={onDismiss} style={{color:'var(--text-muted)',flexShrink:0}}><X size={16} /></button>
    </div>
  );
}
