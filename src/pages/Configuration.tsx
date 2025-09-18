//------------------------------------------------------------------------------
// <copyright file="Configuration.tsx" Author="Abdelhamid Larachi">
//      Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { useState, useEffect, ChangeEvent } from 'react';

// material
import {
  Stack,
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardHeader,
  Divider,
  CardContent,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  alpha,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Theme
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; 

// components
import Page from '../components/Page';
import Iconify from '../components/Iconify'; 
import { useSnackbar } from 'notistack';
import { SubscriptionAPI, SubscriptionPlan, CreatePlanDto } from '../api/subscription';

export default function Configuration() {
  const { enqueueSnackbar } = useSnackbar();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>({
    name: '',
    description: '',
    price: 0,
    duration: 1,
    isActive: true,
    role: 'PROFESSIONAL'
  });

  useEffect(() => {
    const fetchAllSettings = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching subscription plans...");
        await new Promise(resolve => setTimeout(resolve, 1000)); 

        // Fetch subscription plans
        await fetchSubscriptionPlans();

      } catch (error) {
        console.error("Failed to fetch settings:", error);
        enqueueSnackbar("Failed to load settings", { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSettings();
  }, [enqueueSnackbar]);

  const fetchSubscriptionPlans = async () => {
    try {
      console.log('Fetching subscription plans from API...');
      const plans = await SubscriptionAPI.getPlans();
      console.log('Received plans:', plans);
      setPlans(plans);
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      enqueueSnackbar('Failed to load subscription plans', { variant: 'error' });
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setNewPlan({
      name: '',
      description: '',
      price: 0,
      duration: 1,
      isActive: true,
      role: 'PROFESSIONAL'
    });
    setIsPlanDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setNewPlan({ ...plan });
    setIsPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!newPlan.name || !newPlan.description || newPlan.price <= 0) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const planData: CreatePlanDto = {
        name: newPlan.name,
        description: newPlan.description,
        price: newPlan.price,
        duration: newPlan.duration,
        isActive: newPlan.isActive,
        role: newPlan.role
      };
      
      if (editingPlan) {
        // Update existing plan
        const updatedPlan = await SubscriptionAPI.updatePlan(editingPlan._id!, planData);
        setPlans(prev => prev.map(p => p._id === editingPlan._id ? updatedPlan : p));
        enqueueSnackbar('Plan updated successfully', { variant: 'success' });
      } else {
        // Create new plan
        const createdPlan = await SubscriptionAPI.createPlan(planData);
        setPlans(prev => [...prev, createdPlan]);
        enqueueSnackbar('Plan created successfully', { variant: 'success' });
      }
      
      setIsPlanDialogOpen(false);
    } catch (error) {
      console.error('Failed to save plan:', error);
      enqueueSnackbar('Failed to save plan', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to convert duration from Date to months
  const getDurationInMonths = (duration: Date | number | string): number => {
    if (typeof duration === 'number') {
      return duration;
    }
    
    if (typeof duration === 'string') {
      // If it's a string, try to parse it as a number first
      const numDuration = parseInt(duration, 10);
      if (!isNaN(numDuration)) {
        return numDuration;
      }
      // If not a number, try to parse as date
      const dateDuration = new Date(duration);
      if (!isNaN(dateDuration.getTime())) {
        const now = new Date();
        const diffTime = dateDuration.getTime() - now.getTime();
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        return Math.max(1, diffMonths);
      }
    }
    
    if (duration instanceof Date) {
      const now = new Date();
      const diffTime = duration.getTime() - now.getTime();
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return Math.max(1, diffMonths);
    }
    
    // Fallback to 1 month if we can't determine the duration
    console.warn('Unable to determine duration, defaulting to 1 month:', duration);
    return 1;
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await SubscriptionAPI.deletePlan(planId);
      setPlans(prev => prev.filter(p => p._id !== planId));
      enqueueSnackbar('Plan deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to delete plan:', error);
      enqueueSnackbar('Failed to delete plan', { variant: 'error' });
    }
  };

  const renderSubscriptionPlans = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" component="h2">
          Subscription Plans Management
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={selectedRole}
              label="Filter by Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="PROFESSIONAL">Professional</MenuItem>
              <MenuItem value="RESELLER">Reseller</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleCreatePlan}
          >
            Add New Plan
          </Button>
        </Stack>
      </Stack>

      {/* Plan Statistics */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Plan Statistics
        </Typography>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Plans</Typography>
            <Typography variant="h6">{plans.length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Professional Plans</Typography>
            <Typography variant="h6">{plans.filter(p => p.role === 'PROFESSIONAL').length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Reseller Plans</Typography>
            <Typography variant="h6">{plans.filter(p => p.role === 'RESELLER').length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Active Plans</Typography>
            <Typography variant="h6">{plans.filter(p => p.isActive).length}</Typography>
          </Box>
        </Stack>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: (theme: Theme) => theme.shadows[3] }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Price (DZD)</TableCell>
              <TableCell align="center">Duration (Months)</TableCell>
              <TableCell align="center">Role</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans
              .filter(plan => selectedRole === 'ALL' || plan.role === selectedRole)
              .map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {plan.name || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {plan.description || 'No description'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {plan.price ? plan.price.toLocaleString() : '0'} DZD
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={`${getDurationInMonths(plan.duration)} month${getDurationInMonths(plan.duration) > 1 ? 's' : ''}`} 
                    color="primary" 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={plan.role} 
                    color={plan.role === 'PROFESSIONAL' ? 'primary' : 'secondary'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={plan.isActive ? 'Active' : 'Inactive'} 
                    color={plan.isActive ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Iconify icon="eva:edit-fill" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeletePlan(plan._id!)}
                    >
                      <Iconify icon="eva:trash-2-fill" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {plans.filter(plan => selectedRole === 'ALL' || plan.role === selectedRole).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {selectedRole === 'ALL' 
              ? 'No subscription plans found. Create your first plan to get started.'
              : `No subscription plans found for ${selectedRole} role. Create a new plan for this role.`
            }
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Page title="Configuration">
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={4}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Subscription Plans Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage subscription plans for users
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mt={{ xs: 2, sm: 0 }}>
            <TextField
              select
              size="small"
              value="DZD"
              SelectProps={{ native: true }}
              sx={{ width: '90px' }}
              variant="outlined"
            >
              <option value="DZD">DZD</option>
            </TextField>
          </Stack>
        </Stack>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 5, py: 5 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Loading Subscription Plans...</Typography>
          </Box>
        )}

        {!isLoading && renderSubscriptionPlans()}

        {/* Plan Dialog */}
        <Dialog 
          open={isPlanDialogOpen} 
          onClose={() => setIsPlanDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Plan Name"
                value={newPlan.name}
                onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., 6mois, 1an"
                helperText="Unique identifier for the plan"
              />
              
              <TextField
                fullWidth
                label="Description"
                value={newPlan.description}
                onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                placeholder="Describe the benefits and features of this plan"
              />
              
              <TextField
                fullWidth
                label="Price (DZD)"
                type="number"
                value={newPlan.price}
                onChange={(e) => setNewPlan(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">DZD</InputAdornment>,
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={newPlan.duration}
                  label="Duration"
                  onChange={(e) => setNewPlan(prev => ({ ...prev, duration: e.target.value as number }))}
                >
                  <MenuItem value={1}>1 Month</MenuItem>
                  <MenuItem value={3}>3 Months</MenuItem>
                  <MenuItem value={6}>6 Months</MenuItem>
                  <MenuItem value={12}>12 Months</MenuItem>
                  <MenuItem value={24}>24 Months</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newPlan.role}
                  label="Role"
                  onChange={(e) => setNewPlan(prev => ({ ...prev, role: e.target.value }))}
                >
                  <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                  <MenuItem value="RESELLER">Reseller</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> Plan names should match exactly what users will select (e.g., "6mois", "1an"). 
                  This ensures proper plan lookup during subscription creation.
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePlan} 
              variant="contained"
              disabled={isSaving || !newPlan.name || !newPlan.description || newPlan.price <= 0}
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:save-fill" />}
            >
              {isSaving ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}


