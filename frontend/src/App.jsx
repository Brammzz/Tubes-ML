import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { uploadCSVData, trainLSTMModel, makePredictions, healthCheck } from './api.js';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [stockName, setStockName] = useState('');
  const [data, setData] = useState(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [training, setTraining] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [dataStats, setDataStats] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');

  // Check API health on component mount
  React.useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthCheck();
      setApiStatus('connected');
    } catch (err) {
      setApiStatus('disconnected');
      setError('Backend API tidak tersedia. Pastikan server Python berjalan di localhost:8000');
    }
  };

  const extractStockName = (filename) => {
    return filename.replace('.csv', '').replace(/_/g, ' ').toUpperCase();
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const parsedData = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 5) {
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim();
        });
        parsedData.push(row);
      }
    }
    return parsedData;
  };

  const preprocessData = (rawData) => {
    const processed = rawData.slice(-60).map((row, idx) => ({
      tanggal: row.date || `Hari ${idx + 1}`,
      open: parseFloat(row.open),
      close: parseFloat(row.close),
      high: parseFloat(row.high),
      low: parseFloat(row.low),
      volume: parseInt(row.volume || 0)
    })).filter(row => !isNaN(row.open) && !isNaN(row.close));

    const opens = processed.map(d => d.open);
    const closes = processed.map(d => d.close);
    const highs = processed.map(d => d.high);
    const lows = processed.map(d => d.low);

    const stats = {
      avgOpen: (opens.reduce((a, b) => a + b, 0) / opens.length).toFixed(2),
      avgClose: (closes.reduce((a, b) => a + b, 0) / closes.length).toFixed(2),
      maxPrice: Math.max(...highs).toFixed(2),
      minPrice: Math.min(...lows).toFixed(2),
      volatility: (Math.max(...highs) - Math.min(...lows)).toFixed(2),
      totalDays: processed.length
    };

    setDataStats(stats);
    return processed;
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setStockName(extractStockName(uploadedFile.name));
      setError(null);
      
      try {
        // Upload to backend for real processing
        const response = await uploadCSVData(uploadedFile);
        
        if (response.status === 'success') {
          // Process for frontend display
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target.result;
            const parsedData = parseCSV(text);
            
            if (parsedData.length > 0) {
              const processed = preprocessData(parsedData);
              setData(processed);
              
              // Use backend stats
              const backendStats = response.stats;
              setDataStats({
                avgOpen: backendStats.price_stats.avg_open.toFixed(2),
                avgClose: backendStats.price_stats.avg_close.toFixed(2),
                maxPrice: backendStats.price_stats.max_price.toFixed(2),
                minPrice: backendStats.price_stats.min_price.toFixed(2),
                volatility: backendStats.price_stats.volatility.toFixed(2),
                totalDays: backendStats.total_records
              });
              
              setActiveTab('data');
            }
          };
          reader.readAsText(uploadedFile);
        }
      } catch (err) {
        setError(`Error uploading file: ${err.message}`);
        console.error('Upload error:', err);
      }
    }
  };

  const trainModel = async () => {
    setTraining(true);
    setActiveTab('model');
    setError(null);
    
    try {
      // Real API call untuk training LSTM model
      const response = await trainLSTMModel();
      
      if (response.status === 'success') {
        const modelData = {
          type: response.model_info.type,
          layers: response.model_info.layers,
          epochs: response.model_info.epochs,
          batchSize: response.model_info.batch_size,
          learningRate: response.model_info.learning_rate,
          sequenceLength: response.model_info.sequence_length,
          mse: response.metrics.mse.toFixed(4),
          mae: response.metrics.mae.toFixed(3),
          rmse: response.metrics.rmse.toFixed(3),
          r2Score: response.metrics.r2_score.toFixed(3),
          accuracy: response.metrics.directional_accuracy.toFixed(1),
          trainingTime: response.metrics.training_time.toFixed(1),
          trainingHistory: response.training_history
        };
        
        setModel(modelData);
      } else {
        setError('Error training model: ' + response.error);
      }
    } catch (err) {
      setError(`Training failed: ${err.message}`);
      console.error('Training error:', err);
    } finally {
      setTraining(false);
    }
  };

  const makePrediction = async (days = 5) => {
    if (!model) {
      setError('No trained model available. Please train a model first.');
      return;
    }
    
    setError(null);
    
    try {
      // Real API call untuk predictions
      const response = await makePredictions(days);
      
      if (response.status === 'success') {
        const predictions = response.predictions.map((pred, idx) => {
          const prevClose = idx === 0 ? 
            (data && data.length > 0 ? data[data.length - 1].close : pred.predicted_open) :
            parseFloat(response.predictions[idx - 1].predicted_close);
          
          const currentClose = parseFloat(pred.predicted_close);
          const changeFromPrev = ((currentClose - prevClose) / prevClose * 100).toFixed(2);
          const changeFromLast = data && data.length > 0 ? 
            ((currentClose - data[data.length - 1].close) / data[data.length - 1].close * 100).toFixed(2) :
            '0.00';
          
          return {
            day: `Hari ${pred.day}`,
            date: pred.date,
            predictedOpen: pred.predicted_open.toString(),
            predictedClose: pred.predicted_close.toString(),
            predictedHigh: pred.predicted_high.toString(),
            predictedLow: pred.predicted_low.toString(),
            changeFromLast: idx === 0 ? changeFromLast : changeFromPrev,
            changeFromPrev: changeFromPrev,
            confidence: pred.confidence.toString()
          };
        });
        
        setPredictions(predictions);
        setActiveTab('prediction');
      } else {
        setError('Error making predictions: ' + response.error);
      }
    } catch (err) {
      setError(`Prediction failed: ${err.message}`);
      console.error('Prediction error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="icon-wrapper">
              <span className="icon">📈</span>
            </div>
            <div>
              <h1>Sistem Prediksi Harga Saham</h1>
              <p>Machine Learning untuk Prediksi Harga Saham Universal</p>
            </div>
          </div>
          {stockName && (
            <div className="stock-badge">
              <p className="stock-label">Saham Aktif</p>
              <p className="stock-name">{stockName}</p>
            </div>
          )}
        </div>
      </div>

      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('upload')}
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
        >
          📤 Upload Data
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          disabled={!data}
        >
          📊 Analisis Data
        </button>
        <button
          onClick={() => setActiveTab('model')}
          className={`tab ${activeTab === 'model' ? 'active' : ''}`}
          disabled={!model}
        >
          🤖 Model Training
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`tab ${activeTab === 'prediction' ? 'active' : ''}`}
          disabled={!predictions}
        >
          🔮 Hasil Prediksi
        </button>
      </div>

      <div className="content">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <div className="upload-icon">📤</div>
            <h2>Upload Data Historis Saham</h2>
            <p>
              Sistem ini menggunakan <strong>Real LSTM Neural Network</strong> untuk memprediksi harga saham. 
              Upload file CSV dengan format: <strong> Date, Open, High, Low, Close, Volume</strong>
            </p>
            
            <label className="upload-button">
              📄 Pilih File CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={apiStatus !== 'connected'}
              />
            </label>
            
            {apiStatus !== 'connected' && (
              <div className="warning-message">
                ⚠️ Backend API tidak tersedia. Pastikan server Python berjalan di localhost:8000
              </div>
            )}
            
            {file && (
              <div className="success-message">
                ✅ File berhasil diupload: <strong>{file.name}</strong>
                <br />
                📊 Data telah diproses oleh backend untuk training model
              </div>
            )}

            <div className="info-box">
              <div className="info-content">
                <span className="info-icon">ℹ️</span>
                <div>
                  <p className="info-title">🧠 Real Machine Learning Features:</p>
                  <p className="info-text">
                    • <strong>TensorFlow LSTM Neural Network</strong> - Real deep learning model<br />
                    • <strong>Time Series Preprocessing</strong> - 60-day sequences untuk pattern recognition<br />
                    • <strong>Real Performance Metrics</strong> - MSE, MAE, R², Directional Accuracy<br />
                    • <strong>Model Persistence</strong> - Trained model disimpan untuk reuse
                  </p>
                  <p className="info-title">📋 Format File CSV:</p>
                  <p className="info-text">
                    Pastikan file CSV memiliki kolom: <strong>Date, Open, High, Low, Close, Volume</strong>
                  </p>
                  <p className="info-title">📊 Rekomendasi Data:</p>
                  <p className="info-text">
                    • Periode data: <strong>2020 - 2025</strong> (5 tahun)<br />
                    • Minimal 200 baris data untuk hasil optimal<br />
                    • Download dari Yahoo Finance atau Investing.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && data && (
          <div className="data-section">
            <div className="section-header">
              <div>
                <h2>Analisis Data: {stockName}</h2>
                <p>Data historis periode 2020-2025</p>
              </div>
              {dataStats && (
                <div className="data-count">
                  <p>Total Data Points</p>
                  <p className="count-number">{dataStats.totalDays} hari</p>
                </div>
              )}
            </div>

            <div className="chart-container">
              <h3>Grafik Pergerakan Harga (60 Hari Terakhir)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tanggal" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} name="Open" />
                  <Line type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} name="Close" />
                  <Line type="monotone" dataKey="high" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="High" />
                  <Line type="monotone" dataKey="low" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" name="Low" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {dataStats && (
              <div className="stats-grid">
                <div className="stat-card blue">
                  <p className="stat-label">Rata-rata Open</p>
                  <p className="stat-value">Rp {dataStats.avgOpen}</p>
                </div>
                <div className="stat-card purple">
                  <p className="stat-label">Rata-rata Close</p>
                  <p className="stat-value">Rp {dataStats.avgClose}</p>
                </div>
                <div className="stat-card green">
                  <p className="stat-label">Harga Tertinggi</p>
                  <p className="stat-value">Rp {dataStats.maxPrice}</p>
                </div>
                <div className="stat-card red">
                  <p className="stat-label">Harga Terendah</p>
                  <p className="stat-value">Rp {dataStats.minPrice}</p>
                </div>
                <div className="stat-card orange">
                  <p className="stat-label">Volatilitas</p>
                  <p className="stat-value">Rp {dataStats.volatility}</p>
                </div>
              </div>
            )}

            <button 
              onClick={trainModel} 
              className="primary-button"
              disabled={apiStatus !== 'connected'}
            >
              🚀 {apiStatus === 'connected' ? 'Mulai Real LSTM Training' : 'Backend Required untuk Training'}
            </button>
            
            {apiStatus !== 'connected' && (
              <div className="backend-instruction">
                <h4>🔧 Cara Menjalankan Backend:</h4>
                <div className="instruction-code">
                  <code>cd backend</code><br />
                  <code>pip install -r requirements.txt</code><br />
                  <code>python main.py</code>
                </div>
                <p>Backend akan berjalan di <strong>http://localhost:8000</strong></p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'model' && (
          <div className="model-section">
            <h2>Model Machine Learning - LSTM Neural Network</h2>
            
            {training ? (
              <div className="training-loader">
                <div className="spinner"></div>
                <p className="training-text">Training Real LSTM Neural Network...</p>
                <p className="training-subtext">
                  🧠 TensorFlow sedang melatih model untuk saham {stockName}<br />
                  ⏱️ Proses training membutuhkan waktu 2-5 menit tergantung data<br />
                  📊 Model akan di-evaluate dengan metrics MSE, MAE, R², dan Directional Accuracy
                </p>
              </div>
            ) : model ? (
              <div>
                <div className="model-info">
                  <h3>Arsitektur Model</h3>
                  <div className="architecture-grid">
                    <div>
                      <p>• <strong>Algoritma:</strong> Long Short-Term Memory (LSTM)</p>
                      <p>• <strong>LSTM Layer 1:</strong> {model.layers[0]} units + Dropout(0.2)</p>
                      <p>• <strong>LSTM Layer 2:</strong> {model.layers[1]} units + Dropout(0.2)</p>
                      <p>• <strong>Dense Layer:</strong> 16 units (ReLU)</p>
                      <p>• <strong>Output Layer:</strong> 4 units (Open, High, Low, Close)</p>
                    </div>
                    <div>
                      <p>• <strong>Optimizer:</strong> Adam</p>
                      <p>• <strong>Learning Rate:</strong> {model.learningRate}</p>
                      <p>• <strong>Loss Function:</strong> MSE</p>
                      <p>• <strong>Epochs:</strong> {model.epochs}</p>
                      <p>• <strong>Batch Size:</strong> {model.batchSize}</p>
                    </div>
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-card green">
                    <h4>Metrik Evaluasi</h4>
                    <div className="metric-item">
                      <span>MSE:</span>
                      <span className="metric-value">{model.mse}</span>
                    </div>
                    <div className="metric-item">
                      <span>MAE:</span>
                      <span className="metric-value">{model.mae}</span>
                    </div>
                    <div className="metric-item">
                      <span>RMSE:</span>
                      <span className="metric-value">{model.rmse}</span>
                    </div>
                    <div className="metric-item">
                      <span>R² Score:</span>
                      <span className="metric-value">{model.r2Score}</span>
                    </div>
                  </div>

                  <div className="metric-card blue">
                    <h4>Akurasi Model</h4>
                    <div className="accuracy-display">
                      <p className="accuracy-number">{model.accuracy}%</p>
                      <p className="accuracy-label">Prediction Accuracy</p>
                    </div>
                  </div>

                  <div className="metric-card purple">
                    <h4>Informasi Training</h4>
                    <div className="metric-item">
                      <span>Dataset:</span>
                      <span className="metric-value">{stockName}</span>
                    </div>
                    <div className="metric-item">
                      <span>Training Time:</span>
                      <span className="metric-value">{model.trainingTime}s</span>
                    </div>
                    <div className="metric-item">
                      <span>Sequence:</span>
                      <span className="metric-value">{model.sequenceLength} days</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => makePrediction(5)} className="primary-button">
                  📊 Generate Prediksi Harga (5 Hari ke Depan)
                </button>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'prediction' && predictions && (
          <div className="prediction-section">
            <div className="section-header">
              <div>
                <h2>Hasil Prediksi: {stockName}</h2>
                <p>Prediksi harga untuk 5 hari perdagangan ke depan</p>
              </div>
            </div>

            <div className="tomorrow-prediction">
              <p className="tomorrow-label">🎯 Prediksi Besok (T+1)</p>
              <div className="tomorrow-grid">
                <div className="tomorrow-item">
                  <p className="tomorrow-item-label">Open</p>
                  <p className="tomorrow-item-value">Rp {predictions[0].predictedOpen}</p>
                </div>
                <div className="tomorrow-item">
                  <p className="tomorrow-item-label">High</p>
                  <p className="tomorrow-item-value">Rp {predictions[0].predictedHigh}</p>
                </div>
                <div className="tomorrow-item">
                  <p className="tomorrow-item-label">Low</p>
                  <p className="tomorrow-item-value">Rp {predictions[0].predictedLow}</p>
                </div>
                <div className="tomorrow-item">
                  <p className="tomorrow-item-label">Close</p>
                  <p className="tomorrow-item-value">Rp {predictions[0].predictedClose}</p>
                </div>
              </div>
              <div className="tomorrow-change">
                <span>Perubahan:</span>
                <span className={parseFloat(predictions[0].changeFromLast) >= 0 ? 'positive' : 'negative'}>
                  {parseFloat(predictions[0].changeFromLast) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(predictions[0].changeFromLast))}%
                </span>
                <span>Confidence: {predictions[0].confidence}%</span>
              </div>
            </div>

            <div className="prediction-table">
              <h3>📋 Detail Prediksi 5 Hari</h3>
              <table>
                <thead>
                  <tr>
                    <th>Hari</th>
                    <th>Open (Rp)</th>
                    <th>Close (Rp)</th>
                    <th>High (Rp)</th>
                    <th>Low (Rp)</th>
                    <th>Perubahan</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred, idx) => (
                    <tr key={idx} className={idx === 0 ? 'highlighted' : ''}>
                      <td><strong>{pred.date}</strong></td>
                      <td>{pred.predictedOpen}</td>
                      <td><strong>{pred.predictedClose}</strong></td>
                      <td className="positive">{pred.predictedHigh}</td>
                      <td className="negative">{pred.predictedLow}</td>
                      <td className={parseFloat(pred.changeFromPrev) >= 0 ? 'positive' : 'negative'}>
                        {parseFloat(pred.changeFromPrev) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(pred.changeFromPrev))}%
                      </td>
                      <td>{pred.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="warning-box">
              <span className="warning-icon">⚠️</span>
              <div>
                <p className="warning-title">Disclaimer Penting</p>
                <p className="warning-text">
                  Prediksi ini dibuat menggunakan <strong>Real LSTM Neural Network</strong> yang telah dilatih dengan data historis saham <strong>{stockName}</strong>. 
                  Meskipun menggunakan machine learning canggih, hasil prediksi tetap bersifat probabilistik dan <strong>TIDAK DAPAT DIJADIKAN SATU-SATUNYA DASAR</strong> untuk keputusan investasi.
                  Model telah dievaluasi dengan metrics {model && `MSE: ${model.mse}, Accuracy: ${model.accuracy}%`}.
                </p>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={() => {
                  setPredictions(null);
                  setModel(null);
                  setData(null);
                  setStockName('');
                  setActiveTab('upload');
                }}
                className="secondary-button"
              >
                🔄 Analisis Saham Baru
              </button>
              <button onClick={() => makePrediction(5)} className="primary-button">
                🔮 Prediksi Ulang
              </button>
              <button onClick={() => makePrediction(10)} className="primary-button">
                📈 Prediksi 10 Hari
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <p><strong>Real Stock Prediction System - Deep Learning dengan TensorFlow</strong></p>
        <p>Menggunakan LSTM Neural Network untuk Time Series Forecasting dengan Python Backend API</p>
        <div className="tech-stack">
          <span className="tech-item">🧠 TensorFlow</span>
          <span className="tech-item">🐍 FastAPI</span>
          <span className="tech-item">⚛️ React</span>
          <span className="tech-item">📊 Real ML</span>
        </div>
      </div>
    </div>
  );
}

export default App;