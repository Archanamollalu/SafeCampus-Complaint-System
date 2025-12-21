import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Hidden,
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  Shield,
  Security,
  VerifiedUser,
  ArrowForward,
  Smartphone,
  DesktopWindows,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  };

 const featureCards = [
  { icon: <Shield />, title: '24/7 Monitoring', desc: 'Continuous oversight and rapid response' },
  { icon: <VerifiedUser />, title: 'Blockchain Security', desc: 'Immutable and tamper-proof complaint records' },
  { icon: <Security />, title: 'AI Severity Analysis', desc: 'Automatically classifies complaints based on severity' },
];


  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      py: { xs: 2, sm: 4, md: 6 },
      px: { xs: 1, sm: 2, md: 3 },
      overflowX: 'hidden',
    }}>
      <Container maxWidth={isMobile ? false : 'xl'} disableGutters={isMobile}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ 
            minHeight: { xs: 'auto', md: '80vh' },
            alignItems: 'center',
          }}>
            {/* Left side - Hero Section */}
            <Grid item xs={12} lg={7}>
              <Box sx={{ 
                color: 'white',
                pr: { lg: 6 },
                mb: { xs: 3, lg: 0 },
                textAlign: { xs: 'center', md: 'left' },
              }}>
                {/* Logo/Brand */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 4,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <School sx={{ 
                    fontSize: { xs: 36, sm: 42, md: 48 }, 
                    mr: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }} />
                  <Typography variant="h4" fontWeight="800" sx={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  }}>
                    SafeCampus
                  </Typography>
                </Box>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <Typography variant="h1" sx={{
                    fontWeight: 900,
                    fontSize: { 
                      xs: '1.8rem', 
                      sm: '2.5rem', 
                      md: '3rem', 
                      lg: '3.5rem' 
                    },
                    lineHeight: { xs: 1.2, md: 1.1 },
                    mb: 3,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  }}>
                    Report <Box component="span" sx={{ color: '#ff6b6b' }}>Ragging</Box> 
                    <br />Safely & Securely
                  </Typography>
                </motion.div>

                {/* Subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <Typography variant="h5" sx={{
                    fontWeight: 400,
                    opacity: 0.9,
                    mb: { xs: 3, md: 5 },
                    maxWidth: '600px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    mx: { xs: 'auto', md: 0 },
                  }}>
                  A confidential platform for students to report ragging incidents and other concerns with strong data protection.
                  </Typography>
                </motion.div>

                {/* Feature Cards - Hidden on mobile */}
                <Hidden mdDown>
                  <Grid container spacing={3} sx={{ mb: 5 }}>
                    {featureCards.map((feature, index) => (
                      <Grid item xs={12} md={4} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        >
                          <Card sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 3,
                            color: 'white',
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              background: 'rgba(255, 255, 255, 0.15)',
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                mb: 2,
                              }}>
                                {React.cloneElement(feature.icon, { sx: { fontSize: 28 } })}
                              </Box>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {feature.title}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {feature.desc}
                              </Typography>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Hidden>

                {/* Mobile-friendly feature indicators */}
                <Hidden mdUp>
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} justifyContent="center">
                      {featureCards.map((feature, index) => (
                        <Grid item xs={4} key={index}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.2)',
                              mb: 1,
                            }}>
                              {React.cloneElement(feature.icon, { sx: { fontSize: 20 } })}
                            </Box>
                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                              {feature.title}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Hidden>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 2, md: 4 },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VerifiedUser sx={{ fontSize: { xs: 16, md: 20 }, opacity: 0.8 }} />
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8,
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}>
                        GDPR Compliant
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security sx={{ fontSize: { xs: 16, md: 20 }, opacity: 0.8 }} />
                      <Typography variant="body2" sx={{ 
                        opacity: 0.8,
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}>
                        256-bit Encryption
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>

                {/* Device Indicator */}
                {isMobile && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mt: 3,
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    <Smartphone sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="caption">
                      Scroll down for login form
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Right side - Login Form */}
            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper elevation={isMobile ? 6 : 24} sx={{
                  borderRadius: { xs: 3, md: 4 },
                  overflow: 'hidden',
                  boxShadow: isMobile 
                    ? '0 10px 40px rgba(0,0,0,0.2)' 
                    : '0 20px 60px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                  position: 'relative',
                  mx: { xs: 1, sm: 2, md: 0 },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  }
                }}>
                  {/* Form Header */}
                  <Box sx={{
                    p: { xs: 3, sm: 4 },
                    pb: 0,
                    textAlign: 'center',
                  }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 60, md: 80 },
                      height: { xs: 60, md: 80 },
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      mb: 2,
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    }}>
                      <LoginIcon sx={{ fontSize: { xs: 28, md: 40 }, color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h3" fontWeight="800" gutterBottom sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    }}>
                      Welcome Back
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ 
                      mb: 1,
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}>
                      Sign in to access your secure dashboard
                    </Typography>
                  </Box>

                  {/* Form Content */}
                  <Box sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 1, sm: 2 } }}>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Alert severity="error" sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                            background: 'rgba(244, 67, 54, 0.05)',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            py: { xs: 0.5, sm: 1 },
                          }}>
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Box component="form" onSubmit={handleSubmit}>
                      {/* Email Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          margin="normal"
                          required
                          size={isMobile ? "small" : "medium"}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ 
                                  color: 'primary.main',
                                  fontSize: { xs: 20, md: 24 }
                                }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.main',
                                }
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.875rem', md: '1rem' },
                            }
                          }}
                        />
                      </motion.div>

                      {/* Password Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          margin="normal"
                          required
                          size={isMobile ? "small" : "medium"}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock sx={{ 
                                  color: 'primary.main',
                                  fontSize: { xs: 20, md: 24 }
                                }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size={isMobile ? "small" : "medium"}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.main',
                                }
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.875rem', md: '1rem' },
                            }
                          }}
                        />
                      </motion.div>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 1, 
                        mb: 3 
                      }}>
                        <Link 
                          component={RouterLink} 
                          to="/forgot-password" 
                          sx={{ 
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 500,
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          Forgot Password?
                        </Link>
                      </Box>

                      {/* Submit Button */}
                      <motion.div
                        whileHover={{ scale: isMobile ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size={isMobile ? "medium" : "large"}
                          disabled={loading}
                          endIcon={!loading && <ArrowForward />}
                          sx={{
                            py: isMobile ? 1.2 : 1.8,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                              transform: isMobile ? 'none' : 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: 'linear-gradient(135deg, #cccccc 0%, #999999 100%)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                  '0%': { transform: 'rotate(0deg)' },
                                  '100%': { transform: 'rotate(360deg)' },
                                }
                              }} />
                              Signing in...
                            </Box>
                          ) : 'Sign In'}
                        </Button>
                      </motion.div>
                    </Box>

                    {/* Register Link */}
                    <Box sx={{ 
                      textAlign: 'center', 
                      mt: 4,
                      pt: 3,
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 1,
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}>
                        New to SafeCampus?
                      </Typography>
                      <Link 
                        component={RouterLink} 
                        to="/register"
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: { xs: '0.875rem', md: '0.95rem' },
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Create an account
                      </Link>
                    </Box>

                    {/* Demo Credentials */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <Box sx={{ 
                        mt: 4, 
                        p: 2, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                      }}>
                        <Typography variant="caption" fontWeight="600" color="primary.main" display="block" gutterBottom sx={{
                          fontSize: { xs: '0.7rem', md: '0.75rem' }
                        }}>
                          Demo Credentials
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ 
                          lineHeight: 1.6,
                          fontSize: { xs: '0.7rem', md: '0.75rem' }
                        }}>
                          <strong>Student:</strong> student@example.com / password<br />
                          <strong>Admin:</strong> admin@example.com / password<br />
                          <strong>Staff:</strong> staff@example.com / password
                        </Typography>
                      </Box>
                    </motion.div>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;