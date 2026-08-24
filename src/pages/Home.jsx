import TestimonialsSection from '../components/TestimonialsSection';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, Clock, Award, Phone, Globe, CheckCircle, ChevronRight } from 'lucide-react';
import CarCard from '../components/CarCard';
import CarCardSkeleton from '../components/CarCardSkeleton';
import { api } from '../services/api';
import { useCachedFetch } from '../hooks/useCachedFetch';
import NewsletterSection from '../components/NewsletterSection';

const WHY_US = [
  { icon: Shield,       title: 'Verified stock',      desc: 'Every vehicle on our lot is inspected and verified before listing. No hidden surprises.' },
  { icon: Globe,        title: 'Import sourcing',     desc: 'We source vehicles from Japan, UAE, UK and beyond. Tell us what you want — we find it.' },
  { icon: Award,        title: 'Quality guaranteed',  desc: 'Premium pre-owned vehicles selected for condition, value, and reliability.' },
  { icon: Clock,        title: 'Fast service',        desc: 'Enquire today, get a response same day. Our team moves quickly for serious buyers.' },
  { icon: Phone,        title: 'Personal support',    desc: 'Speak directly with our team. No chatbots. Real people who know cars.' },
  { icon: CheckCircle,  title: 'Transparent pricing', desc: 'The price you see is the price you pay. No hidden fees, no last-minute surprises.' },
];

const IMPORT_STEPS = [
  { num: '1', title: 'Tell us your needs',  desc: 'Share the make, model, year and budget. We listen carefully.' },
  { num: '2', title: 'We source globally',  desc: 'We search Japan, UAE, UK and other markets for the best match.' },
  { num: '3', title: 'You approve',         desc: 'We present options with photos, specs and full landed cost.' },
  { num: '4', title: 'We handle the rest',  desc: 'Shipping, clearing, delivery. Handled by our experienced team.' },
];

const FILTERS = [
  { label: 'All',       href: '/inventory' },
  { label: 'SUV',       href: '/inventory?body_type=SUV' },
  { label: 'Sedan',     href: '/inventory?body_type=Sedan' },
  { label: 'Pickup',    href: '/inventory?body_type=Pickup' },
  { label: 'Hatchback', href: '/inventory?body_type=Hatchback' },
  { label: 'Petrol',    href: '/inventory?fuel=Petrol' },
  { label: 'Diesel',    href: '/inventory?fuel=Diesel' },
  { label: 'Automatic', href: '/inventory?transmission=Automatic' },
  { label: 'Manual',    href: '/inventory?transmission=Manual' },
];

const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&q=80',
];

const MOBILE_FALLBACK = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80';

export default function Home() {
  const [bgIndex, setBgIndex] = useState(0);
  const [query, setQuery]     = useState('');
  const [stats, setStats]     = useState({ available: 0 });
  const navigate = useNavigate();

  // Cached fetch for featured cars — shows cached data instantly on repeat
  // visits while a fresh copy loads quietly in the background.
  const { data: featuredCars, isLoading: featuredLoading } = useCachedFetch(
    'featured-cars',
    () => api.getFeatured().then(d => (Array.isArray(d) ? d.slice(0, 3) : [])),
    []
  );

  // Same pattern for hero images.
  const { data: heroImages } = useCachedFetch(
    'hero-images',
    () => api.getHeroImages().then(d => (Array.isArray(d) && d.length ? d.map(img => img.url) : DEFAULT_HERO_IMAGES)),
    DEFAULT_HERO_IMAGES
  );

  // Preload hero images before swapping them in, so the hero crossfades
  // instead of popping the moment the fetch resolves.
  const [readyHeroImages, setReadyHeroImages] = useState(DEFAULT_HERO_IMAGES);
  useEffect(() => {
    if (!heroImages?.length) return;
    let cancelled = false;
    Promise.all(heroImages.map(src => new Promise(res => {
      const img = new window.Image();
      img.onload = img.onerror = res;
      img.src = src;
    }))).then(() => { if (!cancelled) setReadyHeroImages(heroImages); });
    return () => { cancelled = true; };
  }, [heroImages]);

  useEffect(() => {
    const t = setInterval(() => setBgIndex(i => (i + 1) % readyHeroImages.length), 6000);
    return () => clearInterval(t);
  }, [readyHeroImages.length]);

  useEffect(() => {
    api.getCars({ per_page: 1 })
      .then(data => setStats({ available: data.total || data.length || 0 }))
      .catch(() => {});
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    navigate(query.trim() ? '/inventory?search=' + encodeURIComponent(query) : '/inventory');
  };

  const mobileImage = readyHeroImages[0] || MOBILE_FALLBACK;

  return (
    <>
      <section className="hero">
        {readyHeroImages.map((img, i) => (
          <div
            key={img}
            className="hero__bg"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${img})`,
              opacity: i === bgIndex ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
            }}
          />
        ))}
        <div className="hero__overlay" aria-hidden="true" />
        <div
          className="hero__mobile-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${mobileImage})` }}
        />

        <div className="container">
          <div className="hero__content animate-fade-in-up">
            <div className="hero__eyebrow"><span className="hero__eyebrow-line" />Lusaka, Zambia</div>
            <h1 className="hero__title">
              Find your perfect<br />
              <span className="hero__title-gold">pre-owned vehicle</span>
            </h1>
            <p className="hero__subtitle">
              Quality cars for every need and budget. Browse our verified inventory or let us source exactly what you want — from Zambia or abroad.
            </p>
            <form onSubmit={handleSearch} className="hero__search" role="search">
              <input
                type="text"
                className="hero__search-input"
                placeholder="Search by make, model or body type..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search vehicles"
              />
              <button type="submit" className="hero__search-btn">Search</button>
            </form>
            <div className="hero__actions">
              <Link to="/inventory" className="btn btn-primary btn-lg">Browse inventory <ArrowRight size={16} /></Link>
              <Link to="/source-a-car" className="btn btn-outline btn-lg">Source a car</Link>
            </div>
            <div className="hero__stats">
              <div><div className="hero__stat-num">{stats.available}+</div><div className="hero__stat-label">Cars available</div></div>
              <div><div className="hero__stat-num">100%</div><div className="hero__stat-label">Verified listings</div></div>
              <div><div className="hero__stat-num">4+</div><div className="hero__stat-label">Countries sourced</div></div>
            </div>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true"><span>Scroll</span><div className="hero__scroll-line" /></div>
      </section>

      <div className="filter-bar">
        <div className="container">
          <div className="filter-bar__inner">
            {FILTERS.map((f, i) => (
              <Link key={f.label} to={f.href} className={'filter-pill' + (i === 0 ? ' filter-pill--active' : '')}>
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'36px', flexWrap:'wrap', gap:'12px' }}>
            <div><span className="section-label">Our selection</span><h2 className="section-title">Featured vehicles</h2></div>
            <Link to="/inventory" className="btn btn-ghost btn-sm">View all <ChevronRight size={15} /></Link>
          </div>
          {featuredLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
              {[1, 2, 3].map(i => <CarCardSkeleton key={i} />)}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
              {featuredCars.map(car => <div key={car.id} className="card card-hover"><CarCard car={car} /></div>)}
            </div>
          )}
          <div style={{ textAlign:'center', marginTop:'32px' }}>
            <Link to="/inventory" className="btn btn-black">Browse all {stats.available} vehicles <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="import-banner">
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:'8px' }}>
            <span className="section-label">Import service</span>
            <h2 className="section-title" style={{ color:'#fff', marginBottom:'12px' }}>Can't find what you're looking for?</h2>
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.6)', maxWidth:'520px', margin:'0 auto', lineHeight:1.7 }}>We source vehicles directly from Japan, UAE, United Kingdom and other markets.</p>
          </div>
          <div className="import-steps">
            {IMPORT_STEPS.map(step => (
              <div key={step.num} className="import-step">
                <div className="import-step__num">{step.num}</div>
                <div className="import-step__title">{step.title}</div>
                <div className="import-step__desc">{step.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center' }}>
            <Link to="/source-a-car" className="btn btn-primary btn-lg">Request a vehicle <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background:'var(--bg-section)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'8px' }}>
            <span className="section-label">Why Mukuba Motors</span>
            <h2 className="section-title" style={{ marginBottom:'12px' }}>Built on trust and results</h2>
          </div>
          <div className="features-grid">
            {WHY_US.map(({ icon:Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-card__icon"><Icon size={20} /></div>
                <div className="feature-card__title">{title}</div>
                <div className="feature-card__desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <div style={{ background:'var(--gold-muted)', borderTop:'1px solid var(--gold-border)', borderBottom:'1px solid var(--gold-border)', padding:'14px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
          <Shield size={16} style={{ color:'var(--gold)', flexShrink:0 }} />
          <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.5 }}>
            <strong style={{ color:'var(--text-primary)' }}>No online payments accepted.</strong>{' '}
            All vehicle transactions are handled securely through our financial office.
          </p>
          <Link to="/contact" style={{ marginLeft:'auto', fontSize:'13px', color:'var(--gold)', fontWeight:500, display:'flex', alignItems:'center', gap:'4px' }}>
            Contact us <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Newsletter signup section */}
      <NewsletterSection />

      <section className="cta-section">
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <h2 className="cta-section__title">Ready to find your next vehicle?</h2>
          <p className="cta-section__sub">Visit our lot in Lusaka or reach out today.</p>
          <div className="cta-section__btns">
            <Link to="/inventory" className="btn btn-primary btn-lg">Browse inventory</Link>
            <Link to="/contact" className="btn btn-white btn-lg">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
