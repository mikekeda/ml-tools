// src/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, CardMedia } from '@mui/material';
import Dota2WinPredictionData from './ml-tools/Dota2WinPrediction/toolData'; // Adjust the path as necessary

const HomePage = () => {
  const navigate = useNavigate();

  // Directly define the ML tools data here
  const mlTools = [
    Dota2WinPredictionData,
    // Add more ML tools as needed
  ];

  // Handle tool click
  const handleToolClick = (toolId) => {
    navigate(`/${toolId}`);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        ML Tools
      </Typography>
      <Grid container spacing={2}>
        {mlTools.map((tool) => (
          <Grid key={tool.id} item xs={12} sm={6} md={4}>
            <div onClick={() => handleToolClick(tool.id)} style={{ cursor: 'pointer' }}>
              <Card>
                <CardMedia
                  component="img"
                  alt={tool.title}
                  height="140"
                  image={tool.image_url}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {tool.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default HomePage;
