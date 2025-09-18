import { styled } from '@mui/material/styles';
import { Box, IconButton, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Iconify from '@/components/Iconify';
import { fData } from '@/utils/formatNumber';

// ----------------------------------------------------------------------

const ListItemStyle = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  border: `solid 1px ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
}));

// ----------------------------------------------------------------------

interface MultiFilePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function MultiFilePreview({ file, onRemove }: MultiFilePreviewProps) {
  const { name, size, type } = file;
  const isImage = type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ListItemStyle>
        {isImage ? (
          <Box
            component="img"
            alt={name}
            src={URL.createObjectURL(file)}
            sx={{
              width: 48,
              height: 48,
              objectFit: 'cover',
              borderRadius: 1,
              mr: 2,
            }}
          />
        ) : (
          <Box sx={{ width: 48, height: 48, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Iconify icon="eva:file-fill" width={36} height={36} />
          </Box>
        )}

        <ListItemText
          primary={name}
          secondary={
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
              {fData(size)}
            </Typography>
          }
        />

        <IconButton edge="end" size="small" onClick={onRemove}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </ListItemStyle>
    </motion.div>
  );
}
