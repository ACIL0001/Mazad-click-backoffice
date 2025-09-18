import * as PropTypes from 'prop-types'

import { Helmet } from 'react-helmet-async';
import { forwardRef } from 'react';

// @mui
import { Box } from '@mui/material';
import app from '../config';
// ----------------------------------------------------------------------

const Page = forwardRef(({ children, title = '', meta, ...other }: any, ref) => (
  <>
    <Helmet>
      <title>{`${app.name} | ${title}`}</title>
      {meta}
    </Helmet>

    <Box ref={ref} {...other}>
      {children}
    </Box>
  </>
));

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  meta: PropTypes.node,
};

export default Page;
