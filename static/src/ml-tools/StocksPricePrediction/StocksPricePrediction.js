// src/ml-tools/StocksPricePrediction/StocksPricePrediction.js
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-moment';

Chart.register(zoomPlugin);

const StocksPricePrediction = () => {
  const [stockSymbols, setStockSymbols] = useState([]);
  const [chartsData, setChartsData] = useState({});
  const [chartsInstances, setChartsInstances] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [initialized, setInitialized] = useState(false); // Add state to track initialization

  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/ml-tools/stocks-price-prediction?symbol=${symbol}`);
      const data = await response.json();
      setChartsData((prevData) => ({
        ...prevData,
        [symbol]: data
      }));
    } catch (error) {
      setError(error.message || 'Error fetching stock prices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChart = async () => {
    if (currentSymbol && !stockSymbols.includes(currentSymbol.toUpperCase())) {
      console.log("in");
      await fetchStockData(currentSymbol);
      setStockSymbols([...stockSymbols, currentSymbol.toUpperCase()]);
      setCurrentSymbol(''); // Clear the input after adding
    }
  };

  const handleRemoveChart = (symbol) => {
    const newStockSymbols = stockSymbols.filter(s => s !== symbol);
    setStockSymbols(newStockSymbols);
    
    // Remove the data for the symbol as well
    const newChartsData = { ...chartsData };
    delete newChartsData[symbol];
    setChartsData(newChartsData);
  };

  useEffect(() => {
    // Load initial symbols from localStorage and fetch their data
    const loadInitialData = async () => {
      setInitialized(true); // Indicate that initial loading from localStorage is done
      const savedSymbols = localStorage.getItem('selectedStocks');
      if (savedSymbols) {
        const symbols = JSON.parse(savedSymbols);
        setStockSymbols(symbols);
        for (const symbol of symbols) {
          await fetchStockData(symbol);
        }
      }
    };

    loadInitialData();
  }, []);


  useEffect(() => {
    // Save to localStorage only after initialization is complete
    if (initialized) {
      localStorage.setItem('selectedStocks', JSON.stringify(stockSymbols));
    }

    stockSymbols.forEach((symbol) => {
      const canvasId = `chart-${symbol}`;
      const canvas = document.getElementById(canvasId);
      if (!canvas) return; // If canvas is not found, skip this iteration

      const ctx = canvas.getContext('2d');
      // Destroy the existing chart before creating a new one
      if (chartsInstances[symbol]) {
        chartsInstances[symbol].destroy();
      }

      // Create a new chart instance and store it
      const newChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartsData[symbol]?.map((price) => price.datetime),
          datasets: [{
            label: `market price`,
            data: chartsData[symbol]?.map((price) => parseFloat(price.close)),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }, {
            label: `predicted price`,
            data: chartsData[symbol]?.map((price) => parseFloat(price.yhat)),
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5], // Makes the line dashed
            tension: 0.1
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                parser: 'YYYY-MM-DD HH:mm:ss', // Specify the format of your input dates here
                tooltipFormat: 'll HH:mm',
                unit: 'day'
              },
              title: {
                display: true,
                text: 'Date and Time'
              },
              ticks: {
                maxRotation: 90,
                autoSkip: true,
                maxTicksLimit: 20 // Adjust this number based on your needs
              }
            },
            y: {
              title: {
                display: true,
                text: 'Price (USD)'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              onClick: (e, legendItem, legend) => {
                const index = legendItem.datasetIndex;
                const ci = legend.chart;
                if (ci.isDatasetVisible(index)) {
                  ci.hide(index);
                  legendItem.hidden = true;
                } else {
                  ci.show(index);
                  legendItem.hidden = false;
                }
                ci.update();
              },
            },
            title: {
              display: true,
              text: symbol.toUpperCase(),
              font: {
                size: 20
              },
              align: 'start',
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true
                },
                mode: 'xy',
              }
            }
          },
          maintainAspectRatio: false,
          responsive: true,
          aspectRatio: 1, // Adjust this value to change the chart's aspect ratio
        }
      });

      // Update the state with the new chart instance
      setChartsInstances((prev) => ({
        ...prev,
        [symbol]: newChartInstance,
      }));
    });

    // Cleanup function to destroy all chart instances
    return () => {
      Object.values(chartsInstances).forEach(chartInstance => {
        chartInstance.destroy();
      });
    };
  }, [stockSymbols, chartsData, initialized]); // Re-run when stockSymbols or chartsData changes

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stocks Prediction
      </Typography>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              label="Enter stock symbol"
              value={currentSymbol}
              onChange={(e) => setCurrentSymbol(e.target.value)}
              disabled={loading}
              aria-label="Stock symbol" // Accessibility improvement
            />
            <Button
              color="primary"
              onClick={handleAddChart}
              disabled={loading || !currentSymbol.trim()}
              aria-label="Search" // Accessibility improvement
            >
              {loading ? <CircularProgress size={24} /> : 'Add Chart'}
            </Button>
          </Box>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}> {/* Padding for visual breathing room */}
            {stockSymbols.map((symbol) => (
            <Box key={symbol} position="relative" my={2}>
              <IconButton
                aria-label={`Remove ${symbol} chart`}
                onClick={() => handleRemoveChart(symbol)}
                sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1000 }}
              >
                <CloseIcon />
              </IconButton>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <canvas id={`chart-${symbol}`} />
              </Paper>
            </Box>
          ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StocksPricePrediction;
