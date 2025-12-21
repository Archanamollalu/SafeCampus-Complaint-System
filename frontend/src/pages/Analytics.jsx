import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Timeline,
  BarChart,
  PieChart,
  Download,
  FilterList,
  DateRange,
} from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { complaintAPI, adminAPI } from '../services/api';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Generate mock data for demonstration
      const generateData = () => {
        const data = [];
        let startDate = new Date();
        
        // Adjust based on time range
        let days = 30;
        if (timeRange === 'week') days = 7;
        if (timeRange === 'quarter') days = 90;
        if (timeRange === 'year') days = 365;
        
        for (let i = days; i >= 0; i--) {
          const date = new Date(startDate);
          date.setDate(date.getDate() - i);
          
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            complaints: Math.floor(Math.random() * 30) + 10,
            resolved: Math.floor(Math.random() * 25) + 5,
            pending: Math.floor(Math.random() * 15) + 5,
          });
        }
        
        return data;
      };

      // Fetch stats from API (if available)
      let apiStats = {};
      try {
        if (user.role === 'admin') {
          const res = await adminAPI.getAdminStats();
          apiStats = res.data;
        } else {
          const res = await complaintAPI.getStats();
          apiStats = res.data;
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use mock data if API fails
        apiStats = {
          totals: {
            complaints: 156,
            resolved: 89,
            pending: 45,
            inProgress: 22,
          },
          byCategory: {
            academic: 45,
            administrative: 32,
            infrastructure: 28,
            faculty: 21,
            financial: 15,
            hostel: 12,
            other: 3,
          },
        };
      }

      setChartData(generateData());
      setStats(apiStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = stats?.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  })) : [];

  const statusData = stats?.totals ? [
    { name: 'Resolved', value: stats.totals.resolved || 0, color: '#4CAF50' },
    { name: 'Pending', value: stats.totals.pending || 0, color: '#FF9800' },
    { name: 'In Progress', value: stats.totals.inProgress || 0, color: '#2196F3' },
    { name: 'Rejected', value: (stats.totals.complaints || 0) - 
      ((stats.totals.resolved || 0) + (stats.totals.pending || 0) + (stats.totals.inProgress || 0)), 
      color: '#F44336' },
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const exportData = () => {
    const dataStr = JSON.stringify(chartData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
            <Timeline sx={{ mr: 2, verticalAlign: 'middle' }} />
            Analytics Dashboard
          </Typography>
          <Typography color="text.secondary">
            Comprehensive insights and performance metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>
              <DateRange sx={{ mr: 1, fontSize: 18 }} />
              Time Range
            </InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last 365 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportData}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="700" color="primary.main">
                    {stats?.totals?.complaints || 0}
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    Total Complaints
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="700" color="success.main">
                    {stats?.totals?.resolved || 0}
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    Resolved
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.totals?.complaints ? 
                      `${((stats.totals.resolved / stats.totals.complaints) * 100).toFixed(1)}% resolution rate` 
                      : '0% resolution rate'}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="700" color="warning.main">
                    {stats?.totals?.pending || 0}
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    Pending
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="700" color="info.main">
                    {stats?.totals?.inProgress || 0}
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    In Progress
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Area Chart - Complaints Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Timeline sx={{ mr: 1 }} />
              Complaints Trend Over Time
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="complaints" stackId="1" stroke="#8884d8" fill="#8884d8" name="New Complaints" />
                  <Area type="monotone" dataKey="resolved" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Resolved" />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#ffc658" fill="#ffc658" name="Pending" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Pie Chart - By Category */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PieChart sx={{ mr: 1 }} />
              Complaints by Category
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Bar Chart - Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChart sx={{ mr: 1 }} />
              Status Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Number of Complaints">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              {statusData.map((status) => (
                <Chip
                  key={status.name}
                  label={`${status.name}: ${status.value}`}
                  sx={{
                    bgcolor: `${status.color}20`,
                    color: status.color,
                    borderColor: status.color,
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Line Chart - Daily Average */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1 }} />
              Daily Averages
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.slice(-7)} // Last 7 days
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="#8884d8"
                    name="Daily Complaints"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#82ca9d"
                    name="Daily Resolved"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Insight:</strong> Shows daily complaint and resolution trends over the last 7 days.
                Helps identify patterns and peak complaint periods.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Statistics Summary */}
      {user.role === 'admin' && stats?.resolutionStats && (
        <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Average Resolution Time
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.resolutionStats?.avgResolutionTime 
                    ? `${stats.resolutionStats.avgResolutionTime.toFixed(1)} hours`
                    : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Time taken to resolve complaints on average
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Fastest Resolution
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.resolutionStats?.minResolutionTime 
                    ? `${stats.resolutionStats.minResolutionTime.toFixed(1)} hours`
                    : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quickest complaint resolution recorded
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Longest Resolution
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.resolutionStats?.maxResolutionTime 
                    ? `${stats.resolutionStats.maxResolutionTime.toFixed(1)} hours`
                    : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Longest time taken to resolve a complaint
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default Analytics;