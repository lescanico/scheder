import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Schedule,
  Assessment,
  AccountCircle,
  Notifications,
  Group,
  Description
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScheduleRequestsClick = () => {
    
    // Route to appropriate dashboard based on user role
    if (user?.role === 'provider') {
      navigate('/provider');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'director') {
      navigate('/director');
    } else {
      navigate('/dashboard');
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { 
        text: 'Schedule Requests', 
        icon: <Schedule />, 
        path: user?.role === 'provider' ? '/provider' : user?.role === 'admin' ? '/admin' : user?.role === 'director' ? '/director' : '/dashboard',
        onClick: handleScheduleRequestsClick
      },
    ];

    // Add PTO Forms menu for provider role
    if (user?.role === 'provider') {
      baseItems.push(
        { text: 'PTO Forms', icon: <Description />, path: '/pto-forms' }
      );
    }

    // Add Users menu for admin and director roles
    if (user?.role === 'admin' || user?.role === 'director') {
      baseItems.push(
        { text: 'Users', icon: <Group />, path: '/users' }
      );
    }

    // Only show Reports for admin and director
    if (user?.role === 'admin' || user?.role === 'director') {
      baseItems.push(
        { text: 'Reports', icon: <Assessment />, path: '/reports' }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  // Show loading spinner if still loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img 
          src="/favicon.png" 
          alt="Scheder Logo" 
          style={{ height: 40, width: 'auto' }}
        />
        <Typography variant="h6" noWrap component="div">
          OPC Schedule Management System 
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Determine if item is selected based on current path
          const isSelected = location.pathname === item.path || 
                           (item.text === 'Schedule Requests' && 
                            (location.pathname === '/provider' || location.pathname === '/admin' || location.pathname === '/director'));
          
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  navigate(item.path);
                }
                if (isMobile) setMobileOpen(false);
              }}
              selected={isSelected}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(153, 0, 0, 0.08)', // Penn Red with opacity
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(153, 0, 0, 0.12)', // Penn Red with more opacity
                  '&:hover': {
                    backgroundColor: 'rgba(153, 0, 0, 0.16)', // Penn Red with even more opacity
                  },
                },
                '&.Mui-selected .MuiListItemIcon-root': {
                  color: '#990000', // Penn Red
                },
                '&.Mui-selected .MuiListItemText-primary': {
                  color: '#990000', // Penn Red
                  fontWeight: 600,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isSelected ? '#990000' : 'inherit',
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: isSelected ? '#990000' : 'inherit',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <img 
              src="/favicon.png" 
              alt="Scheder Logo" 
              style={{ height: 32, width: 'auto' }}
            />
            <Typography variant="h6" noWrap component="div">
              Schedule Management System
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: 250 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 250px)` },
          ml: { md: '250px' },
          mt: '64px',
        }}
      >
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout; 