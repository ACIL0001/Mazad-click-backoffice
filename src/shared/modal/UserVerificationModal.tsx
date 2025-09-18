import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle } from '@mui/material';
import app from '@/config';

interface UserVerificationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  identity: any; 
  accept: (identity: any) => void;
  decline: (identity: any) => void;
}

export default function UserVerificationModal({ open, setOpen, identity, accept, decline }: UserVerificationModalProps) {
  const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');

  // Fix: Change ref type to HTMLDivElement to match component prop
  const descriptionElementRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const onAccept = () => accept(identity);
  const onDecline = () => decline(identity);

  // If there's no identity data, don't render the modal
  if (!identity) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll={scroll}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">Vérification d'identité</DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText
          ref={descriptionElementRef}
          id="scroll-dialog-description"
          tabIndex={-1}
          component="div"
        >
          <Typography variant="overline" display="block" gutterBottom>
            Document
          </Typography>
          <img
            src={app.route + identity?.document?.filename}
            alt="document"
            style={{ width: '100%' }}
          />

          <Typography variant="overline" display="block" gutterBottom mt={2}>
            Vehicle
          </Typography>
          <img
            src={app.route + identity?.vehicle?.filename}
            alt="vehicle"
            style={{ width: '100%' }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color='error' onClick={onDecline}>Décliner</Button>
        <Button variant='outlined' onClick={onAccept}>Vérifier</Button>
      </DialogActions>
    </Dialog>
  );
}