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


export function RideCreator({ ride }: any) {
  const navigate = useNavigate();

  const onUserClick = (user: any) => {
    navigate('/dashboard/account', {
      state: user,
    });
  }

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
            variant="h5"
          >
            Créateur
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip
              onClick={() => onUserClick(ride.createdBy)}
              avatar={<Avatar alt={ride.createdBy.name} src={app.route + ride.createdBy.picture.filename} />}
              label={ride.createdBy.name}
              variant="outlined"
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
};
