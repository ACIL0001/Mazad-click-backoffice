import { useDropzone, Accept } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { Box, List, Stack, Button, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Iconify from '@/components/Iconify';
import MultiFilePreview from './MultiFilePreview';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.grey[400]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

interface UploadMultiFileProps {
  error?: boolean;
  files: File[];
  showPreview?: boolean;
  onRemove: (file: File) => void;
  onRemoveAll: () => void;
  onUpload?: () => void;
  onDrop: (acceptedFiles: File[]) => void;
  helperText?: React.ReactNode;
  maxSize?: number;
  accept?: string | Accept;
}

export function UploadMultiFile({
  error,
  showPreview = false,
  files,
  onRemove,
  onRemoveAll,
  onUpload,
  onDrop,
  helperText,
  maxSize,
  accept,
  ...other
}: UploadMultiFileProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize,
    accept: accept as Accept,
    ...other,
  });

  return (
    <Box sx={{ width: '100%' }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
        }}
      >
        <input {...getInputProps()} />

        <Stack
          direction="column"
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          <Iconify icon="eva:cloud-upload-fill" width={80} height={80} />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography gutterBottom variant="h5">
              Déposez ou Sélectionnez des fichiers
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Déposez les fichiers ici ou cliquez pour parcourir
              <br /> Formats supportés: JPEG, PNG, GIF
            </Typography>
          </Box>
        </Stack>
      </DropZoneStyle>

      {helperText && helperText}

      <List disablePadding sx={{ ...(showPreview && { my: 3 }) }}>
        <AnimatePresence>
          {files.map((file) => (
            <MultiFilePreview key={file.name} file={file} onRemove={() => onRemove(file)} />
          ))}
        </AnimatePresence>
      </List>

      {files.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button color="inherit" size="small" onClick={onRemoveAll}>
            Tout Supprimer
          </Button>
          {onUpload && (
            <Button size="small" variant="contained" onClick={onUpload}>
              Télécharger les fichiers
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
