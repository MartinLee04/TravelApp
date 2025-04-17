import React from 'react';
import { AppBar, Toolbar, IconButton, Button, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation hook
import { useSelector, useDispatch } from 'react-redux';
import { userLogout } from '../../store/loginSlice';
import { userLO } from '../../store/userSlice';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.login.value);
  const userState = useSelector((state) => state.user.value);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleLogout = async () => {
    dispatch(userLO());
    dispatch(userLogout());
    navigate('/profile');
  };

  // Function to determine button color based on the current route
  const getButtonStyle = (path) => ({
    backgroundColor: location.pathname === path ? 'transparent' : 'transparent', // Highlight the active page
    color: location.pathname === path ? '#9FE2BF' : 'inherit',
    fontWeight: location.pathname === path ? 'normal' : 'normal',
  });

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 1 }}
          onClick={() => navigate('/')}
        >
          <HomeIcon />
        </IconButton>

        <IconButton
          color="inherit"
          aria-label={userState[0]?.username ? 'profile' : 'login'}
          style={getButtonStyle('/profile')}
          onClick={() => navigate('/profile')}
        >
          {userState[0]?.username ? <AccountCircleIcon /> : <LoginIcon />}
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 400 }}
        ></Typography>
        <Button
          style={getButtonStyle('/about')}
          onClick={() => navigate('/about')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          About Us
        </Button>
        {isLoggedIn && (
          <Button
            style={getButtonStyle('/blog')}
            onClick={() => navigate('/blog')}
          >
            Blog
          </Button>
        )}
        <Button
          style={getButtonStyle('/filter')}
          onClick={() => navigate('/filter')}
        >
          Filter
        </Button>
        <Button
          style={getButtonStyle('/search')}
          onClick={() => navigate('/search')}
        >
          Search
        </Button>
        {isLoggedIn && (
          <Button
            style={getButtonStyle('/recommend')}
            onClick={() => navigate('/recommend')}
          >
            Recommendations
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
