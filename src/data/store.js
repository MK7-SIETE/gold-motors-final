// Mock store — replace all methods with real Laravel API calls when backend is ready
// Each method is commented with its intended endpoint

export const formatPrice = (amount) =>
  `K ${Number(amount).toLocaleString('en-ZM')}`;

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const CARS = [
  { id: '1', make: 'Toyota', model: 'Land Cruiser V8', year: 2020, price: 285000, mileage: 45000, fuel: 'Diesel', transmission: 'Automatic', color: 'White', bodyType: 'SUV', condition: 'Foreign Used', engine: '4.5L V8', power: '232hp', torque: '650Nm', seats: 7, doors: 4, drive: '4WD', description: 'Immaculate Land Cruiser V8 in excellent condition. Full service history. All original parts.', features: ['Leather seats', 'Sunroof', 'Reverse camera', 'Cruise control', 'Climate control'], featured: true, available: true, images: [], createdAt: '2025-01-10T10:00:00Z' },
  { id: '2', make: 'BMW', model: 'X5 xDrive40i', year: 2021, price: 420000, mileage: 32000, fuel: 'Petrol', transmission: 'Automatic', color: 'Black', bodyType: 'SUV', condition: 'Foreign Used', engine: '3.0L Inline-6', power: '340hp', torque: '450Nm', seats: 5, doors: 4, drive: 'AWD', description: 'Stunning BMW X5 with M-Sport package. Full options including panoramic roof and Harman Kardon sound.', features: ['M-Sport package', 'Panoramic roof', 'Harman Kardon', 'Head-up display', 'Adaptive cruise'], featured: true, available: true, images: [], createdAt: '2025-01-08T10:00:00Z' },
  { id: '3', make: 'Mercedes-Benz', model: 'C300 AMG Line', year: 2019, price: 390000, mileage: 61000, fuel: 'Petrol', transmission: 'Automatic', color: 'Silver', bodyType: 'Sedan', condition: 'Foreign Used', engine: '2.0L Turbo', power: '258hp', torque: '400Nm', seats: 5, doors: 4, drive: 'RWD', description: 'Elegant Mercedes C300 AMG Line with full options. Perfect condition inside and out.', features: ['AMG body kit', 'Burmester sound', 'Memory seats', 'LED headlights', 'Keyless entry'], featured: false, available: true, images: [], createdAt: '2025-01-06T10:00:00Z' },
  { id: '4', make: 'Toyota', model: 'Hilux Double Cab', year: 2018, price: 195000, mileage: 88000, fuel: 'Diesel', transmission: 'Manual', color: 'Silver', bodyType: 'Pickup', condition: 'Foreign Used', engine: '2.8L D-4D', power: '177hp', torque: '450Nm', seats: 5, doors: 4, drive: '4WD', description: 'Reliable Hilux in great working condition. Perfect for both business and adventure.', features: ['Canopy', 'Tow bar', 'Bull bar', 'Diff lock', 'Cruise control'], featured: false, available: true, images: [], createdAt: '2025-01-04T10:00:00Z' },
  { id: '5', make: 'Volkswagen', model: 'Polo Vivo', year: 2022, price: 85000, mileage: 18000, fuel: 'Petrol', transmission: 'Manual', color: 'Red', bodyType: 'Hatchback', condition: 'Local Used', engine: '1.4L', power: '85hp', torque: '132Nm', seats: 5, doors: 4, drive: 'FWD', description: 'Near-new Polo Vivo with low mileage. Perfect city car with great fuel economy.', features: ['Bluetooth', 'USB', 'Electric windows', 'ABS', 'Airbags'], featured: false, available: true, images: [], createdAt: '2025-01-02T10:00:00Z' },
  { id: '6', make: 'Land Rover', model: 'Discovery Sport', year: 2020, price: 320000, mileage: 52000, fuel: 'Diesel', transmission: 'Automatic', color: 'Blue', bodyType: 'SUV', condition: 'Foreign Used', engine: '2.0L Ingenium', power: '204hp', torque: '430Nm', seats: 7, doors: 4, drive: 'AWD', description: 'Sophisticated Discovery Sport with 7 seats and full options. Ready for any terrain.', features: ['7 seats', 'Terrain response', 'Meridian sound', 'Pano roof', 'Adaptive dynamics'], featured: true, available: true, images: [], createdAt: '2024-12-28T10:00:00Z' },
];

const MESSAGES = [
  { id: '1', name: 'Mwansa Chilufya', email: 'mwansa@email.com', phone: '+260 97 123 4567', subject: 'Enquiry about Land Cruiser', message: 'Good morning, I am interested in the Toyota Land Cruiser V8. Is it still available and can I arrange a viewing?', carId: '1', read: false, createdAt: '2025-01-12T08:30:00Z' },
  { id: '2', name: 'Grace Banda', email: 'grace.banda@email.com', phone: '+260 96 987 6543', subject: 'Import request — Toyota Prado', message: 'Hello, I would like to source a Toyota Prado 2022 from Japan. My budget is K250,000. Please advise on the process and timeline.', carId: null, read: false, createdAt: '2025-01-11T14:15:00Z' },
  { id: '3', name: 'David Phiri', email: 'd.phiri@company.zm', phone: '+260 95 555 0101', subject: 'BMW X5 — test drive', message: 'I am interested in the BMW X5. Can I schedule a test drive this Saturday morning?', carId: '2', read: true, createdAt: '2025-01-10T11:00:00Z' },
];

class Store {
  // GET /api/cars
  getCars(filters = {}) {
    let cars = [...CARS];
    if (filters.bodyType) cars = cars.filter(c => c.bodyType.toLowerCase() === filters.bodyType.toLowerCase());
    if (filters.fuel) cars = cars.filter(c => c.fuel.toLowerCase() === filters.fuel.toLowerCase());
    if (filters.transmission) cars = cars.filter(c => c.transmission.toLowerCase() === filters.transmission.toLowerCase());
    if (filters.featured) cars = cars.filter(c => c.featured);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      cars = cars.filter(c => `${c.make} ${c.model}`.toLowerCase().includes(q));
    }
    return cars.filter(c => c.available);
  }

  // GET /api/cars/:id
  getCar(id) { return CARS.find(c => c.id === id) || null; }

  // POST /api/cars
  addCar(data) {
    const car = { ...data, id: String(Date.now()), createdAt: new Date().toISOString(), images: [] };
    CARS.push(car); return car;
  }

  // PUT /api/cars/:id
  updateCar(id, data) {
    const idx = CARS.findIndex(c => c.id === id);
    if (idx === -1) return null;
    CARS[idx] = { ...CARS[idx], ...data };
    return CARS[idx];
  }

  // DELETE /api/cars/:id
  deleteCar(id) {
    const idx = CARS.findIndex(c => c.id === id);
    if (idx === -1) return false;
    CARS.splice(idx, 1); return true;
  }

  // GET /api/messages
  getMessages() { return [...MESSAGES].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }

  // POST /api/messages
  addMessage(data) {
    const msg = { ...data, id: String(Date.now()), read: false, createdAt: new Date().toISOString() };
    MESSAGES.push(msg); return msg;
  }

  // PUT /api/messages/:id/read
  markRead(id) {
    const msg = MESSAGES.find(m => m.id === id);
    if (msg) msg.read = true; return msg;
  }

  // DELETE /api/messages/:id
  deleteMessage(id) {
    const idx = MESSAGES.findIndex(m => m.id === id);
    if (idx === -1) return false;
    MESSAGES.splice(idx, 1); return true;
  }

  // Stats for dashboard
  getStats() {
    return {
      total: CARS.length,
      available: CARS.filter(c => c.available).length,
      sold: CARS.filter(c => !c.available).length,
      unread: MESSAGES.filter(m => !m.read).length,
      featured: CARS.filter(c => c.featured).length,
    };
  }
}

export const store = new Store();
