// @mui
import * as PropTypes from 'prop-types'
import { Box, Card, Paper, Typography, CardHeader, CardContent, Divider } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

AppTrafficBySite.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
  note: PropTypes.string,
  col: PropTypes.number
};

export default function AppTrafficBySite({ Header = null, note = "", col = 2, title, subheader = "", list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        {Header && <Header />}
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: `repeat(${col}, 1fr)`,
          }}
        >
          {list.map((site) => (
            <Paper key={site.name} variant="outlined" sx={{ py: 2.5, textAlign: 'center' }}>
              <Box sx={{ mb: 0.5 }}>{site.icon}</Box>

              <Typography variant="h6">{fShortenNumber(site.value)}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {site.name}
              </Typography>
            </Paper>
          ))}
        </Box>
        {note != "" &&
          <>
            <Divider sx={{ m: 5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {note}
            </Typography>
          </>
        }
      </CardContent>
    </Card>
  );
}
