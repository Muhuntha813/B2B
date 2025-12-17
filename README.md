# B2B Plastics SRM - Supply Chain Management Platform

A comprehensive B2B platform for plastic materials, machinery, and manufacturing services. This React-based application provides a complete supply chain management solution for the plastics industry.

## 🚀 Features

### Core Functionality
- **Materials Marketplace**: Browse and purchase plastic materials with advanced filtering
- **Machinery Trading**: Find and trade industrial plastic processing equipment
- **Job Board**: Post manufacturing jobs and connect with service providers
- **Mold Designers**: Directory of professional mold designers and manufacturers
- **Shopping Cart**: Full e-commerce functionality with localStorage persistence
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **React Router**: Client-side routing with dynamic pages
- **Context API**: Global state management for cart functionality
- **Search & Filters**: Advanced filtering and search capabilities
- **Pagination**: Efficient data presentation with pagination
- **Form Validation**: Multi-step forms with validation
- **Local Storage**: Persistent cart and user preferences

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS, Custom CSS
- **Icons**: Font Awesome
- **Build Tool**: Vite
- **Development**: ESLint, PostCSS, Autoprefixer

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd B2B-plastics-srm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Site footer
│   ├── SearchBar.jsx   # Search functionality
│   ├── ProductCard.jsx # Product display card
│   └── FilterSidebar.jsx # Filtering interface
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Materials.jsx   # Materials marketplace
│   ├── Machinery.jsx   # Machinery trading
│   ├── Jobs.jsx        # Job listings
│   ├── Moulds.jsx      # Mold designers
│   ├── Cart.jsx        # Shopping cart
│   ├── PostJob.jsx     # Job posting form
│   ├── ProductDetail.jsx # Product details
│   ├── MachineDetail.jsx # Machine details
│   └── JobDetail.jsx   # Job details
├── data/               # Mock data and datasets
│   ├── materials.js    # Materials dataset
│   ├── machines.js     # Machinery dataset
│   ├── jobs.js         # Jobs dataset
│   └── designers.js    # Designers dataset
├── context/            # React Context providers
│   └── CartContext.jsx # Cart state management
├── styles/             # CSS and styling
│   └── index.css       # Global styles and Tailwind
└── main.jsx           # Application entry point
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb)
- **Secondary**: Gray (#6b7280)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Primary Font**: Inter (body text)
- **Secondary Font**: Poppins (headings)

### Components
- **Cards**: Consistent card design with shadows
- **Buttons**: Primary, secondary, and outline variants
- **Forms**: Styled inputs with validation states
- **Navigation**: Responsive navigation with mobile menu

## 🔧 Configuration Files

- **vite.config.js**: Vite build configuration
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.js**: PostCSS plugins configuration
- **.eslintrc.cjs**: ESLint rules and configuration

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Key responsive features:
- Collapsible navigation menu
- Adaptive grid layouts
- Mobile-optimized filters
- Touch-friendly interactions

## 🛒 Cart Functionality

The shopping cart includes:
- Add/remove items
- Quantity management
- Price calculations
- Discount codes
- Shipping calculations
- GST calculations
- localStorage persistence

## 🔍 Search & Filtering

Advanced filtering options:
- **Materials**: Category, grade, price, location
- **Machinery**: Type, capacity, condition, price
- **Jobs**: Category, status, budget, location
- **Designers**: Specialization, availability, rate

## 📊 Mock Data

The application uses comprehensive mock datasets:
- **150+ Materials**: Various plastic types and grades
- **50+ Machines**: Industrial processing equipment
- **30+ Jobs**: Manufacturing opportunities
- **20+ Designers**: Professional mold designers

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 HTML/CSS Reuse Note

This React application was converted from existing HTML/CSS templates. The original styling and design patterns have been preserved and adapted for React components, ensuring consistency with the original design while adding modern React functionality and state management.

## Backend & API
- Backend server: Express with Socket.IO and PostgreSQL/SQLite-compatible adapter
- API base: `http://localhost:3001/api` by default
- Health: `GET /api/health` → `{ status: 'OK' }`
- Readiness: `GET /api/readyz` → `{ status: 'READY' }` when DB is connected

## Local Development
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`
- Configure `VITE_API_BASE_URL` in `frontend/.env` if backend runs elsewhere.

## Migrations & Seeding
- Migrations (runtime init via readiness): `npm run migrate --prefix backend`
- Seed demo data (backend must be running): `npm run seed --prefix backend`

## Testing
- Backend tests: `npm test --prefix backend`
- Includes health and readiness endpoint tests.

## CI/CD
- GitHub Actions workflow runs backend tests and builds frontend.
- See `.github/workflows/ci.yml` for steps and caching.

---

**Built with ❤️ for the plastics industry**
