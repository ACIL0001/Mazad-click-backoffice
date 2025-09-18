import { Box, BoxProps, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

export default function CardLabelValue({ label, value, sx, ...props }: { label: string; value: string; sx?: SxProps<Theme> } & BoxProps) {
  return (
    <Box
      {...props}
      sx={{
        p: 2,
        boxShadow: 3,
        // borderRadius: 1,
        textAlign: 'center',
        borderLeft: '5px solid green',
        backgroundColor: 'white',
        justifyContent: 'center',
        flexGrow: 1,
        // maxHeight: 'max-content',
        ...sx,
      }}
    >
      <Typography variant="h5" align="left">
        {label}
      </Typography>

      <Typography variant="inherit" align="right" sx={{ opacity: 0.72 }}>
        {value}
      </Typography>
    </Box>
  );
}
