import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Avatar,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  CheckCircle,
  Pending,
  TrendingUp,
  Error as ErrorIcon,
  Message,
  AttachFile,
  Download,
  Person,
  Schedule,
  Category,
  School,
  History,
  Send,
  Block,
  PriorityHigh,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../services/AuthContext';
import { complaintAPI } from '../services/api';
import { format } from 'date-fns';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching complaint:', id);
      const response = await complaintAPI.getById(id);
      console.log('✅ Complaint fetched:', response.data);
      setComplaint(response.data.data || response.data);
    } catch (error) {
      console.error('❌ Error fetching complaint:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      const errorMsg = error.response?.data?.message || 'Failed to fetch complaint details';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setTimeout(() => navigate('/student/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending': return <Pending sx={{ color: 'warning.main' }} />;
      case 'in-progress': return <TrendingUp sx={{ color: 'info.main' }} />;
      case 'rejected': return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: return <Pending />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await complaintAPI.updateStatus(id, newStatus);
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      setStatusDialogOpen(false);
      fetchComplaint();
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) return;
    
    try {
      await complaintAPI.addResponse(id, responseText);
      enqueueSnackbar('Response added successfully', { variant: 'success' });
      setResponseText('');
      setResponseDialogOpen(false);
      fetchComplaint();
    } catch (error) {
      enqueueSnackbar('Failed to add response', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await complaintAPI.delete(id);
      enqueueSnackbar('Complaint deleted successfully', { variant: 'success' });
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error) {
      enqueueSnackbar('Failed to delete complaint', { variant: 'error' });
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await complaintAPI.submitFeedback(id, feedback);
      enqueueSnackbar('Feedback submitted successfully', { variant: 'success' });
      setFeedbackDialogOpen(false);
      fetchComplaint();
    } catch (error) {
      enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading complaint details...</Typography>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          Complaint not found or you don't have permission to view it.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const isOwner = user.role === 'student' && complaint.student &&complaint.student._id === user.userId;
  const isAdminStaff = user.role === 'admin' || user.role === 'staff';
  const canEdit = isOwner && complaint.status === 'pending';
  const canDelete = isOwner || isAdminStaff;
  const canRespond = isAdminStaff;
  const canUpdateStatus = isAdminStaff;
  const canGiveFeedback = isOwner && complaint.status === 'resolved' && !complaint.feedback;

  const statusSteps = [
    { label: 'Submitted', status: 'pending' },
    { label: 'In Review', status: 'in-progress' },
    { label: 'Resolved', status: 'resolved' },
  ];

  const activeStep = statusSteps.findIndex(step => step.status === complaint.status);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700">
              Complaint Details
            </Typography>
            <Typography color="text.secondary">
              ID: #{complaint._id.slice(-8).toUpperCase()}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit && (
            <Button
              startIcon={<Edit />}
              onClick={() => navigate(`/complaint/edit/${id}`)}
              variant="outlined"
            >
              Edit
            </Button>
          )}
          
          {canDelete && (
            <Button
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          )}
          
          {canUpdateStatus && (
            <Button
              startIcon={<CheckCircle />}
              onClick={() => {
                setNewStatus(complaint.status);
                setStatusDialogOpen(true);
              }}
              variant="contained"
            >
              Update Status
            </Button>
          )}
          
          {canGiveFeedback && (
            <Button
              startIcon={<Message />}
              onClick={() => setFeedbackDialogOpen(true)}
              variant="contained"
              color="success"
            >
              Give Feedback
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Main Complaint */}
        <Grid item xs={12} lg={8}>
          {/* Status Stepper */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {statusSteps.map((step) => (
                <Step key={step.label}>
                  <StepLabel
                    icon={getStatusIcon(step.status)}
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: complaint.status === step.status ? 
                          `${getStatusColor(step.status)}.main` : 'text.secondary',
                        fontWeight: complaint.status === step.status ? 600 : 400,
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Chip
                icon={getStatusIcon(complaint.status)}
                label={complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                color={getStatusColor(complaint.status)}
                size="medium"
              />
              
              {(user.role === 'admin' || user.role === 'staff') && (
                <Chip
                  icon={<PriorityHigh />}
                  label={`Severity: ${complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)}`}
                  color={getPriorityColor(complaint.severity)}
                  size="medium"
                />
              )}

              
              <Chip
                icon={<Category />}
                label={`Category: ${complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}`}
                variant="outlined"
                size="medium"
              />
            </Box>
          </Paper>

          {/* Complaint Content */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="600">
              {complaint.title}
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {complaint.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
               <Typography variant="subtitle2" color="text.secondary">
               <Person sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                Submitted By
                </Typography>

                {complaint.isAnonymous || !complaint.student ? (
                 <Typography variant="body1" fontWeight="500">
                 Anonymous
                </Typography>
                 ) : (
                <>
                 <Typography variant="body1" fontWeight="500">
                  {complaint.student.name}
                </Typography>
               <Typography variant="caption" color="text.secondary">
                {complaint.student.email}
                {complaint.student.studentId && ` • ID: ${complaint.student.studentId}`}
              </Typography>
              </>
        )}
          </Grid>

              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  <School sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                  Department
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {complaint.department.charAt(0).toUpperCase() + complaint.department.slice(1)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  <Schedule sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                  Submitted On
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {format(new Date(complaint.createdAt), 'MMMM dd, yyyy • hh:mm a')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  <History sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {format(new Date(complaint.updatedAt), 'MMMM dd, yyyy • hh:mm a')}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Responses */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Message sx={{ mr: 1 }} />
                Responses ({complaint.responses?.length || 0})
              </Typography>
              
              {canRespond && (
                <Button
                  startIcon={<Send />}
                  onClick={() => setResponseDialogOpen(true)}
                  variant="contained"
                >
                  Add Response
                </Button>
              )}
            </Box>
            
            {complaint.responses && complaint.responses.length > 0 ? (
              complaint.responses.map((response, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {response.responder?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="500">
                            {response.responder?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(response.createdAt), 'MMM dd, yyyy • hh:mm a')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {response.response}
                        </Typography>
                        {response.responder?.role && (
                          <Chip
                            label={response.responder.role.charAt(0).toUpperCase() + response.responder.role.slice(1)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert severity="info">
                No responses yet. {canRespond ? 'Be the first to respond!' : 'Check back later for updates.'}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Side Info */}
        <Grid item xs={12} lg={4}>
          {/* Assigned To */}
          {complaint.assignedTo && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assigned To
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {complaint.assignedTo.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="500">
                    {complaint.assignedTo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.assignedTo.role.charAt(0).toUpperCase() + complaint.assignedTo.role.slice(1)}
                  </Typography>
                  {complaint.assignedTo.department && (
                    <Typography variant="caption" color="text.secondary">
                      {complaint.assignedTo.department}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          )}

          {/* Blockchain Info */}
          {complaint.blockchainHash && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Blockchain Verification
              </Typography>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  ✓ This complaint is secured using blockchain technology and verified.
                </Typography>
              </Alert>
              
              {isAdminStaff && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Transaction Hash:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    bgcolor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                    mt: 0.5,
                  }}>
                    {complaint.blockchainHash}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      // View on blockchain explorer
                    }}
                  >
                    View on Blockchain
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          {/* Feedback */}
          {complaint.feedback && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                Student Feedback
              </Typography>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {[...Array(5)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        color: i < complaint.feedback.rating ? '#ffc107' : '#e0e0e0',
                        fontSize: 24,
                      }}
                    >
                      ★
                    </Box>
                  ))}
                  <Typography variant="body1" sx={{ ml: 1, fontWeight: 500 }}>
                    {complaint.feedback.rating}/5
                  </Typography>
                </Box>
                {complaint.feedback.comment && (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    "{complaint.feedback.comment}"
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Submitted on {format(new Date(complaint.feedback.submittedAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Complaint Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          {newStatus === 'resolved' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Marking as resolved will notify the student and allow them to provide feedback.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Response</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Response"
            type="text"
            fullWidth
            multiline
            rows={6}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Type your response here..."
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This response will be permanently recorded and visible to the student.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddResponse} 
            variant="contained" 
            disabled={!responseText.trim()}
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Are you sure you want to delete this complaint? This action cannot be undone.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Complaint: <strong>{complaint.title}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete Complaint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)}>
        <DialogTitle>Submit Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Please rate your satisfaction with how this complaint was resolved:
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <IconButton
                key={rating}
                onClick={() => setFeedback({ ...feedback, rating })}
                size="large"
              >
                <Box
                  sx={{
                    fontSize: 40,
                    color: rating <= feedback.rating ? '#ffc107' : '#e0e0e0',
                    cursor: 'pointer',
                  }}
                >
                  ★
                </Box>
              </IconButton>
            ))}
          </Box>
          
          <TextField
            fullWidth
            label="Additional Comments (Optional)"
            multiline
            rows={3}
            value={feedback.comment}
            onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
            placeholder="Share your experience or suggestions..."
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Your feedback helps us improve our services. Thank you!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained" color="success">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ComplaintDetails;