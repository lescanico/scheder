import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  AdminPanelSettings,
  SupervisorAccount,
  Add,
  Notifications,
  Settings,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard'
      }
    ];

    if (user?.role === 'provider') {
      baseItems.push(
        {
          text: 'My Portal',
          icon: <Person />,
          path: '/provider'
        },
        {
          text: 'New Request',
          icon: <Add />,
          path: '/request/new'
        }
      );
    }

    if (user?.role === 'admin') {
      baseItems.push(
        {
          text: 'Admin Dashboard',
          icon: <AdminPanelSettings />,
          path: '/admin'
        }
      );
    }

    if (user?.role === 'director') {
      baseItems.push(
        {
          text: 'Director Dashboard',
          icon: <SupervisorAccount />,
          path: '/director'
        }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src="/penn-psych.png" 
            alt="Penn Psychiatry" 
            style={{ height: 32, width: 'auto' }}
          />
          <Typography variant="h6" noWrap component="div">
            Penn Psychiatry
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <img 
              src="/penn-psych.png" 
              alt="Penn Psychiatry" 
              style={{ height: 32, width: 'auto' }}
            />
            <Typography variant="h6" noWrap component="div">
              Penn Psychiatry - Schedule Management
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 