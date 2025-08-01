import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ fontSize: '0.875rem' }}
      >
        © 2025 Nicolas Lescano, MD
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ fontSize: '0.75rem', mt: 0.5 }}
      >
        Developed for operational workflow optimization at OPC
      </Typography>
    </Box>
  );
};

export default Footer; 