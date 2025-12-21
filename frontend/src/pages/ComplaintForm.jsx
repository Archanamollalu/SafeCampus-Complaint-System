import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Send,
  ArrowBack,
  Description,
  Category,
  AttachFile,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { complaintAPI } from '../services/api';
import { motion } from 'framer-motion';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Form steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Complaint Details', 'Additional Info', 'Review & Submit'];
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    department: '',
    evidence: [],
    contactPreference: 'email',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Categories and priorities
  // Only ragging-related categories for this platform
  const categories = [
    { label: 'Ragging — Physical', value: 'ragging-physical' },
    { label: 'Ragging — Verbal', value: 'ragging-verbal' },
    { label: 'Ragging — Sexual', value: 'ragging-sexual' },
    { label: 'Ragging — Cyber', value: 'ragging-cyber' },
    { label: 'Ragging — Group/Initiation', value: 'ragging-group' },
    { label: 'Ragging — Other', value: 'ragging-other' },
  ];


  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Administration',
    'Library',
    'Hostel',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (formData.title.trim().length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length < 20) newErrors.description = 'Description should be at least 20 characters';
    }
    
    if (step === 1) {
      if (!formData.department) newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data ensuring category is lowercase and properly formatted
      const submitData = {
        title: formData.title.trim(),
        category: formData.category.toLowerCase().trim(), // Ensure lowercase for enum validation
        description: formData.description.trim(),
        department: formData.department.toLowerCase().trim(), // Normalize department
        contactPreference: formData.contactPreference,
        isAnonymous: isAnonymous
      };

      // If there are files, submit as multipart/form-data
      if (formData.evidence && formData.evidence.length > 0) {
        const fd = new FormData();
        fd.append('title', submitData.title);
        fd.append('category', submitData.category);
        fd.append('description', submitData.description);
        fd.append('department', submitData.department);
        fd.append('contactPreference', submitData.contactPreference);
        fd.append('isAnonymous', submitData.isAnonymous);

        formData.evidence.forEach((file) => fd.append('evidence', file));
        // Let axios set the Content-Type with correct boundary for FormData
        await complaintAPI.create(fd);
      } else {
        // No files, send JSON
        await complaintAPI.create(submitData);
      }
      enqueueSnackbar('Complaint submitted successfully!', { variant: 'success' });
      navigate('/student/dashboard');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to submit complaint';
      console.error('Complaint submission error details:', {
        status: error?.response?.status,
        message: msg,
        data: error?.response?.data,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          headers: error?.config?.headers
        }
      });
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.evidence.length > 5) {
      enqueueSnackbar('Maximum 5 files allowed', { variant: 'warning' });
      return;
    }
    setFormData({
      ...formData,
      evidence: [...formData.evidence, ...files],
    });
  };

  const removeFile = (index) => {
    setFormData({
      ...formData,
      evidence: formData.evidence.filter((_, i) => i !== index),
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complaint Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  InputProps={{
                    startAdornment: <Description sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                    startAdornment={<Category sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                </FormControl>
              </Grid>


              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description || 'Describe your complaint in detail (minimum 20 characters)'}
                  required
                  multiline
                  rows={4}
                  placeholder="Please provide detailed information about your complaint..."
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.department} required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept.toLowerCase()}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Contact Preference</InputLabel>
                  <Select
                    name="contactPreference"
                    value={formData.contactPreference}
                    onChange={handleChange}
                    label="Contact Preference"
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                    <MenuItem value="none">No Contact Required</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                 <FormControlLabel
                  control={
                  <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  color="primary"
                />
                }
                label="Submit this complaint anonymously (your identity will not be visible to admins)"
                />
              </Grid>


              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachFile sx={{ mr: 1 }} />
                      Attach Evidence (Optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Upload supporting documents, images, or screenshots (Max 5 files, 5MB each)
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <input
                        accept="image/*,.pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        id="evidence-upload"
                        multiple
                        type="file"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="evidence-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AttachFile />}
                        >
                          Choose Files
                        </Button>
                      </label>
                    </Box>

                    {formData.evidence.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Files ({formData.evidence.length}/5):
                        </Typography>
                        {formData.evidence.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              mb: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> All submitted complaints are recorded on blockchain for
                    transparency and cannot be altered. Please ensure all information is accurate.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                Review Your Complaint
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formData.title}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                  </Typography>
                </Grid>
                
                
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formData.department.charAt(0).toUpperCase() + formData.department.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {formData.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Attached Files
                  </Typography>
                  <Typography variant="body1">
                    {formData.evidence.length} file(s) attached
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Your complaint will be stored on blockchain ensuring data integrity and transparency.
                You can track its status in real-time from your dashboard.
              </Typography>
            </Alert>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student/dashboard')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            File New Complaint
          </Typography>
          <Typography color="text.secondary">
            Submit your complaint with complete transparency
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
        {renderStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<Send />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComplaintForm;