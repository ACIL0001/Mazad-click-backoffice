import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import app from '@/config';


export function RidePassengers({ ride }: any) {
  const navigate = useNavigate();

  const onUserClick = (user: any) => {
    navigate('/dashboard/account', {
      state: user,
    });
  }

  return (
    <Card sx={{ mb: 3 }}>
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
            variant="h5"
          >
            Passagers ({ride.passengers.length} / {ride.seats})
          </Typography>
          {ride.passengers.map(u => (
            <Stack direction="row" spacing={2}>
              <Chip
                onClick={() => onUserClick(u)}
                avatar={<Avatar alt={u.name} src={app.route + u.picture.filename} />}
                label={u.name}
                variant="outlined"
              />
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
};
