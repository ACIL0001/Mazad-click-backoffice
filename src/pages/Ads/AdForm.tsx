import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Iconify from '../../components/Iconify';
import { AdsAPI, Ad } from '@/api/ads';
import app from '@/config';

interface AdFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ad?: Ad | null;
}

const AdForm: React.FC<AdFormProps> = ({ open, onClose, onSuccess, ad }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    isDisplayed: false,
    order: 0,
    duration: 0, // Duration value
    durationUnit: 'days' as 'hours' | 'days', // Duration unit
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        url: ad.url || '',
        isDisplayed: ad.isDisplayed ?? false,
        order: ad.order ?? 0,
        duration: (ad as any).duration ?? 0,
        durationUnit: (ad as any).durationUnit || 'days',
      });
      
      // Set image preview if ad has image
      if (ad.image) {
        const imageUrl = typeof ad.image === 'string' 
          ? ad.image 
          : ad.image.url || '';
        if (imageUrl) {
          const fullUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${app.baseURL}${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
          setImagePreview(fullUrl);
        }
      }
    } else {
      // Reset form for new ad
      setFormData({
        title: '',
        url: '',
        isDisplayed: false,
        order: 0,
        duration: 0,
        durationUnit: 'days',
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [ad, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select a valid image file', { variant: 'error' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Image size must be less than 5MB', { variant: 'error' });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'error' });
      return;
    }

    if (!formData.url.trim()) {
      enqueueSnackbar('URL is required', { variant: 'error' });
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url.startsWith('/') ? `http://localhost${formData.url}` : formData.url);
    } catch {
      // If it's a relative URL (starts with /), it's valid
      if (!formData.url.startsWith('/')) {
        enqueueSnackbar('Please enter a valid URL', { variant: 'error' });
        return;
      }
    }

    if (!ad && !imageFile) {
      enqueueSnackbar('Image is required for new ads', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('isDisplayed', formData.isDisplayed.toString());
      formDataToSend.append('order', formData.order.toString());
      if (formData.duration > 0) {
        formDataToSend.append('duration', formData.duration.toString());
        formDataToSend.append('durationUnit', formData.durationUnit);
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (ad) {
        await AdsAPI.updateAd(ad._id, formDataToSend);
        enqueueSnackbar('Ad updated successfully', { variant: 'success' });
      } else {
        await AdsAPI.createAd(formDataToSend);
        enqueueSnackbar('Ad created successfully', { variant: 'success' });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving ad:', error);
      let errorMessage = 'Failed to save ad';
      
      if (error?.response?.status === 404) {
        errorMessage = 'Ads endpoint not found. Please ensure the backend /ads endpoint is implemented.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {ad ? 'Edit Ad' : 'Create New Ad'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <TextField
            fullWidth
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="/category or https://example.com"
            required
            helperText="Enter a relative URL (e.g., /category) or absolute URL (e.g., https://example.com)"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Image {!ad && '*'}
            </Typography>
            {imagePreview ? (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <Iconify icon="mdi:close" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                component="label"
                startIcon={<Iconify icon="mdi:upload" />}
                sx={{ mb: 1 }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            )}
            <Typography variant="caption" color="text.secondary" display="block">
              Max size: 5MB. Supported formats: JPG, PNG, WebP
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleInputChange}
            helperText="Lower numbers appear first"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
              helperText="Ad will expire after this duration. 0 means no expiration"
              inputProps={{ min: 0 }}
            />
            <TextField
              select
              label="Unit"
              name="durationUnit"
              value={formData.durationUnit}
              onChange={handleInputChange}
              sx={{ minWidth: 120 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </TextField>
          </Box>

          {formData.duration > 0 && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Expiration Date:</strong>{' '}
                {(() => {
                  const now = Date.now();
                  const multiplier = formData.durationUnit === 'hours' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
                  const expirationDate = new Date(now + formData.duration * multiplier);
                  return expirationDate.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                })()}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                ({formData.duration} {formData.durationUnit} from now)
              </Typography>
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.isDisplayed}
                onChange={(e) => setFormData(prev => ({ ...prev, isDisplayed: e.target.checked }))}
                name="isDisplayed"
              />
            }
            label="Display on Homepage"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="mdi:check" />}
        >
          {ad ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdForm;

