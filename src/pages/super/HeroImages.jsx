import { useState, useEffect } from 'react';
import { Upload, Trash2, GripVertical, ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function HeroImages() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.getHeroImages()
      .then(data => setImages(Array.isArray(data) ? data : []))
      .catch(() => showToast('Could not load images. Is the server running?', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleFiles = async (files) => {
    const allowed = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!allowed.length) { showToast('Please select image files only.', 'error'); return; }
    if (images.length + allowed.length > 6) { showToast('Maximum 6 hero images allowed.', 'error'); return; }
    setUploading(true);
    try {
      for (const file of allowed) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.uploadHeroImage(fd);
        setImages(prev => [...prev, res]);
      }
      showToast('Image(s) uploaded successfully.');
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hero image?')) return;
    try {
      await api.deleteHeroImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
      showToast('Image deleted.');
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:9999, background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)', color:'#fff', padding:'12px 18px', borderRadius:'var(--radius-md)', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px', boxShadow:'var(--shadow-lg)' }}>
          {toast.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', marginBottom:'4px' }}>Hero slideshow</h1>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Upload up to 6 images that cycle through the homepage hero. Recommended size: 1600×900px.</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{ border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--border)'}`, borderRadius:'var(--radius-lg)', padding:'40px 24px', textAlign:'center', background: dragOver ? 'var(--gold-muted)' : 'var(--bg-card)', transition:'all 0.18s', marginBottom:'28px', cursor:'pointer' }}
        onClick={() => document.getElementById('hero-file-input').click()}
      >
        <ImageIcon size={32} style={{ color:'var(--text-muted)', margin:'0 auto 12px' }}/>
        <p style={{ fontSize:'15px', fontWeight:500, color:'var(--text-primary)', marginBottom:'6px' }}>
          {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
        </p>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>JPG, PNG, WebP · Max 5MB each · Up to {6 - images.length} more</p>
        <input id="hero-file-input" type="file" accept="image/*" multiple style={{ display:'none' }}
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Images grid */}
      {loading ? (
        <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>Loading images...</p>
      ) : images.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', color:'var(--text-muted)' }}>
          <ImageIcon size={40} style={{ margin:'0 auto 12px', opacity:0.3 }}/>
          <p style={{ fontSize:'14px' }}>No hero images yet. Upload your first image above.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'16px' }}>
          {images.map((img, i) => (
            <div key={img.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', position:'relative' }}>
              <div style={{ position:'relative', height:'160px', background:'var(--bg-elevated)' }}>
                <img src={img.url} alt={`Hero ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                <div style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:'11px', fontWeight:600, padding:'3px 8px', borderRadius:'4px' }}>
                  Slide {i + 1}
                </div>
              </div>
              <div style={{ padding:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)', fontSize:'12px' }}>
                  <GripVertical size={14}/>
                  <span>{img.filename || `image-${i+1}`}</span>
                </div>
                <button onClick={() => handleDelete(img.id)}
                  style={{ width:'28px', height:'28px', borderRadius:'6px', border:'1px solid var(--border)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop:'20px', fontSize:'12px', color:'var(--text-muted)', padding:'12px', background:'var(--gold-muted)', border:'1px solid var(--gold-border)', borderRadius:'var(--radius-md)' }}>
        💡 Images cycle automatically every 6 seconds on the homepage. Changes take effect immediately after upload.
      </p>
    </div>
  );
}