import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Refresh,
  MoreVert,
  CheckCircle,
  Pending,
  Error,
  TrendingUp,
  Description,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../services/AuthContext';
import { complaintAPI } from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Fetch data on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

  // Also refresh when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchComplaints();
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getMyComplaints();
      console.log('📋 Full API Response:', response.data);
      
      // API returns: { success: true, data: [...], pagination: {...} }
      const complaintsData = response.data?.data || [];
      console.log('✅ Setting', complaintsData.length, 'complaints');
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('❌ Failed to fetch complaints:', error);
      enqueueSnackbar('Failed to fetch complaints', { variant: 'error' });
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await complaintAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusKey = typeof status === 'string' ? status : 'unknown';
    const statusConfig = {
      pending: { color: 'warning', icon: <Pending fontSize="small" />, label: 'Pending' },
      'in-progress': { color: 'info', icon: <TrendingUp fontSize="small" />, label: 'In Progress' },
      resolved: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Resolved' },
      rejected: { color: 'error', icon: <Error fontSize="small" />, label: 'Rejected' },
      unknown: { color: 'default', icon: null, label: 'Unknown' },
    };

    const config = statusConfig[statusKey] || statusConfig.unknown;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500">
          #{params.value}
        </Typography>
      )
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="500">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.category}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => getStatusChip(params.value)
    },
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      width: 120,
      renderCell: (params) => {
        const val = params.value;
        if (!val) return <Typography variant="caption">-</Typography>;
        const d = new Date(val);
        if (isNaN(d.getTime())) return <Typography variant="caption">-</Typography>;
        return (
          <Typography variant="caption">
            {format(d, 'dd/MM/yy')}
          </Typography>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            // Store complaint ID
            e.currentTarget.dataset.id = params.row._id;
          }}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  const handleMenuClick = (action, id) => {
    setAnchorEl(null);
    if (action === 'view') {
      navigate(`/complaint/${id}`);
    } else if (action === 'edit') {
      // Handle edit
    } else if (action === 'delete') {
      // Handle delete
    }
  };

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      color: 'primary',
      icon: <Description sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Pending',
      value: stats.pending,
      color: 'warning',
      icon: <Pending sx={{ fontSize: 40 }} />,
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      color: 'info',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      color: 'success',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            My Dashboard
          </Typography>
          <Typography color="text.secondary">
            Track and manage all your complaints
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/complaint/new')}
            sx={{ mr: 2 }}
          >
            New Complaint
          </Button>
          <IconButton onClick={fetchComplaints}>
            <Refresh />
          </IconButton>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={() => { logout(); navigate('/login'); }}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="700" color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ 
                  color: `${stat.color}.main`,
                  opacity: 0.8,
                }}>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Complaints */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="600">
            Recent Complaints
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Array.isArray(complaints) ? complaints.length : 0} complaints found
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={(Array.isArray(complaints) ? complaints : []).map((comp) => ({
                id: comp._id || comp.id, // Use MongoDB _id as the unique row id
                ...comp,
              }))}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                },
              }}
            />
          </div>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleMenuClick('view', anchorEl?.dataset?.id)}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('edit', anchorEl?.dataset?.id)}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('delete', anchorEl?.dataset?.id)} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default StudentDashboard;