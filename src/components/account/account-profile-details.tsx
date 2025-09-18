import { useState } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    Stack,
    TextField,
    Switch,
    FormControlLabel
} from '@mui/material';
import CameraFrontIcon from '@mui/icons-material/CameraFront';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import * as Yup from 'yup';


const roles = [
    {
        value: 'MANAGER',
        label: 'Manager'
    },
    {
        value: 'OWNER',
        label: 'Propriétaire'
    },
    {
        value: 'CLIENT',
        label: 'Client'
    },
    {
        value: 'SUPERADMIN',
        label: 'Super-Admin'
    }
];


export const AccountProfileDetails = ({ user }) => {

    /* Get user params */
    const { _id, name, email, tel, role, lastname, firstname, rating } = user;

    const [disabled, setDisabled] = useState(true)
    const [editedUser, setEditedUser] = useState({
        firstname,
        lastname,
        email,
        tel
    });

    const UserSchema = Yup.object().shape({
        firstname: Yup.string().min(3, 'Trop court!').max(20, 'Trop Long!').required('Le nom du categorie est requis!'),
        lastname: Yup.object().optional(),
        email: Yup.object().optional(),
        tel: Yup.object().optional(),
    });

    const formik = useFormik({
        initialValues: { firstname: firstname, lastname: lastname, email: email, tel: tel },
        validationSchema: UserSchema,
        onSubmit: (values, { setSubmitting }) => {
            var proceed = true || confirm('Êtes-vous sur de vouloir appliquer les changements?');
            if (!proceed) {
                setSubmitting(false);
                return;
            }


        },
    });


    const handleEditClick = () => {
        setDisabled(!disabled)
    }

    const editUserInfo = () => {

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <form
            autoComplete="off"
            noValidate
        // {...props}
        >
            <Card >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2, pt: 2 }}>
                    <FormControlLabel
                        control={<Switch checked={!disabled} onChange={handleEditClick} />}
                        label="Modifier"
                    />
                </Box>
                <CardHeader
                    subheader="None of these informations can be edited"
                    title="Profile"
                />
                <Divider />
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            item
                            md={6}
                            xs={12}
                        >
                            <TextField
                                disabled={disabled}
                                fullWidth
                                label="Nom"
                                name="firstname"
                                value={editedUser.firstname}
                                variant="outlined"
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid
                            item
                            md={6}
                            xs={12}
                        >
                            <TextField
                                disabled={disabled}
                                fullWidth
                                label="Lastname"
                                name="lastname"
                                value={editedUser.lastname}
                                variant="outlined"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid
                            item
                            md={6}
                            xs={12}
                        >
                            <TextField
                                disabled={disabled}
                                fullWidth
                                label="Email"
                                name="email"
                                value={editedUser.email}
                                variant="outlined"
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid
                            item
                            md={6}
                            xs={12}
                        >
                            <TextField
                                disabled={disabled}
                                fullWidth
                                label="Tél"
                                name="tel"
                                type="number"
                                value={editedUser.tel}
                                variant="outlined"
                                onChange={handleChange}
                            />
                        </Grid>

                        {role &&
                            <Grid
                                item
                                md={6}
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    disabled
                                    label="Role"
                                    type="text"
                                    value={role}
                                    variant="outlined"
                                >
                                    {roles.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>
                        }
                    </Grid>
                    <Grid
                        item
                        md={12}
                        xs={12}
                    >
                        <Button
                            startIcon={<EditIcon />}
                            fullWidth
                            size="medium"
                            variant="contained"
                            onClick={editUserInfo}
                            disabled={disabled}
                            sx={{ px: "20%", py: "1%", mt: 2 }}
                        >
                            Modifier
                        </Button>
                    </Grid>


                </CardContent>

                {/*
        <Grid
          item
          ml={3}
          mb={2}
          md={6}
          xs={12}
        >
          <Stack direction="row" spacing={1}>
            <Chip
              label="Identity document"
              onClick={onDocumentClick}
              sx={{ p: 2 }}
              icon={<BadgeIcon fontSize='small' />}
            />
            <Chip
              sx={{ p: 2 }}
              label="Selfie"
              onClick={onSelfieClick}
              icon={<CameraFrontIcon fontSize='small' />}
            />
          </Stack>
        </Grid>


        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2
          }}
        >
          <Button
            sx={{ boxShadow: 0 }}
            color="primary"
            disableElevation
            variant="contained"
          >
            Verify user
          </Button>
        </Box>
        */}
            </Card>
        </form >
    );
};
