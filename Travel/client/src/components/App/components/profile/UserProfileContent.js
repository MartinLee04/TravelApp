import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Typography, Grid, Card, CardContent, 
  Button, Tabs, Tab, Box, Paper, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Autocomplete, Chip
} from '@mui/material';
import { localpath } from '../../localpath';
import PreferencesSurvey from './PreferencesSurvey';
import { theme } from './theme';

// Component displayed when user is logged in
const UserProfileContent = ({ userInfo, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('blogs');
  const [userBlogs, setUserBlogs] = useState([]);
  const [userFlights, setUserFlights] = useState([]);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [profileData, setProfileData] = useState({
    username: userInfo.username || '',
    email: userInfo.email || '',
    first_name: userInfo.first_name || '',
    last_name: userInfo.last_name || '',
    phone_number: userInfo.phone_number || '',
    languages_spoken: userInfo.languages_spoken ? userInfo.languages_spoken.split(', ') : []
  });

  useEffect(() => {
    fetchUserData();
    fetchLanguages();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user blogs
      const blogResponse = await axios.post(localpath + '/api/getUserBlogPosts', {
        userid: userInfo.id
      });
      if (blogResponse.data) {
        setUserBlogs(blogResponse.data);
      }

      // Fetch user flights
      const flightResponse = await axios.post(localpath + '/api/getUserFlights', {
        account_id: userInfo.id
      });
      if (flightResponse.data) {
        setUserFlights(flightResponse.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.post(localpath + '/info/getLanguages');
      if (response.data && response.data.languages) {
        setAvailableLanguages(response.data.languages);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) {
      formatted += cleaned.substring(0, 3);
      if (cleaned.length > 3) {
        formatted += '-' + cleaned.substring(3, 6);
      }
      if (cleaned.length > 6) {
        formatted += '-' + cleaned.substring(6, 10);
      }
    }
    return formatted;
  };

  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData);
  };

  const handleEditDialogOpen = () => {
    setProfileData({
      username: userInfo.username || '',
      email: userInfo.email || '',
      first_name: userInfo.first_name || '',
      last_name: userInfo.last_name || '',
      phone_number: userInfo.phone_number || '',
      languages_spoken: userInfo.languages_spoken ? userInfo.languages_spoken.split(', ') : []
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePhoneChange = (e) => {
    setProfileData({
      ...profileData,
      phone_number: formatPhoneNumber(e.target.value)
    });
  };

  const handleLanguagesChange = (event, newValue) => {
    setProfileData({
      ...profileData,
      languages_spoken: newValue
    });
  };

  const handleProfileUpdate = async () => {
    try {
      // Convert languages array back to comma-separated string
      const languagesString = profileData.languages_spoken.join(', ');
      
      const response = await axios.post(localpath + '/api/updateUserProfile', {
        id: userInfo.id,
        username: profileData.username,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        languages_spoken: languagesString
      });
      
      if (response.data) {
        // Update local userInfo with new data
        userInfo.username = profileData.username;
        userInfo.email = profileData.email;
        userInfo.first_name = profileData.first_name;
        userInfo.last_name = profileData.last_name;
        userInfo.phone_number = profileData.phone_number;
        userInfo.languages_spoken = languagesString;
        
        handleEditDialogClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" textAlign="center" sx={{ fontWeight: 800, fontSize: 40 }}>
          Hello, {userInfo.username}!
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              User Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>
                  Username:
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {userInfo.username}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>
                  Email:
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {userInfo.email || 'Not set'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>
                  Name:
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {userInfo.first_name} {userInfo.last_name}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>
                  Phone:
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {userInfo.phone_number || 'Not set'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography sx={{ width: 120, color: 'text.secondary' }}>
                  Languages:
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {userInfo.languages_spoken || 'Not set'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleEditDialogOpen}
                sx={{ 
                  textTransform: 'none',
                  px: 3
                }}
              >
                Edit Profile
              </Button>
              
              <Button 
                variant="outlined"
                onClick={handleLogout}
                sx={{ 
                  borderColor: theme => theme.palette.primary.main,
                  color: theme => theme.palette.primary.main,
                  textTransform: 'none',
                  px: 3
                }}
              >
                Logout
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': { 
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  minWidth: 120,
                },
                '& .Mui-selected': {
                  color: '#b3cde0',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#b3cde0',
                },
                display: 'flex',
                justifyContent: 'center',
              }}
              centered
            >
              <Tab value="blogs" label="My Blogs" />
              <Tab value="flights" label="Saved Flights" />
              <Tab value="preferences" label="My Preferences" />
            </Tabs>
            
            {activeTab === 'blogs' && (
              <Box sx={{ mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                {userBlogs.length > 0 ? (
                  userBlogs.map((blog, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, background: "#323232" }}>
                      <Typography variant="h6">{blog.header}</Typography>
                      <Typography>Rating: {blog.rating}</Typography>
                      <Typography>{blog.body}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography>No blog posts yet.</Typography>
                )}
              </Box>
            )}
            
            {activeTab === 'flights' && (
              <Box sx={{ mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                {userFlights.length > 0 ? (
                  userFlights.map((flight, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Paper sx={{ 
                        p: 3, 
                        width: '95%',
                        background: "#323232",
                        borderLeft: '4px solid #b3cde0',
                      }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#b3cde0', textAlign: 'center' }}>
                          {flight.header || `Flight: ${flight.origin_code} → ${flight.dep_code}`}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          mb: 4,
                          mt: 3,
                          px: 3
                        }}>
                          <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                            <Typography variant="body2" color="text.secondary">FROM</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>{flight.origin_code}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mx: 4 }}>
                            <Box sx={{ height: 2, width: 60, bgcolor: 'text.disabled' }} />
                            <Typography sx={{ px: 1 }}>✈</Typography>
                            <Box sx={{ height: 2, width: 60, bgcolor: 'text.disabled' }} />
                          </Box>
                          <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
                            <Typography variant="body2" color="text.secondary">TO</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>{flight.dep_code}</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          width: '100%',
                          mb: 4
                        }}>
                          <Box sx={{ width: '50%', pr: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">DEPARTURE</Typography>
                            <Typography sx={{ fontWeight: 500 }}>{flight.dep_date && flight.dep_date.split("T")[0]}</Typography>
                            <Typography>{flight.dep_time}</Typography>
                          </Box>
                          <Box sx={{ width: '50%', pl: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">RETURN</Typography>
                            <Typography sx={{ fontWeight: 500 }}>{flight.ret_date && flight.ret_date.split("T")[0]}</Typography>
                            <Typography>{flight.ret_time}</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          borderTop: '1px solid rgba(179, 205, 224, 0.2)',
                          pt: 2
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main', textAlign: 'right' }}>
                            ${flight.price} {flight.currency}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ textAlign: 'center', mt: 3 }}>No saved flights yet.</Typography>
                )}
              </Box>
            )}
            
            {activeTab === 'preferences' && (
              <Box sx={{ mt: 2 }}>
                <PreferencesSurvey userInfo={userInfo} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile Information</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Username"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Last Name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>
            <TextField
              label="Phone Number"
              name="phone_number"
              value={profileData.phone_number}
              onChange={handlePhoneChange}
              fullWidth
              inputProps={{
                maxLength: 12,
                placeholder: "XXX-XXX-XXXX"
              }}
            />
            <Autocomplete
              multiple
              id="languages-spoken"
              options={availableLanguages}
              value={profileData.languages_spoken}
              onChange={handleLanguagesChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    label={option} 
                    {...getTagProps({ index })} 
                    color="primary"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Languages Spoken"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserProfileContent; 