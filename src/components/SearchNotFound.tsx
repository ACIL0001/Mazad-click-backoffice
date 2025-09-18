import * as PropTypes from 'prop-types'

// material
import { Paper, Typography } from '@mui/material';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  searchQuery: PropTypes.string,
};

export default function SearchNotFound({ searchQuery = '', ...other }) {
  return (
    <Paper {...other}>
      <Typography gutterBottom align="center" variant="subtitle1">
        Pas de données
      </Typography>
      <Typography variant="body2" align="center">
        Aucune donnée trouvé. Essayez de vérifier les fautes de frappe ou d'utiliser des mots complets.
      </Typography>
    </Paper>
  );
}
