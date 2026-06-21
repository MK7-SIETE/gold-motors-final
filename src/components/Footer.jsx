import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import logo from '../assets/logo.png';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const cfg  = useSiteConfig();

  const phone   = cfg.phone   || '+260 97X XXX XXX';
  const email   = cfg.email   || 'info@goldmotors.zm';
  const address = [cfg.address, cfg.city, cfg.country].filter(Boolean).join(', ') || 'Lusaka, Zambia';
  const hours   = (() => {
    try {
      const h = typeof cfg.hours === 'string' ? JSON.parse(cfg.hours) : cfg.hours;
      if (h && typeof h === 'object') {
        const days = Object.entries(h);
        if (days.length) return days[0][1]; // show first day as summary
      }
    } catch {}
    return 'Mon – Sat: 08:00 – 17:00';
  })();

  const socials = [
    { Icon: Facebook,  href: cfg.facebook  },
    { Icon: Instagram, href: cfg.instagram },
    { Icon: Twitter,   href: cfg.twitter   },
    { Icon: Youtube,   href: cfg.youtube   },
    { Icon: Linkedin,  href: cfg.linkedin  },
  ].filter(s => s.href);

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">

            {/* Brand */}
            <div>
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={logo}
                  alt="Gold Motors"
                  style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <p className="footer__tagline">
                {cfg.about
                  ? cfg.about.slice(0, 160) + (cfg.about.length > 160 ? '…' : '')
                  : 'Quality pre-owned vehicles and import sourcing in Zambia. All transactions handled securely through our financial office — no online payments accepted.'}
              </p>
              {socials.length > 0 && (
                <div className="footer__social">
                  {socials.map(({ Icon, href }, i) => (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Social">
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div>
              <p className="footer__col-title">Quick links</p>
              {[['Home','/'],['Inventory','/inventory'],['Source a car','/source-a-car'],['About us','/about'],['Contact','/contact']].map(([l, h]) => (
                <Link key={h} to={h} className="footer__link">{l}</Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p className="footer__col-title">Contact us</p>
              <div className="footer__contact-item"><MapPin size={14} /><span>{address}</span></div>
              <div className="footer__contact-item">
                <Phone size={14} />
                <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ color: 'inherit' }}>{phone}</a>
              </div>
              <div className="footer__contact-item">
                <Mail size={14} />
                <a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a>
              </div>
              <div className="footer__contact-item"><Clock size={14} /><span>{hours}</span></div>
            </div>

            {/* Legal */}
            <div>
              <p className="footer__col-title">Legal</p>
              <Link to="/privacy" className="footer__link">Privacy policy</Link>
              <Link to="/terms" className="footer__link">Terms & conditions</Link>
              <div className="footer__disclaimer">
                All vehicle prices and availability are subject to change without notice. Listings are for information purposes only and do not constitute a binding offer.
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="container">
        <div className="footer__bottom">
          <p className="footer__copy">© {year} {cfg.dealership_name || 'Gold Motors General Dealers Ltd'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}