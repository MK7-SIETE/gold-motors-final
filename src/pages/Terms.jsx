import { FileText } from 'lucide-react';
function Sec({ title, children }) {
  return (
    <div style={{ marginBottom:'36px' }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'var(--text-primary)', marginBottom:'12px', paddingBottom:'8px', borderBottom:'1px solid var(--border)' }}>{title}</h2>
      <div style={{ fontSize:'15px', color:'var(--text-secondary)', lineHeight:1.8 }}>{children}</div>
    </div>
  );
}
export default function Terms() {
  return (
    <div style={{ background:'var(--bg)' }}>
      <div style={{ background:'var(--black)', padding:'48px 0 36px' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
            <FileText size={18} style={{ color:'var(--gold)' }} />
            <span className="section-label" style={{ margin:0 }}>Legal</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,42px)', color:'#fff', marginBottom:'10px' }}>Terms & Conditions</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>Last updated: January 2025</p>
        </div>
      </div>
      <div className="container section-sm" style={{ maxWidth:'780px' }}>
        <div className="card" style={{ padding:'40px' }}>
          <Sec title="1. Acceptance of terms"><p>By accessing and using the Gold Motors General Dealers Limited website, you accept these Terms and Conditions. If you do not agree, please do not use this website.</p></Sec>
          <Sec title="2. About Gold Motors"><p>Gold Motors General Dealers Limited is a vehicle dealership registered and operating in Lusaka, Zambia. This website is an information and enquiry platform for prospective vehicle buyers.</p></Sec>
          <Sec title="3. Vehicle listings and pricing">
            <ul style={{ paddingLeft:'20px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <li>All vehicle listings are for information purposes only and do not constitute a binding offer to sell.</li>
              <li>Prices listed are subject to change without notice. Please contact us to confirm the current price of any vehicle.</li>
              <li>Vehicle availability is subject to change. A vehicle listed as available may have been sold since the listing was last updated.</li>
              <li>All vehicle descriptions and images are provided in good faith. We encourage buyers to inspect vehicles in person before making a purchase decision.</li>
            </ul>
          </Sec>
          <Sec title="4. No online payments"><p>Gold Motors does not accept online payments through this website. All vehicle transactions — including deposits and full payments — are processed exclusively through our financial office in person. Any communication requesting online payment should be treated as fraudulent. Contact us directly if you have concerns.</p></Sec>
          <Sec title="5. Import sourcing service"><p>Our vehicle import sourcing service is subject to separate terms agreed at the time of commissioning. Factors including import duties, freight costs, exchange rates, and availability are variable and may affect the final landed cost. We provide full cost estimates before any commitment is made.</p></Sec>
          <Sec title="6. Enquiry forms"><p>Submitting an enquiry does not create a binding contract, reservation, or purchase agreement. It is a request for information or contact only.</p></Sec>
          <Sec title="7. Intellectual property"><p>All content on this website — including text, design, layout, images, and the Gold Motors logo — is the intellectual property of Gold Motors General Dealers Limited or its licensors. You may not reproduce or use any content without prior written permission.</p></Sec>
          <Sec title="8. Limitation of liability"><p>Gold Motors accepts no liability for errors, omissions, or outdated information on this website, nor for any loss or damage arising from reliance on information published here.</p></Sec>
          <Sec title="9. Governing law"><p>These Terms and Conditions are governed by the laws of the Republic of Zambia.</p></Sec>
          <Sec title="10. Contact"><div style={{ marginTop:'12px', padding:'16px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', fontSize:'14px', lineHeight:2 }}><strong>Gold Motors General Dealers Limited</strong><br />Plot 1234, Cairo Road, Lusaka, Zambia<br />Email: info@goldmotors.zm</div></Sec>
        </div>
      </div>
    </div>
  );
}