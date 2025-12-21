import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People,
  Description,
  TrendingUp,
  CheckCircle,
  Pending,
  Error,
  Refresh,
  Apartment,
  FilterList,
  Edit,
  Delete,
  Visibility,
  Logout,
  BarChart,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../services/AuthContext';
import { adminAPI, complaintAPI } from '../services/api';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totals: {
      users: 0,
      complaints: 0,
      activeComplaints: 0,
      resolvedComplaints: 0,
    },
    byDepartment: [],
    topCategories: [],
    resolutionStats: null,
    recentComplaints: [],
  });
  
  const [users, setUsers] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [chartData, setChartData] = useState([]);
  
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Define all async functions before useEffect
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats
      const statsRes = await adminAPI.getAdminStats();
      console.log('📊 Admin stats response:', statsRes);
      setStats(statsRes.data?.data || statsRes.data || {
        totals: { users: 0, complaints: 0, activeComplaints: 0, resolvedComplaints: 0 },
        byDepartment: [],
        topCategories: [],
        resolutionStats: null,
        recentComplaints: [],
      });
      
      // Fetch all users
      const usersRes = await adminAPI.getAllUsers();
      console.log('👥 Users response:', usersRes);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || []);
      
      // Fetch all complaints
      const complaintsRes = await complaintAPI.getAll();
      console.log('📋 Complaints response:', complaintsRes);
      setAllComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : complaintsRes.data?.data || []);
      
    } catch (error) {
      enqueueSnackbar('Failed to fetch data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    // Generate sample chart data for demonstration
    const data = [];
    for (let i = 1; i <= 12; i++) {
      data.push({
        month: `Month ${i}`,
        complaints: Math.floor(Math.random() * 100) + 20,
        resolved: Math.floor(Math.random() * 80) + 10,
      });
    }
    setChartData(data);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await complaintAPI.updateStatus(complaintId, newStatus);
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      fetchAllData();
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim() || !selectedComplaint) return;
    
    try {
      await complaintAPI.addResponse(selectedComplaint._id, responseText);
      enqueueSnackbar('Response added successfully', { variant: 'success' });
      setResponseDialogOpen(false);
      setResponseText('');
      fetchAllData();
    } catch (error) {
      enqueueSnackbar('Failed to add response', { variant: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminAPI.deleteUser(userId);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      fetchAllData();
    } catch (error) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAllData();
    fetchChartData();
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      'in-progress': { color: 'info', label: 'In Progress' },
      resolved: { color: 'success', label: 'Resolved' },
      rejected: { color: 'error', label: 'Rejected' },
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: 'success', label: 'Low' },
      medium: { color: 'warning', label: 'Medium' },
      high: { color: 'error', label: 'High' },
      urgent: { color: 'error', label: 'Urgent' },
    };
    
    const config = priorityConfig[priority] || { color: 'default', label: priority };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const getSeverityChip = (severity) => {
    const severityConfig = {
      low: { color: 'success', label: 'Low' },
      medium: { color: 'warning', label: 'Medium' },
      high: { color: 'error', label: 'High' }
    };

    const config = severityConfig[severity] || { color: 'default', label: severity };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
};


  const getRoleChip = (role) => {
    const roleConfig = {
      admin: { color: 'error', label: 'Admin' },
      staff: { color: 'info', label: 'Staff' },
      student: { color: 'success', label: 'Student' },
    };
    
    const config = roleConfig[role] || { color: 'default', label: role };
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  // Filter complaints based on status
  const filteredComplaints = filterStatus === 'all' 
    ? allComplaints 
    : allComplaints.filter(complaint => complaint.status === filterStatus);

  // Show loading spinner while initial data is being fetched
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Stats cards data
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totals?.users || 0,
      color: 'primary',
      icon: <People sx={{ fontSize: 40 }} />,
      description: 'Registered users',
    },
    {
      title: 'Total Complaints',
      value: stats?.totals?.complaints || 0,
      color: 'secondary',
      icon: <Description sx={{ fontSize: 40 }} />,
      description: 'All complaints',
    },
    {
      title: 'Active Complaints',
      value: stats?.totals?.activeComplaints || 0,
      color: 'warning',
      icon: <Pending sx={{ fontSize: 40 }} />,
      description: 'Pending + In Progress',
    },
    {
      title: 'Resolved',
      value: stats?.totals?.resolvedComplaints || 0,
      color: 'success',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      description: 'Successfully resolved',
    },
  ];

  // Pie chart data for categories
  const categoryData = (stats?.topCategories || []).map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Manage users, complaints, and view system analytics
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BarChart />}
            onClick={() => navigate('/analytics')}
          >
            Analytics
          </Button>
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
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="700" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    color: `${stat.color}.main`,
                    opacity: 0.8,
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Description />} label="Complaints" />
          <Tab icon={<People />} label="Users" />
          <Tab icon={<BarChart />} label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {/* Filters */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterList color="action" />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                {filteredComplaints.length} complaints found
              </Typography>
            </Box>
          </Box>

          {/* Complaints Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Severity</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((complaint) => (
                    <TableRow key={complaint._id} hover>
                      <TableCell>
                        <Typography variant="caption" fontWeight="500">
                          #{complaint._id.slice(-6)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {complaint.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {complaint.isAnonymous ? 'Anonymous' : complaint.student?.name}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {complaint.isAnonymous ? '—' : complaint.student?.email}
                        </Typography> 
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={complaint.categoryDisplay || complaint.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {getSeverityChip(complaint.severity)}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(complaint.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/complaint/${complaint._id}`)}
                            color="primary"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setResponseDialogOpen(true);
                            }}
                            color="info"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={complaint.status}
                              onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                              sx={{ height: 32 }}
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="in-progress">In Progress</MenuItem>
                              <MenuItem value="resolved">Resolved</MenuItem>
                              <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredComplaints.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <People sx={{ mr: 1 }} />
            User Management ({users.length} users)
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Joined</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {user.name}
                          </Typography>
                          {user.studentId && (
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.studentId}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      {getRoleChip(user.role)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Implement edit user
                          }}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user._id)}
                          color="error"
                          disabled={user.role === 'admin'}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Line Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Complaints Trend (Last 12 Months)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="complaints" stroke="#8884d8" name="New Complaints" />
                    <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Complaints by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Department Stats */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <Apartment sx={{ mr: 1 }} />
                Complaints by Department
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={stats.byDepartment}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Complaints" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onClose={() => setResponseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Response to Complaint
          {selectedComplaint && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedComplaint.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Response"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Enter your response to the complaint..."
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This response will be visible to the student and recorded permanently.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddResponse} variant="contained" disabled={!responseText.trim()}>
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;