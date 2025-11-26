# 📈 Real Stock Prediction System

Sistem prediksi harga saham menggunakan **Real LSTM Neural Network** dengan TensorFlow dan React frontend. Proyek ini mengintegrasikan machine learning canggih untuk time series forecasting pada data saham.

## 🚀 Demo

![Stock Prediction System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Python](https://img.shields.io/badge/Python-3.13-yellow)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.20-orange)

## ✨ Features

### 🧠 **Real Machine Learning**

- **LSTM Neural Network** dengan TensorFlow
- **Real-time training** dengan data CSV
- **Performance metrics**: MSE, MAE, R², Directional Accuracy
- **Model persistence** untuk reuse

### 📊 **Data Analysis**

- Upload CSV data saham (Date, Open, High, Low, Close, Volume)
- Interactive charts dengan Recharts
- Statistical analysis dan preprocessing
- 60-day sequence preparation untuk LSTM

### 🔮 **Prediction Engine**

- Prediksi 5-10 hari ke depan
- OHLC (Open, High, Low, Close) predictions
- Confidence level per prediksi
- Real neural network inference

### 🎨 **Modern UI/UX**

- Responsive design (mobile, tablet, desktop)
- Tab-based navigation
- Real-time error handling
- Professional business styling

## 🏗️ Tech Stack

### **Frontend**

- ⚛️ **React 18** dengan Hooks
- 📊 **Recharts** untuk data visualization
- 🎨 **CSS3** dengan modern design
- 🏗️ **Vite** sebagai build tool

### **Backend**

- 🐍 **Python 3.13**
- 🚀 **FastAPI** untuk REST API
- 🧠 **TensorFlow 2.20** untuk LSTM model
- 📊 **Pandas & NumPy** untuk data processing
- 🔬 **Scikit-learn** untuk metrics evaluation

## 📁 Project Structure

```
stock-prediction-system/
├── frontend/                  # React application
│   ├── src/
│   │   ├── App.jsx           # Main component (600+ lines)
│   │   ├── App.css           # Responsive styling
│   │   ├── api.js            # Backend API integration
│   │   └── main.jsx          # React bootstrap
│   ├── index.html
│   └── package.json
├── backend/                   # Python API server
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Backend documentation
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ untuk frontend
- **Python** 3.11+ untuk backend
- **Git** untuk cloning

### 1. Clone Repository

```bash
git clone https://github.com/Brammzz/all.git
cd all
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```

Backend akan berjalan di: `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## 📊 How to Use

### 1. **Upload Data CSV**

- Siapkan file CSV dengan kolom: `Date, Open, High, Low, Close, Volume`
- Upload melalui interface web
- Data akan diproses otomatis oleh backend

### 2. **Train LSTM Model**

- Klik "Mulai Real LSTM Training"
- Tunggu proses training (2-5 menit)
- Lihat metrics: MSE, MAE, R², Accuracy

### 3. **Generate Predictions**

- Pilih periode prediksi (5-10 hari)
- Sistem akan generate prediksi OHLC
- Lihat confidence level dan trend analysis

## 🧠 LSTM Model Architecture

```
Model: Sequential
_________________________________________________________________
Layer (type)                 Output Shape              Param #
=================================================================
lstm_1 (LSTM)               (None, 60, 64)            17,152
dropout_1 (Dropout)         (None, 60, 64)            0
lstm_2 (LSTM)               (None, 32)                12,416
dropout_2 (Dropout)         (None, 32)                0
dense_1 (Dense)             (None, 16)                528
dense_2 (Dense)             (None, 4)                 68
=================================================================
Total params: 30,164
Trainable params: 30,164
Non-trainable params: 0
```

### Model Configuration

- **Sequence Length**: 60 days
- **Optimizer**: Adam
- **Learning Rate**: 0.001
- **Loss Function**: MSE
- **Epochs**: 50
- **Batch Size**: 32

## 📈 API Endpoints

### Backend API (`localhost:8000`)

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/upload-data`    | Upload CSV data saham     |
| POST   | `/api/train-model`    | Train LSTM neural network |
| POST   | `/api/predict?days=5` | Generate predictions      |
| GET    | `/api/health`         | Health check              |

### Response Example

```json
{
  "status": "success",
  "predictions": [
    {
      "day": 1,
      "date": "T+1",
      "predicted_open": 4520.5,
      "predicted_high": 4580.25,
      "predicted_low": 4485.75,
      "predicted_close": 4565.0,
      "confidence": 94.2
    }
  ]
}
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Install dev dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Sample Data Format

CSV file harus memiliki format berikut:

```csv
Date,Open,High,Low,Close,Volume
2020-01-01,4500.00,4580.00,4480.00,4560.00,1250000
2020-01-02,4560.00,4620.00,4540.00,4600.00,1180000
2020-01-03,4600.00,4650.00,4580.00,4635.00,1320000
...
```

Download sample data dari:

- [Yahoo Finance](https://finance.yahoo.com)
- [Investing.com](https://investing.com)
- [Alpha Vantage API](https://alphavantage.co)

## 🚨 Disclaimer

⚠️ **PENTING**: Sistem ini adalah proyek edukasi untuk pembelajaran machine learning. Meskipun menggunakan real LSTM neural network, hasil prediksi **TIDAK DAPAT DIJADIKAN SATU-SATUNYA DASAR** untuk keputusan investasi. Selalu konsultasi dengan ahli keuangan sebelum berinvestasi.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Bramm** - [@Brammzz](https://github.com/Brammzz)

Project Link: [https://github.com/Brammzz/all](https://github.com/Brammzz/all)

## 🙏 Acknowledgments

- [TensorFlow](https://tensorflow.org) - Deep learning framework
- [FastAPI](https://fastapi.tiangolo.com) - Modern web framework
- [React](https://reactjs.org) - Frontend library
- [Recharts](https://recharts.org) - Chart library
- [Vite](https://vitejs.dev) - Build tool

---

⭐ **Star this repository if you found it helpful!**
