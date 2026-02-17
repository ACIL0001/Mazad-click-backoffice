// @mui
import { LinearProgress, Box } from '@mui/material';
// @zustand
import { useLoaderStore } from '@/app/stores/loaderStore';


export default function LinearLoader() {
    const isLoading = useLoaderStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <Box sx={{ width: '100%', position: "fixed", top: 0 }}>
                <LinearProgress sx={{ height: 5 }} color='primary' />
            </Box>)
    } else return null;
}
