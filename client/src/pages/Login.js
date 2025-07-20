import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');

    let demoEmail, demoPassword;
    
    switch (role) {
      case 'provider':
        demoEmail = 'provider@clinic.com';
        demoPassword = 'password';
        break;
      case 'admin':
        demoEmail = 'admin@clinic.com';
        demoPassword = 'password';
        break;
      case 'director':
        demoEmail = 'director@clinic.com';
        demoPassword = 'password';
        break;
      default:
        return;
    }

    try {
      const result = await login(demoEmail, demoPassword);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default' 
    }}>
      <Container component="main" maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <img src="/favicon.png" alt="Scheder Logo" style={{ height: 64, marginBottom: 16 }} />
              <Typography variant="h5" gutterBottom>
                Penn Psychiatry
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/register')}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Don't have an account? Register
              </Button>
            </Box>

            <Box sx={{ mt: 3, width: '100%' }}>
              <Typography variant="h6" gutterBottom align="center">
                Demo Accounts
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleDemoLogin('provider')}
                    disabled={loading}
                    sx={{ mb: 1 }}
                  >
                    Provider
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={loading}
                    sx={{ mb: 1 }}
                  >
                    Admin
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleDemoLogin('director')}
                    disabled={loading}
                    sx={{ mb: 1 }}
                  >
                    Director
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Demo accounts use password: <strong>password</strong>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
      
      {/* Footer for login page */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
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
          © 2025 Nicolas Lescano, MD - Professor of Clinical Psychiatry, University of Pennsylvania
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontSize: '0.75rem', mt: 0.5 }}
        >
          Developed for operational workflow optimization at the University of Pennsylvania Department of Psychiatry
        </Typography>
      </Box>
    </Box>
  );
};

export default Login; 