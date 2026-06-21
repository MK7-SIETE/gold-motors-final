import { useSiteConfig } from '../context/SiteConfigContext';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, ChevronDown, Phone, Clock,
  Car, Search, Info, Mail, Globe, Star,
  Truck, ArrowRight, Shield, FileText
} from 'lucide-react';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  {
    label: 'Inventory', href: '/inventory',
    dropdown: [
      { group: 'Browse by type', items: [
        { label: 'All vehicles',    href: '/inventory',                     icon: Car,    desc: 'View our full stock'      },
        { label: 'SUVs',            href: '/inventory?body_type=SUV',       icon: Car,    desc: 'Family & off-road'        },
        { label: 'Sedans',          href: '/inventory?body_type=Sedan',     icon: Car,    desc: 'Comfort & style'          },
        { label: 'Pickups',         href: '/inventory?body_type=Pickup',    icon: Truck,  desc: 'Work & adventure'         },
        { label: 'Hatchbacks',      href: '/inventory?body_type=Hatchback', icon: Car,    desc: 'City & economy'           },
      ]},
      { group: 'Quick find', items: [
        { label: 'Featured cars',   href: '/inventory?featured=true',       icon: Star,   desc: 'Handpicked by our team'   },
        { label: 'Search by make',  href: '/inventory',                     icon: Search, desc: 'Toyota, BMW, Mercedes...' },
      ]},
    ],
  },
  {
    label: 'Source a car', href: '/source-a-car',
    dropdown: [
      { group: 'Import service', items: [
        { label: 'How it works',      href: '/source-a-car#how-it-works', icon: Info,     desc: 'Step by step process'      },
        { label: 'Request a vehicle', href: '/source-a-car#request',      icon: Globe,    desc: 'Tell us what you want'     },
        { label: 'Import guide',      href: '/source-a-car#guide',        icon: FileText, desc: 'Costs, timelines & duties' },
      ]},
    ],
  },
  {
    label: 'Company', href: '/about',
    dropdown: [
      { group: 'About us', items: [
        { label: 'Our story',  href: '/about',   icon: Shield, desc: 'Who we are & our values' },
        { label: 'Contact us', href: '/contact', icon: Mail,   desc: 'Get in touch today'       },
      ]},
      { group: 'Legal', items: [
        { label: 'Privacy policy',     href: '/privacy', icon: FileText, desc: 'How we handle your data' },
        { label: 'Terms & conditions', href: '/terms',   icon: FileText, desc: 'Platform usage terms'    },
      ]},
    ],
  },
];

/* ── Dropdown ─────────────────────────────────────── */
function Dropdown({ item, onClose, alignRight }) {
  return (
    <div
      className="nav-dropdown animate-fade-in"
      role="menu"
      style={alignRight ? { left: 'auto', right: 0, transform: 'none' } : {}}
    >
      <div className="nav-dropdown__inner">
        {item.dropdown.map((group, gi) => (
          <div key={gi} className="nav-dropdown__group">
            <p className="nav-dropdown__group-label">{group.group}</p>
            {group.items.map((sub, si) => {
              const Icon = sub.icon;
              return (
                <Link
                  key={si}
                  to={sub.href}
                  className="nav-dropdown__item"
                  onClick={onClose}
                  role="menuitem"
                >
                  <div className="nav-dropdown__icon"><Icon size={15} /></div>
                  <div>
                    <span className="nav-dropdown__item-label">{sub.label}</span>
                    <span className="nav-dropdown__item-desc">{sub.desc}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mobile accordion ─────────────────────────────── */
function MobileNavItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === item.href;

  if (!item.dropdown) {
    return (
      <Link
        to={item.href}
        className={`mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`}
        onClick={onClose}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        className={`mobile-nav__trigger ${open ? 'mobile-nav__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={16}
          className={`mobile-nav__chevron ${open ? 'mobile-nav__chevron--up' : ''}`}
        />
      </button>
      {open && (
        <div className="mobile-nav__sub">
          {item.dropdown.map((group, gi) => (
            <div key={gi}>
              <p className="mobile-nav__group-label">{group.group}</p>
              {group.items.map((sub, si) => {
                const Icon = sub.icon;
                return (
                  <Link
                    key={si}
                    to={sub.href}
                    className="mobile-nav__sub-link"
                    onClick={onClose}
                  >
                    <Icon size={14} />{sub.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Navbar ──────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled]             = useState(false);
  const location                            = useLocation();
  const navRef                              = useRef(null);
  const timerRef                            = useRef(null);

  const cfg      = useSiteConfig();
  const topPhone = cfg.phone || '+260 97X XXX XXX';
  const topHours = (() => {
    try {
      const h = typeof cfg.hours === 'string' ? JSON.parse(cfg.hours) : cfg.hours;
      if (h && typeof h === 'object') {
        const entries = Object.entries(h);
        const mon = entries.find(([d]) => d === 'Monday');
        const sat = entries.find(([d]) => d === 'Saturday');
        if (mon && sat) return `Mon – Sat: ${mon[1]}`;
        if (entries.length) return `${entries[0][0]}: ${entries[0][1]}`;
      }
    } catch {}
    return 'Mon – Sat: 08:00 – 17:00';
  })();
  const companyName = cfg.dealership_name || 'Gold Motors General Dealers Ltd';

  useEffect(() => { setMobileOpen(false); setActiveDropdown(null); }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = e => { if (navRef.current && !navRef.current.contains(e.target)) setActiveDropdown(null); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = item =>
    location.pathname === item.href ||
    item.dropdown?.some(g => g.items.some(s => location.pathname === s.href));

  const enter = label => { clearTimeout(timerRef.current); setActiveDropdown(label); };
  const leave = ()    => { timerRef.current = setTimeout(() => setActiveDropdown(null), 130); };

  return (
    <>
      {/* Top info bar */}
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__left">
            <Phone size={12} />
            <a href={`tel:${topPhone.replace(/\s/g, '')}`} className="topbar__link">{topPhone}</a>
            <span className="topbar__sep">·</span>
            <Clock size={12} />
            <span>{topHours}</span>
          </div>
          <div className="topbar__right">
            <span className="topbar__company">{companyName}</span>
            <Link to="/contact" className="topbar__cta">
              Enquire now <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header ref={navRef} className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo" aria-label="Gold Motors home">
            <img
              src={logo}
              alt="Gold Motors General Dealers Limited"
              className="navbar__logo-img"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="navbar__desktop" aria-label="Main navigation">
            {NAV_ITEMS.map((item, idx) => {
              const alignRight = idx === NAV_ITEMS.length - 1;
              return (
                <div
                  key={item.label}
                  className="nav-item"
                  onMouseEnter={() => item.dropdown && enter(item.label)}
                  onMouseLeave={() => item.dropdown && leave()}
                >
                  {item.dropdown ? (
                    <button
                      className={`nav-item__btn ${isActive(item) ? 'nav-item__btn--active' : ''}`}
                      aria-expanded={activeDropdown === item.label}
                      onClick={() => setActiveDropdown(a => a === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={`nav-item__chevron ${activeDropdown === item.label ? 'nav-item__chevron--up' : ''}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`nav-item__btn ${isActive(item) ? 'nav-item__btn--active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  )}

                  {item.dropdown && activeDropdown === item.label && (
                    <Dropdown
                      item={item}
                      onClose={() => setActiveDropdown(null)}
                      alignRight={alignRight}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="navbar__controls">
            <Link to="/contact" className="btn btn-primary navbar__cta-btn">
              Enquire now
            </Link>
            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav animate-fade-in" role="navigation" aria-label="Mobile navigation">
          <div className="mobile-nav__inner">
            {NAV_ITEMS.map(item => (
              <MobileNavItem key={item.label} item={item} onClose={() => setMobileOpen(false)} />
            ))}
            <div className="mobile-nav__divider" />
            <div className="mobile-nav__contact">
              <a href={`tel:${topPhone.replace(/\s/g, '')}`} className="mobile-nav__contact-link">
                <Phone size={14} />{topPhone}
              </a>
              <span className="mobile-nav__contact-link">
                <Clock size={14} />{topHours}
              </span>
            </div>
            <Link
              to="/contact"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              onClick={() => setMobileOpen(false)}
            >
              Enquire now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
      {mobileOpen && (
        <div
          className="mobile-nav__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}