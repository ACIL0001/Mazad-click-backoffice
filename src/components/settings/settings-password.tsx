import { Button, Card, CardContent, CardHeader, Divider } from '@mui/material';
import { useSnackbar } from 'notistack';
import { generateUserQrPdf } from '../../services/pdf';
import type { UserInfo } from '../../services/pdf';


export const SettingsPassword = ({ user }: { user: UserInfo }) => {
  const { enqueueSnackbar } = useSnackbar();


  const generateQrCode = async () => {
    try {
      await generateUserQrPdf(user);
      enqueueSnackbar('PDF généré avec succès.', { variant: 'success' });
    } catch (e) {
      console.error('PDF generation error:', e);
      enqueueSnackbar('Une erreur est survenue.', { variant: 'error' });
    }
  }



  const updateState = async () => {
    var proceed = confirm("Êtes-vous sur de vouloir continuer?");

    if (proceed) {
     
      
    }
  }


  return (
    <form /*{...props}*/>
      <Card>
        <CardHeader
          subheader="Mettre a jour"
          title="Mot de passe"
        />
        <Divider />
        <CardContent>
          <Button onClick={updateState} style={{ textTransform: 'none' }}> Générer un nouveau mot de passe?</Button>
          <Button onClick={generateQrCode} style={{ textTransform: 'none', marginLeft: 8 }}> Générer QR Code PDF</Button>
        </CardContent>
        {/*
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2
          }}
        >
          <Button
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        </Box>
        */}
      </Card>
    </form >
  );
};
