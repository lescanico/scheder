import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  Download,
  Description,
  Person,
  LocalHospital,
  Info
} from '@mui/icons-material';

const PTOForms = () => {
  const handleDownload = (filename, displayName) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const forms = [
    {
      filename: 'Time off request form MD OPC 2024.pdf',
      displayName: 'Time Off Request Form - MD OPC 2024.pdf',
      title: 'MD Time Off Request Form',
      description: 'Official Penn Psychiatry time off request form for Medical Doctors',
      icon: <Person />,
      role: 'provider'
    },
    {
      filename: 'Time off request form NP OPC 2024.pdf',
      displayName: 'Time Off Request Form - NP OPC 2024.pdf',
      title: 'NP Time Off Request Form',
      description: 'Official Penn Psychiatry time off request form for Nurse Practitioners',
      icon: <LocalHospital />,
      role: 'provider'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          PTO Request Forms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Download official Penn Psychiatry time off request forms for your schedule blocking requests.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Instructions:</strong> Download the appropriate form for your role, fill it out completely, 
          and upload it when submitting your schedule blocking request. Forms must be completed and signed 
          before approval.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} md={6} key={form.filename}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {form.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {form.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleDownload(form.filename, form.displayName)}
                  fullWidth
                  size="large"
                >
                  Download Form
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Info sx={{ mr: 1 }} />
          Important Information
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText 
              primary="Complete Form Requirements"
              secondary="All fields must be filled out completely, including dates, reason for time off, and provider signature."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText 
              primary="Upload with Request"
              secondary="Upload the completed form when submitting your schedule blocking request through the system."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText 
              primary="Approval Process"
              secondary="Forms will be reviewed by admin and director teams. Incomplete forms may delay approval."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText 
              primary="Contact Support"
              secondary="If you have questions about the forms or approval process, contact your department administrator."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default PTOForms; 