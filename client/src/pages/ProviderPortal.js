import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Pending,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';
import { useNavigate } from 'react-router-dom';

const ProviderPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('ProviderPortal - Loading requests for providerId:', user.providerId);
      console.log('ProviderPortal - User data:', user);
      
      const response = await requestService.getRequests({ providerId: user.providerId });
      console.log('ProviderPortal - Response:', response);
      setRequests(response.data);
    } catch (error) {
      setError('Failed to load requests');
      console.error('Load requests error:', error);
    } finally {
      setLoading(false);
    }
  }, [user.providerId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleEditRequest = (request) => {
    // Navigate to edit form (you can implement a separate edit form or reuse the request form)
    navigate(`/request/${request.id}/edit`);
  };

  const handleDeleteRequest = (request) => {
    setRequestToDelete(request);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;

    try {
      await requestService.deleteRequest(requestToDelete.id);
      setDeleteDialog(false);
      setRequestToDelete(null);
      loadRequests(); // Reload the list
    } catch (error) {
      setError('Failed to delete request');
      console.error('Delete request error:', error);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          My Schedule Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/request/new')}
        >
          New Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No requests found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You haven't submitted any schedule blocking requests yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/request/new')}
            >
              Submit Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
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
                      {request.status === 'pending' && (
                        <>
                          <Tooltip title="Edit Request">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditRequest(request)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Request">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteRequest(request)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Statistics */}
      {requests.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
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
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderPortal; 