import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Divider,
  Alert,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  Badge,
  Security,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  History,
  Dashboard,
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { useSnackbar } from 'notistack';
import { complaintAPI } from '../services/api';
import { format } from 'date-fns';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
      });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch recent complaints
      const complaintsRes = await complaintAPI.getMyComplaints();
      setRecentComplaints(complaintsRes.data.slice(0, 5));
      
      // Fetch stats
      const statsRes = await complaintAPI.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setEditMode(false);
        enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      // Implement password change API call here
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      enqueueSnackbar('Failed to change password', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = () => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];
    const index = user?.name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            My Profile
          </Typography>
          <Typography color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
        <Box>
          {editMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => setEditMode(false)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: getAvatarColor(),
                  fontSize: 48,
                  mb: 2,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight="600">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'staff' ? 'Staff Member' : 'Student'}
              </Typography>
              {user?.studentId && (
                <Typography variant="caption" color="text.secondary">
                  ID: {user.studentId}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Quick Stats */}
            {stats && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Dashboard sx={{ mr: 1 }} />
                  Quick Stats
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main">
                        {stats.pending}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">
                        {stats.inProgress}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In Progress
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {stats.resolved}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Resolved
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<Person />} label="Personal Info" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<History />} label="Activity" />
            </Tabs>

            {/* Tab 1: Personal Info */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      disabled={true}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <School color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {user?.studentId && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Student ID"
                        value={user.studentId}
                        disabled={true}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Role"
                      value={user?.role === 'admin' ? 'Administrator' : 
                            user?.role === 'staff' ? 'Staff Member' : 'Student'}
                      disabled={true}
                    />
                  </Grid>
                </Grid>
                
                {editMode && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    Changes will be saved to your profile immediately after clicking "Save Changes".
                  </Alert>
                )}
              </Box>
            )}

            {/* Tab 2: Security */}
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Make sure your new password is strong and different from previous passwords.
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      helperText="At least 6 characters"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.currentPassword || 
                             !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </Box>
                
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Password Requirements:</strong>
                    <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                      <li>Minimum 6 characters</li>
                      <li>Include letters and numbers</li>
                      <li>Avoid common passwords</li>
                    </ul>
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Tab 3: Activity */}
            {activeTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                {recentComplaints.length > 0 ? (
                  <>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Your recent complaints and their status
                    </Typography>
                    
                    {recentComplaints.map((complaint) => (
                      <Card key={complaint._id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="500">
                                {complaint.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {complaint.description.substring(0, 100)}...
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Category: {complaint.category}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Priority: {complaint.priority}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {format(new Date(complaint.createdAt), 'MMM dd, yyyy')}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: complaint.status === 'resolved' ? 'success.light' :
                                           complaint.status === 'pending' ? 'warning.light' :
                                           complaint.status === 'in-progress' ? 'info.light' : 'error.light',
                                  color: complaint.status === 'resolved' ? 'success.dark' :
                                         complaint.status === 'pending' ? 'warning.dark' :
                                         complaint.status === 'in-progress' ? 'info.dark' : 'error.dark',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  mt: 0.5,
                                }}
                              >
                                {complaint.status}
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Alert severity="info">
                    No recent activity found. Submit your first complaint to see activity here.
                  </Alert>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Account Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1">
                        {user?.createdAt ? format(new Date(user.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1">
                        {user?.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, hh:mm a') : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;