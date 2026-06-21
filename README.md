# Gold Motors — Frontend

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

## Project structure

```
gold-motors/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx              Entry point
    ├── App.jsx               Routing
    ├── index.css             All styles + color system
    ├── context/
    │   └── AuthContext.jsx   Login state (dealer + super admin)
    ├── data/
    │   └── store.js          Mock data (replace with Laravel API)
    ├── components/
    │   ├── Navbar.jsx        Top bar + nav + dropdowns + mobile menu
    │   ├── Footer.jsx        Footer with links and legal notice
    │   ├── CarCard.jsx       Car listing card
    │   ├── Toast.jsx         Notification popup
    │   └── CookieBanner.jsx  Cookie consent
    └── pages/
        ├── Home.jsx
        ├── Inventory.jsx
        ├── CarDetail.jsx
        ├── SourceACar.jsx
        ├── About.jsx
        ├── Contact.jsx
        ├── Privacy.jsx
        ├── Terms.jsx
        ├── NotFound.jsx
        ├── admin/            Dealer admin panel
        │   ├── AdminLogin.jsx
        │   ├── AdminLayout.jsx
        │   ├── Dashboard.jsx
        │   ├── CarsManager.jsx
        │   ├── AddEditCar.jsx
        │   ├── Messages.jsx
        │   ├── Analytics.jsx
        │   └── Profile.jsx
        └── super/            Super admin (hidden)
            ├── SuperLogin.jsx
            ├── SuperLayout.jsx
            └── SuperDash.jsx
```

## Routes

| URL | Page |
|-----|------|
| / | Home |
| /inventory | All cars |
| /inventory/:id | Car detail |
| /source-a-car | Import service |
| /about | About us |
| /contact | Contact |
| /privacy | Privacy policy |
| /terms | Terms & conditions |
| /dealer/login | Dealer login |
| /dealer/dashboard | Dealer panel |
| /gm-x9k2-control | Super admin login (hidden) |

## Color system

All colors are CSS variables in index.css.
To change the brand color, edit `--gold` in `:root`.
Dark mode toggles via `data-theme="dark"` on `<html>`.

## Notes

- All pages marked "Coming next" are placeholder stubs — built one by one in subsequent sessions
- store.js uses mock data — replace each method with a real fetch() call to your Laravel API
- Super admin URL `/gm-x9k2-control` is intentionally obscure — do not link to it anywhere on the site
