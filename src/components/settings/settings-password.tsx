import { Box, Button, Card, CardContent, CardHeader, Divider, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { jsPDF } from "jspdf";
const QRCode = require('qrcode')




export const SettingsPassword = ({ user }) => {
  const { enqueueSnackbar } = useSnackbar();


  const generateQrCode = async (text) => {
    try {
      const qrcode = await QRCode.toDataURL(text)
      var logo = new Image()
      logo.src = '/static/logo.png'

      var doc = new jsPDF();
      doc.addImage(logo, 'png', doc.internal.pageSize.getWidth() / 2.6, 10, 50, 60)
      doc.text(`${user.name} | ${user.network.name}`, doc.internal.pageSize.getWidth() / 2, 90, { align: "center" })
      doc.text(new Date().toDateString(), doc.internal.pageSize.getWidth() / 2, 100, { align: "center" })
      doc.addImage(qrcode, 'png', doc.internal.pageSize.getWidth() / 3.25, 110, 80, 80)
      doc.text('Merci de ne pas partager ce document.', doc.internal.pageSize.getWidth() / 2, 210, { align: "center" })
      doc.save(`${user.name}_info.pdf`);
    } catch (e) {
      enqueueSnackbar('Une erreur est survenue.', { variant: 'error' })
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
