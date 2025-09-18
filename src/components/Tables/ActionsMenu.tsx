import { useRef, useState } from 'react';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
// component
import Iconify from '../../components/Iconify';


interface IAction {
    label: string,
    icon: string,
    onClick: Function
}

interface Props {
    _id: string,
    actions: IAction[]
}

export default function ActionsMenu({
    _id,
    actions,
}: Props) {
    const ref = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <IconButton ref={ref} onClick={() => setIsOpen(true)}>
                <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
            </IconButton>
            <Menu
                open={isOpen}
                anchorEl={ref.current}
                onClose={() => setIsOpen(false)}
                PaperProps={{
                    sx: { width: 200, maxWidth: '100%' },
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {actions.map(({ label, icon, onClick }, index) => {
                    return (
                        <MenuItem key={index} onClick={() => { setIsOpen(false), onClick(_id) }} sx={{ color: 'text.secondary' }}>
                            <ListItemIcon>
                                <Iconify icon={icon} width={24} height={24} />
                            </ListItemIcon>
                            <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2' }} />
                        </MenuItem>
                    )
                })}
            </Menu>
        </>
    );
}
