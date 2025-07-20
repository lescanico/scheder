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
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Pending,
  Schedule,
  Edit,
  Delete,
  Upload,
  Email
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesDialog, setNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesType, setNotesType] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequest(id);
      setRequest(response.data);
    } catch (error) {
      setError('Failed to load request details');
      console.error('Load request error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const handleEditRequest = () => {
    // Navigate to edit form
    navigate(`/request/${id}/edit`);
  };

  const handleDeleteRequest = () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await requestService.deleteRequest(id);
      setDeleteDialog(false);
      navigate('/provider'); // Navigate back to provider portal
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAddNotes = (type) => {
    setNotesType(type);
    setNotes('');
    setNotesDialog(true);
  };

  const handleSubmitNotes = async () => {
    try {
      if (notesType === 'admin') {
        await requestService.addAdminNotes(id, notes);
      } else {
        await requestService.addDirectorNotes(id, notes);
      }
      setNotesDialog(false);
      loadRequest(); // Reload to show new notes
    } catch (error) {
      setError('Failed to add notes');
      console.error('Add notes error:', error);
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
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!request) {
    return (
      <Box>
        <Typography variant="h6" color="text.secondary">
          Request not found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4">
          Request Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Request Information */}
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getRequestTypeDisplay(request.requestType)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(request.status)}
                    label={request.status}
                    color={getStatusColor(request.status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Provider
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {request.providerName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDateTime(request.createdAt)}
                  </Typography>
                </Grid>

                {request.requestType === 'specific_time' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {formatDate(request.startDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Time
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {request.startTime} - {request.endTime}
                      </Typography>
                    </Grid>
                  </>
                )}

                {request.requestType === 'full_day' && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(request.startDate)}
                    </Typography>
                  </Grid>
                )}

                {request.requestType === 'multiple_days' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {formatDate(request.startDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        End Date
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {formatDate(request.endDate)}
                      </Typography>
                    </Grid>
                  </>
                )}

                {request.requestType === 'recurring' && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pattern
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {request.recurringPattern}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {request.reason}
                  </Typography>
                </Grid>

                {request.ptoRequired && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      PTO Form Required
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {request.ptoFormPath ? (
                        <Button
                          variant="outlined"
                          size="small"
                          href={request.ptoFormPath}
                          target="_blank"
                        >
                          View PTO Form
                        </Button>
                      ) : (
                        'Not uploaded yet'
                      )}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Notes & Comments
                </Typography>
                {(user.role === 'admin' || user.role === 'director') && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddNotes(user.role === 'admin' ? 'admin' : 'director')}
                  >
                    Add Notes
                  </Button>
                )}
              </Box>

              {request.adminNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Admin Notes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {request.adminNotes}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {request.directorNotes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Director Notes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {request.directorNotes}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {!request.adminNotes && !request.directorNotes && (
                <Typography variant="body2" color="text.secondary">
                  No notes available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Status Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Current Status"
                    secondary={
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                
                {request.approvedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Approved By"
                      secondary={request.approvedBy}
                    />
                  </ListItem>
                )}
                
                {request.rejectedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Rejected By"
                      secondary={request.rejectedBy}
                    />
                  </ListItem>
                )}
                
                {request.rejectionReason && (
                  <ListItem>
                    <ListItemText
                      primary="Rejection Reason"
                      secondary={request.rejectionReason}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {request.status === 'pending' && user.role === 'provider' && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      fullWidth
                      onClick={handleEditRequest}
                    >
                      Edit Request
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      fullWidth
                      onClick={handleDeleteRequest}
                    >
                      Delete Request
                    </Button>
                  </>
                )}

                {request.ptoRequired && !request.ptoFormPath && user.role === 'provider' && (
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    Upload PTO Form
                  </Button>
                )}

                {user.role === 'admin' && request.status === 'pending' && (
                  <Button
                    variant="outlined"
                    startIcon={<Email />}
                    fullWidth
                  >
                    Send Clarification
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notes Dialog */}
      <Dialog open={notesDialog} onClose={() => setNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {notesType === 'admin' ? 'Admin' : 'Director'} Notes
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitNotes}
            disabled={!notes.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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

export default RequestDetail; 