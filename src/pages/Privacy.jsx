import { Shield } from 'lucide-react';
function Sec({ title, children }) {
  return (
    <div style={{ marginBottom:'36px' }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'var(--text-primary)', marginBottom:'12px', paddingBottom:'8px', borderBottom:'1px solid var(--border)' }}>{title}</h2>
      <div style={{ fontSize:'15px', color:'var(--text-secondary)', lineHeight:1.8 }}>{children}</div>
    </div>
  );
}
export default function Privacy() {
  return (
    <div style={{ background:'var(--bg)' }}>
      <div style={{ background:'var(--black)', padding:'48px 0 36px' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
            <Shield size={18} style={{ color:'var(--gold)' }} />
            <span className="section-label" style={{ margin:0 }}>Legal</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,42px)', color:'#fff', marginBottom:'10px' }}>Privacy Policy</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>Last updated: January 2025</p>
        </div>
      </div>
      <div className="container section-sm" style={{ maxWidth:'780px' }}>
        <div className="card" style={{ padding:'40px' }}>
          <Sec title="1. Who we are"><p>Mukuba Motors Limited is a vehicle dealership based in Lusaka, Zambia. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website or contact us.</p></Sec>
          <Sec title="2. What information we collect">
            <p style={{ marginBottom:'10px' }}>We collect personal information only when you voluntarily provide it through our website forms. This includes:</p>
            <ul style={{ paddingLeft:'20px', display:'flex', flexDirection:'column', gap:'6px' }}>
              <li><strong>Contact and enquiry forms:</strong> your name, phone number, and email address.</li>
              <li><strong>Vehicle import requests:</strong> your name, phone, email, and vehicle preferences (make, model, year, budget).</li>
              <li><strong>Browsing data:</strong> we use browser localStorage to remember your cookie consent choice. This data stays on your device and is never sent to our servers.</li>
            </ul>
          </Sec>
          <Sec title="3. How we use your information">
            <ul style={{ paddingLeft:'20px', display:'flex', flexDirection:'column', gap:'6px' }}>
              <li>Respond to your enquiries about vehicles or our import service.</li>
              <li>Contact you with information relevant to your request.</li>
              <li>Improve our service based on the nature of enquiries we receive.</li>
            </ul>
            <p style={{ marginTop:'10px' }}>We do not use your information for marketing purposes without your explicit consent.</p>
          </Sec>
          <Sec title="4. Who we share your information with"><p>We do not sell, rent, or share your personal information with third parties for commercial purposes. Your information may be seen by our internal team members who handle enquiries. We do not use third-party marketing or data analytics platforms.</p></Sec>
          <Sec title="5. Cookies and local storage"><p>Our website uses browser localStorage (not tracking cookies) to store your cookie consent decision. No personal data is stored in localStorage. We display a cookie consent notice when you first visit. You may decline without affecting your ability to use the site.</p></Sec>
          <Sec title="6. Data retention"><p>Enquiry messages are stored securely and retained as long as necessary to serve your request and for our business records. Contact us to request removal of your information.</p></Sec>
          <Sec title="7. Your rights">
            <p style={{ marginBottom:'10px' }}>You have the right to request access to, correction of, or deletion of your personal data. Contact us at <strong>info@mukubamotors.zm</strong> or <strong>+260 97X XXX XXX</strong>.</p>
          </Sec>
          <Sec title="8. Security"><p>We take reasonable precautions to protect your personal information. Our website is served over HTTPS. Enquiry data is stored securely and accessible only to authorised staff.</p></Sec>
          <Sec title="9. Contact"><div style={{ marginTop:'12px', padding:'16px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', fontSize:'14px', lineHeight:2 }}><strong>Mukuba Motors Limited</strong><br />Plot 1234, Cairo Road, Lusaka, Zambia<br />Email: info@mukubamotors.zm<br />Phone: +260 97X XXX XXX</div></Sec>
        </div>
      </div>
    </div>
  );
}