# backend/README.md

# Stock Prediction Backend API

Real machine learning backend untuk sistem prediksi harga saham menggunakan LSTM Neural Network.

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Server

```bash
python main.py
```

Server akan berjalan di `http://localhost:8000`

## 📊 API Endpoints

### 1. Upload Data CSV

```
POST /api/upload-data
```

- Upload file CSV dengan kolom: Date, Open, High, Low, Close, Volume
- Response: Data statistics dan konfirmasi upload

### 2. Train LSTM Model

```
POST /api/train-model
```

- Training real LSTM model dengan data yang sudah diupload
- Response: Model metrics (MSE, MAE, R², Accuracy) dan training info

### 3. Make Predictions

```
POST /api/predict?days=5
```

- Generate prediksi harga saham untuk N hari ke depan
- Response: Array predictions dengan OHLC dan confidence level

### 4. Health Check

```
GET /api/health
```

- Check status server
- Response: Health status dan timestamp

## 🧠 Model Architecture

```
LSTM Neural Network:
- LSTM Layer 1: 64 units + Dropout(0.2)
- LSTM Layer 2: 32 units + Dropout(0.2)
- Dense Layer: 16 units (ReLU)
- Output Layer: 4 units (Open, High, Low, Close)

Optimizer: Adam
Loss Function: MSE
Sequence Length: 60 days
```

## 📈 Features

- ✅ Real LSTM training dengan TensorFlow
- ✅ Time series preprocessing untuk data saham
- ✅ Model persistence (save/load model)
- ✅ Real-time predictions
- ✅ Performance metrics evaluation
- ✅ CORS enabled untuk frontend integration
- ✅ Error handling dan validation

## 🔧 Model Performance Metrics

- **MSE**: Mean Squared Error
- **MAE**: Mean Absolute Error
- **RMSE**: Root Mean Squared Error
- **R² Score**: Coefficient of determination
- **Directional Accuracy**: Persentase prediksi arah harga yang benar

## 📝 Data Format

CSV file harus memiliki kolom:

```
Date,Open,High,Low,Close,Volume
2020-01-01,100.0,105.0,99.0,103.0,1000000
2020-01-02,103.0,108.0,102.0,107.0,1200000
...
```

## 🛠️ Production Deployment

Untuk production, tambahkan:

- Database (PostgreSQL) untuk data persistence
- Redis untuk caching predictions
- API authentication & rate limiting
- Model versioning & A/B testing
- Monitoring & logging (Prometheus, Grafana)
