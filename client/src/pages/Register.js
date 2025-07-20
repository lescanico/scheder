import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'provider',
    providerId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <img 
                src="/penn-psych.png" 
                alt="Penn Psychiatry" 
                style={{ height: 48, width: 'auto' }}
              />
              <Box>
                <Typography component="h1" variant="h4" gutterBottom>
                  Penn Psychiatry
                </Typography>
                <Typography component="h2" variant="h6" color="text.secondary">
                  User Registration
                </Typography>
              </Box>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="provider">Provider</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="director">Director</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {formData.role === 'provider' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="providerId"
                      label="Provider ID (Optional)"
                      value={formData.providerId}
                      onChange={handleChange}
                      disabled={loading}
                      helperText="Enter your provider ID if you have one"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Minimum 6 characters"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Already have an account? Sign In
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
      
      {/* Footer for registration page */}
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
          © 2025 Nicolas Lescano, MD
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

export default Register; 