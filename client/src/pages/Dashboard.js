import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Add,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequestStats();
      setStats(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'pending':
        return <Pending />;
      default:
        return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.role === 'provider' && 'Manage your schedule blocking requests'}
          {user?.role === 'admin' && 'Review and manage schedule blocking requests'}
          {user?.role === 'director' && 'Approve PTO requests and manage schedules'}
        </Typography>
      </Box>

      {/* Quick Actions */}
      {user?.role === 'provider' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/request/new')}
              sx={{ mr: 2 }}
            >
              New Request
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/provider')}
            >
              View My Requests
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {Object.entries(stats.byStatus).map(([status, count]) => (
            <Grid item xs={12} sm={6} md={3} key={status}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ color: `${getStatusColor(status)}.main`, mr: 2 }}>
                      {getStatusIcon(status)}
                    </Box>
                    <Box>
                      <Typography variant="h4">{count}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recent Activity */}
      {stats?.recentRequests && stats.recentRequests.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Requests
            </Typography>
            <Box>
              {stats.recentRequests.map((request) => (
                <Paper key={request.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">
                        {request.providerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.reason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Role-specific content */}
      {user?.role === 'admin' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Admin Actions
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/admin')}
              sx={{ mr: 2 }}
            >
              Manage Requests
            </Button>
            <Button variant="outlined">
              View Conflicts
            </Button>
          </CardContent>
        </Card>
      )}

      {user?.role === 'director' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Director Actions
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/director')}
              sx={{ mr: 2 }}
            >
              Review PTO Requests
            </Button>
            <Button variant="outlined">
              Approve Requests
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard; 