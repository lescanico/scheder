import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  Schedule,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { requestService } from '../services/requestService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    requestType: '',
    providerId: ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests(filters);
      setRequests(response.data);
    } catch (error) {
      setError('Failed to load requests');
      console.error('Load requests error:', error);
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

  const getRequestTypeDisplay = (type) => {
    const types = {
      'specific_time': 'Specific Time',
      'full_day': 'Full Day',
      'multiple_days': 'Multiple Days',
      'recurring': 'Recurring'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    loadRequests();
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      requestType: '',
      providerId: ''
    });
    loadRequests();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all schedule blocking requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={filters.requestType}
                  onChange={(e) => handleFilterChange('requestType', e.target.value)}
                  label="Request Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="specific_time">Specific Time</MenuItem>
                  <MenuItem value="full_day">Full Day</MenuItem>
                  <MenuItem value="multiple_days">Multiple Days</MenuItem>
                  <MenuItem value="recurring">Recurring</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Provider ID"
                value={filters.providerId}
                onChange={(e) => handleFilterChange('providerId', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={handleApplyFilters}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {requests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {Object.entries(
          requests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
          }, {})
        ).map(([status, count]) => (
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

      {/* Requests Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Requests
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadRequests}
            >
              Refresh
            </Button>
          </Box>

          {requests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No requests found
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {request.providerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.providerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRequestTypeDisplay(request.requestType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {request.requestType === 'specific_time' && (
                          <Typography variant="body2">
                            {formatDate(request.startDate)} {request.startTime} - {request.endTime}
                          </Typography>
                        )}
                        {request.requestType === 'full_day' && (
                          <Typography variant="body2">
                            {formatDate(request.startDate)}
                          </Typography>
                        )}
                        {request.requestType === 'multiple_days' && (
                          <Typography variant="body2">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </Typography>
                        )}
                        {request.requestType === 'recurring' && (
                          <Typography variant="body2">
                            Recurring: {request.recurringPattern}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {request.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(request.status)}
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/request/${request.id}`)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard; 