import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography
} from '@mui/material';


export function Device({ device }) {

  return <Card sx={{
    mt: 2,
    py: 4
  }} /*{...props}*/>
    <CardContent>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          color="textPrimary"
          gutterBottom
          variant="h5"
        >
          {device.manufacturer.toUpperCase()}
        </Typography>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          Model: {`${device.modelName}`}
        </Typography>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          Version: {`${device.osVersion}`}
        </Typography>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          Simulateur: {device.isDevice ? 'Non' : 'Oui'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
};
