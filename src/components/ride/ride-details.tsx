import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Typography
} from '@mui/material';
import { sentenceCase } from 'change-case';
import Label from '../Label';


export function RideDetails({ ride }: any) {

  console.log(ride)
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            //alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            color="textPrimary"
            gutterBottom
            sx={{ mb: 3 }}
            variant="h5"
          >
            Details
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Départ:</strong> {ride.start_address}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Déstination:</strong> {ride.end_address}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Distance:</strong> {ride.distance.text}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Durée:</strong> {ride.duration.text}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Date:</strong>  {new Date(ride.datetime).toDateString()}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Prix:</strong> {ride.price} DA
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Status:</strong>
            <Label variant="ghost" color="info">
              {sentenceCase(ride.status)}
            </Label>
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Matricule:</strong> {ride.plateNumber}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body2"
            gutterBottom
          >
            <strong>Crée Le:</strong> {new Date(ride.createdAt).toDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
};
