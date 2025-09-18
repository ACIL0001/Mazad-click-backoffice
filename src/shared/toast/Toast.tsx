import { Alert } from "@mui/material";
import Iconify from '../../components/Iconify';

export default function Toast({ text, icon, color }) {
  return (
    <Alert icon={<Iconify icon={icon} />} severity={color}>
      {text}
    </Alert>
  );
}
