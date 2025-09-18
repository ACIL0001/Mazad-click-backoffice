// @mui
import { LinearProgress, Box } from '@mui/material';
// @redux
import { useSelector } from 'react-redux'
import { RootState } from '@/app/store';


export default function LinearLoader() {
    const isLoading = useSelector((state: RootState) => state.loader)

    if (isLoading) {
        return (
            <Box sx={{ width: '100%', position: "fixed", top: 0 }}>
                <LinearProgress sx={{ height: 5 }} color='primary' />
            </Box>)
    } else return null;
}