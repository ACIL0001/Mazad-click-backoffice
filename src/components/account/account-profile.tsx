import { Avatar, Box, Button, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import app from '@/config';

export function AccountProfile({ user }: any) {
  const picture = user.picture;

  return (
    <Card sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ py: 1.5, width: '100%', borderBottom: 1, borderColor: 'divider' }}>
        <Typography fontWeight="bold" sx={{ textAlign: 'left', px: 2 }}>
          Détails du profile
        </Typography>
      </Box>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            // flexDirection: 'row',
          }}
        >
          {/* <Avatar
                        src={picture ? app.route + picture.filename : '/static/mock-images/avatars/avatar_1.png'}
                        sx={{
                            height: 64,
                            mb: 2,
                            width: 64
                        }}
                    /> */}
          <Box
            style={{ borderRadius: '100%' }}
            component="img"
            src={picture ? app.route + picture.filename : '/static/mock-images/avatars/avatar_default.jpg'}
            sx={{
              height: 150,
              mb: 2,
              aspectRatio: 1,
              //   width: 64,
            }}
          />
          <Box>
            <Typography color="textPrimary" gutterBottom variant="h5">
              {user.name}
            </Typography>
            <Typography color="textSecondary" variant="h6" gutterBottom>
              0{user.tel}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Rejoint le: {new Date(user.createdAt).toDateString()}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Modifié le: {new Date(user.updatedAt).toDateString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
