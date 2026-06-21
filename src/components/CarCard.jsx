import { Link } from 'react-router-dom';
import { Fuel, Gauge, Settings } from 'lucide-react';

function formatPrice(amount) {
  return 'K ' + Number(amount).toLocaleString('en-ZM');
}

export default function CarCard({ car }) {
  const firstImage = car.images?.[0]?.url || null;

  return (
    <Link to={'/inventory/' + car.id} className="car-card">
      <div className="car-card__image-wrap">
        {firstImage
          ? <img src={firstImage} alt={car.make + ' ' + car.model} className="car-card__image"/>
          : <div className="car-card__placeholder">🚗</div>
        }
        <div className="car-card__badge-wrap">
          {car.is_featured && <span className="badge badge-gold">Featured</span>}
        </div>
      </div>
      <div className="car-card__body">
        <p className="car-card__meta">{car.year} · {car.condition}</p>
        <h3 className="car-card__name">{car.make} {car.model}</h3>
        <p className="car-card__price">{formatPrice(car.price)}</p>
        <div className="car-card__specs">
          <span className="badge badge-muted"><Gauge size={11}/>{Number(car.mileage).toLocaleString()} km</span>
          <span className="badge badge-muted"><Fuel size={11}/>{car.fuel}</span>
          <span className="badge badge-muted"><Settings size={11}/>{car.transmission}</span>
        </div>
      </div>
    </Link>
  );
}