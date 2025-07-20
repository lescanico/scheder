import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';
import { useNavigate } from 'react-router-dom';

const steps = ['Request Details', 'Date & Time', 'Review & Submit'];

const RequestForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    requestType: '',
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    reason: '',
    ptoRequired: false,
    recurringPattern: '',
    recurringDays: [],
    recurringMonths: []
  });

  const requestTypes = [
    { value: 'specific_time', label: 'Specific Time Period' },
    { value: 'full_day', label: 'Full Day' },
    { value: 'multiple_days', label: 'Multiple Days' },
    { value: 'recurring', label: 'Recurring' }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const months = [
    { value: 'january', label: 'January' },
    { value: 'february', label: 'February' },
    { value: 'march', label: 'March' },
    { value: 'april', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'june', label: 'June' },
    { value: 'july', label: 'July' },
    { value: 'august', label: 'August' },
    { value: 'september', label: 'September' },
    { value: 'october', label: 'October' },
    { value: 'november', label: 'November' },
    { value: 'december', label: 'December' }
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        providerId: user.providerId,
        providerName: user.name,
        providerEmail: user.email,
        ...formData,
        startDate: formData.startDate?.toISOString().split('T')[0],
        endDate: formData.endDate?.toISOString().split('T')[0],
        startTime: formData.startTime?.toTimeString().slice(0, 5),
        endTime: formData.endTime?.toTimeString().slice(0, 5)
      };

      const response = await requestService.createRequest(requestData);
      
      if (response.success) {
        setSuccess('Request submitted successfully!');
        setTimeout(() => {
          navigate('/provider');
        }, 2000);
      } else {
        setError(response.error || 'Failed to submit request');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.requestType && formData.reason;
      case 1:
        if (formData.requestType === 'specific_time') {
          return formData.startDate && formData.startTime && formData.endTime;
        } else if (formData.requestType === 'multiple_days') {
          return formData.startDate && formData.endDate;
        } else if (formData.requestType === 'recurring') {
          return formData.recurringPattern;
        } else {
          return formData.startDate;
        }
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Request Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Request Type</InputLabel>
                  <Select
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    label="Request Type"
                  >
                    {requestTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a detailed reason for your schedule blocking request..."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.ptoRequired}
                      onChange={(e) => setFormData({ ...formData, ptoRequired: e.target.checked })}
                    />
                  }
                  label="PTO Form Required"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Date & Time Configuration
            </Typography>
            <Grid container spacing={3}>
              {formData.requestType === 'specific_time' && (
                <>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(date) => setFormData({ ...formData, startDate: date })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="Start Time"
                      value={formData.startTime}
                      onChange={(time) => setFormData({ ...formData, startTime: time })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TimePicker
                      label="End Time"
                      value={formData.endTime}
                      onChange={(time) => setFormData({ ...formData, endTime: time })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </>
              )}

              {formData.requestType === 'full_day' && (
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Date"
                    value={formData.startDate}
                    onChange={(date) => setFormData({ ...formData, startDate: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}

              {formData.requestType === 'multiple_days' && (
                <>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(date) => setFormData({ ...formData, startDate: date })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date"
                      value={formData.endDate}
                      onChange={(date) => setFormData({ ...formData, endDate: date })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </>
              )}

              {formData.requestType === 'recurring' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Recurring Pattern</InputLabel>
                      <Select
                        value={formData.recurringPattern}
                        onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                        label="Recurring Pattern"
                      >
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.recurringPattern === 'weekly' && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Select Days of Week:
                      </Typography>
                      <Grid container spacing={1}>
                        {daysOfWeek.map((day) => (
                          <Grid item key={day.value}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.recurringDays.includes(day.value)}
                                  onChange={(e) => {
                                    const newDays = e.target.checked
                                      ? [...formData.recurringDays, day.value]
                                      : formData.recurringDays.filter(d => d !== day.value);
                                    setFormData({ ...formData, recurringDays: newDays });
                                  }}
                                />
                              }
                              label={day.label}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Request Type:</strong> {requestTypes.find(t => t.value === formData.requestType)?.label}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Reason:</strong> {formData.reason}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>PTO Required:</strong> {formData.ptoRequired ? 'Yes' : 'No'}
                </Typography>
                {formData.startDate && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Start Date:</strong> {formData.startDate.toLocaleDateString()}
                  </Typography>
                )}
                {formData.endDate && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>End Date:</strong> {formData.endDate.toLocaleDateString()}
                  </Typography>
                )}
                {formData.startTime && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Start Time:</strong> {formData.startTime.toLocaleTimeString()}
                  </Typography>
                )}
                {formData.endTime && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>End Time:</strong> {formData.endTime.toLocaleTimeString()}
                  </Typography>
                )}
                {formData.recurringPattern && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Recurring Pattern:</strong> {formData.recurringPattern}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        New Schedule Blocking Request
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !isStepValid()}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RequestForm; 