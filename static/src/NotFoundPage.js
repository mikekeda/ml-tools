// src/NotFoundPage.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const NotFoundPage = () => {
  return (
    <Box textAlign="center" pt={5}>
      <Typography variant="h4">404 - Page Not Found</Typography>
      <Typography variant="subtitle1">Sorry, the page you are looking for does not exist.</Typography>
    </Box>
  );
};

export default NotFoundPage;
