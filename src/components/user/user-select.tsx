import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import { blue } from '@mui/material/colors';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { UserCircle } from '@/icons/user-circle';



// users mock
//const users = ['Abdelhamid', 'Zinnedine', 'Soltane'];


/// <devdoc>
///    <para>  Props Interface. </para>
/// </devdoc>

export interface IUserSelection {
    open: boolean;
    setOpen: (value: boolean) => void;
    selected: any[];
    setSelected: (value: string[]) => void;
    users: any[];
}


/// <devdoc>
///    <para>  User selection modal for new arrivals. </para>
/// </devdoc>

export function UserSelection(props: IUserSelection) {
    const { open, setOpen, selected, setSelected, users } = props;

    /// <summary>
    /// Handle modal closing
    /// </summary>

    const handleClose = () => {
        setOpen(false);
    };

    /// <summary>
    /// Check if user is selected
    /// <Returns> boolean true if user is selected</Returns>
    /// </summary>


    const isSelected = (user: any) => {
        return selected.some(u => u._id == user._id);
    };


    /// <summary>
    /// Handle on list user item click
    /// toggle user selection
    /// </summary>


    const onItemClick = (user: any) => {
        if (isSelected(user)) setSelected(selected.filter(u => u._id != user._id));
        else setSelected([...selected, user]);
    };


    /// <summary>
    /// Close modal
    /// Notification api
    /// </summary>


    const onNotify = () => {
        handleClose();
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle sx={{ mx: 8 }}>Utilisateurs</DialogTitle>
            <List sx={{ pt: 0 }}>
                {users.map((user) => {
                    const { name, _id } = user;
                    return (
                        <ListItem
                            button
                            sx={{ backgroundColor: isSelected(user) ? blue[50] : "transparent" }}
                            onClick={() => onItemClick(user)}
                            key={_id}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={name} />
                        </ListItem>
                    )
                })}
                <ListItem button onClick={onNotify}>
                    <ListItemAvatar>
                        <Avatar>
                            <HowToRegIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Séléctionner" />
                </ListItem>
            </List>
        </Dialog>
    );
}

