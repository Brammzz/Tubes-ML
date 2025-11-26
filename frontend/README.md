# 📱 Frontend - Stock Prediction System

React application untuk sistem prediksi harga saham dengan real-time integration ke backend LSTM neural network.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm atau yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main component (600+ lines)
│   ├── App.css          # Responsive styling (1200+ lines)
│   ├── api.js           # Backend API integration
│   ├── main.jsx         # React bootstrap
│   └── index.css        # Base styles
├── index.html           # Entry point
└── package.json         # Dependencies & scripts
```

## 🎨 Components Overview

### `App.jsx` - Main Application Component

**State Management:**

- `file` - Uploaded CSV file
- `stockName` - Extracted stock name
- `data` - Processed stock data for charts
- `model` - Trained model information
- `predictions` - LSTM predictions result
- `training` - Training status
- `activeTab` - Current active tab
- `dataStats` - Data statistics
- `error` - Error messages

**Key Functions:**

- `handleFileUpload()` - Process CSV upload
- `trainModel()` - Trigger backend training
- `makePrediction()` - Generate predictions
- `parseCSV()` - Parse uploaded CSV
- `preprocessData()` - Data preprocessing

### `api.js` - Backend Integration

**API Functions:**

- `uploadCSVData(file)` - Upload CSV to backend
- `trainLSTMModel()` - Start model training
- `makePredictions(days)` - Get predictions
- `healthCheck()` - Check backend status

## 🎨 UI/UX Features

### **Responsive Design**

- Mobile-first approach
- Breakpoints: 480px, 768px, 992px, 1200px
- Flexible grid layout
- Touch-friendly interface

### **Tab Navigation**

1. **Upload Data** - CSV file upload
2. **Analisis Data** - Charts & statistics
3. **Model Training** - LSTM training process
4. **Hasil Prediksi** - Prediction results

### **Visual Components**

- Interactive line charts (Recharts)
- Loading animations
- Error handling alerts
- Gradient backgrounds
- Card-based layout

## 📊 Data Flow

```
CSV Upload → Backend Processing → Chart Display → Model Training → Predictions
    ↓              ↓                    ↓              ↓             ↓
File Reader → API Call → Data Stats → LSTM Training → Neural Inference
```

## 🛠️ Dependencies

```json
{
  "react": "^18.x",
  "recharts": "^2.x",
  "vite": "^4.x"
}
```

### **Production Dependencies**

- **React 18** - Core framework
- **Recharts** - Data visualization
- **Vite** - Build tool & dev server

## 🎯 Performance Optimizations

- **Code Splitting** - Lazy loading components
- **Memoization** - Prevent unnecessary re-renders
- **Chunked Data** - Handle large datasets efficiently
- **Responsive Images** - Optimized for all devices

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Coverage report
npm run coverage
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

Server: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Upload dist/ folder to Netlify
```

## 🔧 Configuration

### Vite Config (`vite.config.js`)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

### Environment Variables

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
```

## 🎨 Styling Guide

### **Color Palette**

- Primary: `#3b82f6` (Blue)
- Secondary: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)

### **Typography**

- Primary Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI'`
- Monospace: `'Courier New', monospace`

### **Layout System**

- Container: `max-width: 1400px`
- Grid: `CSS Grid` with auto-fit
- Spacing: `8px` base unit

## 🔍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Responsiveness

### **Breakpoints**

- Mobile: `< 480px`
- Tablet: `480px - 768px`
- Desktop: `> 768px`

### **Mobile Optimizations**

- Touch-friendly buttons (44px min)
- Swipe gestures for charts
- Optimized font sizes
- Compressed images

## 🐛 Common Issues

### **CORS Error**

```
Access to fetch at 'localhost:8000' from origin 'localhost:5173' has been blocked
```

**Solution**: Pastikan backend CORS dikonfigurasi untuk port 5173

### **CSV Parse Error**

```
Error processing CSV: Invalid format
```

**Solution**: Pastikan CSV memiliki kolom: Date, Open, High, Low, Close, Volume

## 📈 Future Enhancements

- [ ] Real-time data integration (WebSocket)
- [ ] Multiple stock comparison
- [ ] Portfolio tracking
- [ ] Export predictions to PDF
- [ ] Advanced charting options
- [ ] User authentication
- [ ] Saved predictions history

## 🤝 Contributing

1. Follow React best practices
2. Use CSS modules for styling
3. Add proper TypeScript types
4. Write unit tests for components
5. Ensure mobile responsiveness

---

**Frontend successfully integrates with backend LSTM API for real stock predictions!** 🚀
