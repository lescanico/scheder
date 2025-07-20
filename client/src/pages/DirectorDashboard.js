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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Pending,
  Schedule,
  FilterList,
  Refresh,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { requestService } from '../services/requestService';
import { useNavigate } from 'react-router-dom';

const DirectorDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    ptoRequired: 'true'
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

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
      ptoRequired: 'true'
    });
    loadRequests();
  };

  const handleApproval = (request, action) => {
    setSelectedRequest(request);
    setApprovalDialog(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequest) return;

    try {
      const action = approvalNotes.includes('reject') ? 'rejected' : 'approved';
      await requestService.updateRequestStatus(
        selectedRequest.id,
        action,
        approvalNotes,
        'Director'
      );
      
      setApprovalDialog(false);
      setSelectedRequest(null);
      setApprovalNotes('');
      loadRequests();
    } catch (error) {
      setError('Failed to update request status');
      console.error('Approval error:', error);
    }
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
          Director Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve PTO requests and schedule blocking requests
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
                <InputLabel>PTO Required</InputLabel>
                <Select
                  value={filters.ptoRequired}
                  onChange={(e) => handleFilterChange('ptoRequired', e.target.value)}
                  label="PTO Required"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">PTO Required</MenuItem>
                  <MenuItem value="false">No PTO Required</MenuItem>
                </Select>
              </FormControl>
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
              PTO Requests
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
                No PTO requests found
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
                    <TableCell>PTO Form</TableCell>
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
                        {request.ptoRequired ? (
                          request.ptoFormPath ? (
                            <Chip label="Uploaded" color="success" size="small" />
                          ) : (
                            <Chip label="Pending" color="warning" size="small" />
                          )
                        ) : (
                          <Chip label="Not Required" color="default" size="small" />
                        )}
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
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApproval(request, 'approve')}
                                >
                                  <ThumbUp />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleApproval(request, 'reject')}
                                >
                                  <ThumbDown />
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
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRequest && `Review Request - ${selectedRequest.providerName}`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide notes for your decision:
          </Typography>
          <TextareaAutosize
            minRows={4}
            placeholder="Enter your approval/rejection notes..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit'
            }}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApprovalSubmit}
            disabled={!approvalNotes.trim()}
          >
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DirectorDashboard; 