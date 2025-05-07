import React, { useState, useEffect } from 'react';
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import HomeIcon from '@mui/icons-material/Home';

import {localpath} from '../../localpath'

//navbar import
import Navbar from '../navbar';

//redux import
import { useSelector, useDispatch } from 'react-redux'
import { userLogin, userLogout  } from '../../store/loginSlice'
import { userLI, userLO  } from '../../store/userSlice'

import { TextField, Paper, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";


const getDesignTokens = (mode) => ({
  typography: {
    fontFamily: 'Montserrat',
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: "#E9DB5D" },
          text: { primary: "#000" },
        }
      : {
          primary: { main: "#b3cde0" },
          success: { main: "#9FE2BF" },
          text: { primary: '#b3cde0' },
        }),
  },
});

//////////////////////// HELPER FUNCTIONS ////////////////////////////////////

// Helper function to format date
const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    timeZone: 'UTC',
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Updated helper function for submitting a blog post with error handling
const submitBlogPost = async (userState, blogTitle, blogRating, blogBody, selectedCity, fetchBlogPosts, setBlogTitle, setBlogRating, setBlogBody) => {
  try {
    const response = await fetch(localpath+'/api/addBlogPost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: userState[0].id,
        header: blogTitle,
        rating: blogRating,
        body: blogBody,
        city_id: selectedCity,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      // Return error object instead of console logging
      return { 
        success: false, 
        error: result.error || 'Failed to create blog post'
      };
    }

    fetchBlogPosts();
    setBlogTitle('');
    setBlogRating('');
    setBlogBody('');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: 'Error during blog submission: ' + error.message 
    };
  }
};

// Helper function for deleting a blog post
const deleteBlogPost = async (postId, userId, fetchBlogPosts) => {
  try {
    const response = await fetch(`${localpath}/api/deleteBlogPost/${postId}/${userId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.error || 'Failed to delete blog post');
      return;
    }

    // Refresh the blog posts list
    fetchBlogPosts();
  } catch (error) {
    console.error('Error during blog deletion:', error);
    alert('An error occurred while deleting the post');
  }
};

function Blog() {
  const [mode, setMode] = useState('dark');
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const navigate = useNavigate();

  // redux login state
  const loginState = useSelector(state => state.login.value)
  const userState = useSelector(state => state.user.value)
  const dispatch = useDispatch()
  
  const handleLogout= async (e) => {
    dispatch(userLO())
    dispatch(userLogout());
    navigate("/profile");
  };

  const [blogTitle, setBlogTitle] = useState('');
  const [blogRating, setBlogRating] = useState(1);
  const [blogBody, setBlogBody] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [blogPosts, setBlogPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(localpath+'/api/getAllBlogPosts');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      
      const fetchedData = await response.json();
      const formattedData = fetchedData.map(post => ({
        id: post.post_id,
        header: post.header,
        rating: post.rating,
        body: post.body,
        city_id: post.city_id,
        city_name: post.city,
        country: post.country,
        username: post.username,
        date_posted: post.date_posted,
        account_id: post.account_id,
      }));
      
      setBlogPosts(formattedData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(localpath + '/api/getTravelDestinations');
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const fetchedCities = await response.json();
  
        const transformedCities = fetchedCities.map(city => ({
          city_id: city.destination_id,
          city_name: city.city,
        }));
  
        setCities([{ city_id: '', city_name: 'All Cities' }, ...transformedCities]);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  let filteredBlogPosts = blogPosts;
  if (filterCity) {
    filteredBlogPosts = blogPosts.filter(post => post.city_id === filterCity);
  }

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;
    
    if (!blogTitle.trim()) {
      tempErrors.blogTitle = "Blog title is required";
      isValid = false;
    }
    
    if (!selectedCity) {
      tempErrors.selectedCity = "Please select a city";
      isValid = false;
    }
    
    if (!blogBody.trim()) {
      tempErrors.blogBody = "Blog content is required";
      isValid = false;
    }
    
    if (blogRating < 1 || blogRating > 10) {
      tempErrors.blogRating = "Rating must be between 1 and 10";
      isValid = false;
    }
    
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    } else if (userState[0].id === 0) {
      setErrors({...errors, auth: 'Please log in to your account before posting'});
      return;
    } else {
      const result = await submitBlogPost(
        userState, 
        blogTitle, 
        blogRating, 
        blogBody, 
        selectedCity, 
        fetchBlogPosts, 
        setBlogTitle, 
        setBlogRating, 
        setBlogBody
      );
      
      if (!result.success) {
        setErrors({...errors, submission: result.error});
      } else {
        // Clear any existing errors on successful submission
        setErrors({});
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />

      <Grid container spacing={2} p={4}>
        <Grid item xs={12}>
          <Typography variant="h4" textAlign="center" sx={{ fontWeight: 1000, fontSize: 50, mb: 4 }}>
            BLOG POSTS
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ flexGrow: 1, p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4, mb: 5, borderRadius: 2 }}>
          <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 8 }}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Create New Blog Post
              </Typography>
              {errors.auth && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.auth}
                </Typography>
              )}
              {errors.submission && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.submission}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Blog Title"
                value={blogTitle}
                onChange={(e) => {
                  setBlogTitle(e.target.value);
                  setErrors({...errors, blogTitle: ''});
                }}
                fullWidth
                error={!!errors.blogTitle}
                helperText={errors.blogTitle}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.blogRating} sx={{ mb: 1 }}>
                <InputLabel>Rating (1-10)</InputLabel>
                <Select
                  value={blogRating}
                  onChange={(e) => {
                    setBlogRating(e.target.value);
                    setErrors({...errors, blogRating: ''});
                  }}
                  label="Rating (1-10)"
                >
                  {[...Array(10)].map((_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </Select>
                {errors.blogRating && (
                  <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.blogRating}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.selectedCity} sx={{ mb: 1 }}>
                <InputLabel>City</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setErrors({...errors, selectedCity: ''});
                  }}
                  label="City"
                >
                  {cities.filter(city => city.city_id !== '').map((city) => (
                    <MenuItem key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.selectedCity && (
                  <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.selectedCity}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Blog Content"
                value={blogBody}
                onChange={(e) => {
                  setBlogBody(e.target.value);
                  setErrors({...errors, blogBody: ''});
                }}
                multiline
                rows={4}
                fullWidth
                error={!!errors.blogBody}
                helperText={errors.blogBody}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                size="large"
                sx={{ 
                  minWidth: 150, 
                  py: 1, 
                  fontSize: '1rem',
                  borderRadius: 2
                }}
              >
                Submit Post
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Blog Posts
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <FormControl sx={{ minWidth: 250 }} size="medium">
                <InputLabel>Filter by City</InputLabel>
                <Select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  label="Filter by City"
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {cities.filter(city => city.city_id !== '').map((city) => (
                    <MenuItem key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {filteredBlogPosts.length > 0 ? (
            <Grid container spacing={3}>
              {filteredBlogPosts.map((post) => (
                <Grid item xs={12} key={post.id}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      transition: 'transform 0.2s, box-shadow 0.2s', 
                      '&:hover': { 
                        transform: 'translateY(-3px)', 
                        boxShadow: 6 
                      } 
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {post.header}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 2, 
                            display: 'inline-block', 
                            bgcolor: 'primary.main', 
                            color: 'background.paper', 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontWeight: 500 
                          }}
                        >
                          Rating: {post.rating}/10
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                          {post.body}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            City: {post.city_name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            Country: {post.country}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Posted by: <span style={{ fontWeight: 600 }}>{post.username}</span>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            Posted: {formatDate(post.date_posted)}
                          </Typography>
                        </Box>
                        
                        {userState[0].id === post.account_id && (
                          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="medium" 
                              sx={{ 
                                mt: 1,
                                minWidth: 120,
                                borderRadius: 1.5
                              }}
                              onClick={() => deleteBlogPost(post.id, userState[0].id, fetchBlogPosts)}
                            >
                              Delete Post
                            </Button>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">No blog posts available.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {filterCity ? "Try selecting a different city or view all posts." : "Be the first to create a blog post!"}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default Blog;