# 🎓 University Finder

A comprehensive Next.js application for discovering and exploring universities with advanced search, filtering, data visualization, and intelligent data parsing capabilities. Features modern UI design, clickable links, formatted data display, and comprehensive analytics.

## ✨ Features

### 🔍 Advanced Search & Filtering
- **Debounced multi-field search** across university names, locations, programs, and admission criteria
- **Faceted filters** with country dropdown and ranking range sliders
- **Real-time search highlighting** with matched terms highlighted in table cells
- **Smart search suggestions** based on available data

### 📊 Comprehensive Data Table
- **Complete dataset display** with all university information
- **Column sorting** (ascending/descending) for all data fields
- **Client-side pagination** with configurable page sizes
- **Responsive design** with horizontal scroll for large datasets
- **Sticky headers** for easy navigation of large tables
- **Zebra striping** and hover effects for improved readability

### ♿ Superior Accessibility
- **Full keyboard navigation** with arrow keys, Home, and End
- **ARIA roles and labels** for screen reader compatibility
- **Focus management** with visual focus indicators
- **Semantic HTML structure** for better accessibility
- **High contrast design** following WCAG guidelines

### 📱 Responsive & Modern UI
- **Mobile-first design** built with Tailwind CSS
- **Clean, modern interface** with professional styling
- **Optimized performance** with Next.js App Router
- **Fast loading** with static generation where possible

### 📈 Analytics & Performance Monitoring
- **Vercel Analytics** integration for usage tracking
- **Speed Insights** for performance monitoring
- **Performance metrics logging** (TTFB, FCP)
- **Real-time performance monitoring**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd university-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
university-finder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── layout.tsx          # Root layout with metadata
│   │   └── page.tsx            # Home page with data fetching
│   ├── components/             # React components
│   │   ├── Analytics.tsx       # Vercel Analytics & Speed Insights
│   │   ├── DataTable.tsx       # Main data table with sorting/pagination
│   │   ├── SearchFilters.tsx   # Search and filter controls
│   │   └── UniversityFinder.tsx # Main coordinator component
│   └── data/
│       └── universities.json   # University dataset
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 📊 Data Structure

The university dataset includes comprehensive information:

- **University Name** - Official institution name
- **Location** - City and country
- **Ranking** - Global/regional rankings (QS/THE 2024)
- **Programs** - CS-related Master's programs
- **Deadlines** - Application deadlines
- **Acceptance Rates** - Admission statistics
- **Criteria** - Key acceptance requirements
- **Funding** - Scholarship and funding options
- **Contact** - Admissions contact information
- **Website** - Official program URLs

## 🛠️ Key Implementation Details

### Performance Optimizations
- **Static data fetching** at build time using App Router
- **Debounced search** (300ms) to reduce unnecessary renders
- **Virtualized pagination** for handling large datasets
- **Optimized re-renders** with React.memo and useCallback
- **Efficient sorting algorithms** for all data types

### Search & Filter Logic
- **Multi-field text search** across name, location, programs, and criteria
- **Regex-based highlighting** with proper escaping for special characters
- **Range filtering** for rankings with dual-slider interface
- **Country extraction** from location strings with smart parsing
- **Case-insensitive matching** with locale-aware comparisons

### Accessibility Features
- **Keyboard navigation** throughout the entire interface
- **Screen reader support** with proper ARIA labels
- **Focus management** with visible focus indicators
- **Semantic markup** using proper table roles
- **Color contrast** meeting WCAG AA standards

### Analytics Integration
```typescript
// Performance metrics are automatically logged
// TTFB (Time to First Byte) tracking
// FCP (First Contentful Paint) monitoring
// User interaction analytics via Vercel Analytics
```

## 🔧 Customization

### Adding New Filter Types
1. Extend the `SearchFilters` component
2. Add new state variables and handlers
3. Update the filtering logic in `useEffect`
4. Add UI controls in the filter bar

### Modifying Table Columns
1. Update `COLUMN_CONFIG` in `DataTable.tsx`
2. Adjust column widths and display names
3. Update the `University` interface if needed
4. Modify sorting logic for custom data types

### Styling Customization
- Edit `tailwind.config.ts` for theme changes
- Modify `globals.css` for custom styles
- Update component-specific classes
- Adjust responsive breakpoints as needed

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration
4. Analytics and Speed Insights work out of the box

### Other Platforms
1. Run `npm run build` to create production build
2. Serve the `out` directory (if using static export)
3. Configure your hosting provider for Next.js
4. Set up analytics tracking if not using Vercel

## 📝 Performance Metrics

The application is optimized for:
- **First Contentful Paint (FCP)** < 1.5s
- **Time to First Byte (TTFB)** < 600ms
- **Cumulative Layout Shift (CLS)** < 0.1
- **First Input Delay (FID)** < 100ms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS