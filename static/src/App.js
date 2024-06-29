// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Container} from "@mui/material";

import Header from './components/Header'; // Adjust the import path based on your file structure

import HomePage from './HomePage';
import Dota2WinPrediction from './ml-tools/Dota2WinPrediction';
import StocksPricePrediction from './ml-tools/StocksPricePrediction';
import NotFoundPage from './NotFoundPage'; // Your 404 page component

const App = () => {
  return (
    <Router>
      <Header />
      <Container maxWidth="lg" style={{ paddingTop: '20px' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dota2-win-prediction" element={<Dota2WinPrediction />} />
        <Route path="/stocks-price-prediction" element={<StocksPricePrediction />} />
        <Route path="*" element={<NotFoundPage />} />
        {/* Add other ML tool routes as needed */}
      </Routes>
      </Container>
    </Router>
  );
};

export default App;
