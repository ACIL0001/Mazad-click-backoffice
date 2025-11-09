import { useRef, useState } from 'react';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText, alpha, useTheme } from '@mui/material';
// component
import Iconify from '../../components/Iconify';

type ActionColor =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';

interface IAction {
    label: string;
    icon: string;
    onClick: (id: string) => void;
    color?: ActionColor;
}

interface Props {
    _id: string;
    actions: (IAction | undefined | null)[];
}

export default function ActionsMenu({
    _id,
    actions,
}: Props) {
    const ref = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const theme = useTheme();

    const getColorStyles = (color: ActionColor | undefined) => {
        if (!color || color === 'default') {
            return {
                iconColor: theme.palette.text.primary,
                background: 'transparent',
                hoverBackground: alpha(theme.palette.action.hover, 0.12),
            };
        }

        const paletteColor = theme.palette[color];
        return {
            iconColor: paletteColor.main,
            background: alpha(paletteColor.main, 0.12),
            hoverBackground: alpha(paletteColor.main, 0.2),
        };
    };

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
                    sx: { width: 220, maxWidth: '100%' },
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {actions
                    .filter(Boolean)
                    .map(({ label, icon, onClick, color }) => {
                        const colorStyles = getColorStyles(color);
                        return (
                            <MenuItem
                                key={label}
                                onClick={() => {
                                    setIsOpen(false);
                                    onClick(_id);
                                }}
                                sx={{
                                    color: colorStyles.iconColor,
                                    backgroundColor: colorStyles.background,
                                    '&:hover': {
                                        backgroundColor: colorStyles.hoverBackground,
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 36,
                                        color: colorStyles.iconColor,
                                    }}
                                >
                                    <Iconify icon={icon} width={22} height={22} />
                                </ListItemIcon>
                                <ListItemText primary={label} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </MenuItem>
                        );
                    })}
            </Menu>
        </>
    );
}
