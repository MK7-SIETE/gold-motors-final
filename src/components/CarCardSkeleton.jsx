export default function CarCardSkeleton() {
  return (
    <div className="car-card car-card--skeleton">
      <div className="car-card__image-wrap">
        <div className="skeleton-block skeleton-block--image" />
      </div>
      <div className="car-card__body">
        <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
        <div className="skeleton-block" style={{ width: '70%', height: 18, marginTop: 8 }} />
        <div className="skeleton-block" style={{ width: '50%', height: 16, marginTop: 8 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div className="skeleton-block skeleton-block--pill" />
          <div className="skeleton-block skeleton-block--pill" />
          <div className="skeleton-block skeleton-block--pill" />
        </div>
      </div>
    </div>
  );
}
