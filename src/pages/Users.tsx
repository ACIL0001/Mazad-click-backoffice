// src/pages/Users.tsx
//------------------------------------------------------------------------------
// <copyright file="Users.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import {
    Stack,
    Avatar,
    Button,
    Checkbox,
    TableRow,
    TableBody,
    TableCell,
    Container,
    Typography,
    Chip,
} from '@mui/material';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import { useSnackbar } from 'notistack';
import MuiTable, { applySortFilter, getComparator } from '../components/Tables/MuiTable';
import ActionsMenu from '@/components/Tables/ActionsMenu';
import { UserListToolbar } from '../components/user/user-list-toolbar';
import { useTheme } from '@mui/material/styles';
import { UserAPI } from '@/api/user';

const COLUMNS = [
    { id: 'name', label: 'Nom', alignRight: false },
    // { id: 'isMale', label: 'Male', alignRight: false },
    { id: 'phone', label: 'Tel', alignRight: false },
    // { id: 'rating', label: 'Rating', alignRight: false },
    { id: 'role', label: 'Role', alignRight: false },
    { id: 'verified', label: 'Vérifié', alignRight: false },
    { id: 'enabled', label: 'Activé', alignRight: false },
    { id: 'createdAt', label: 'Créé Le', alignRight: false },
    { id: '' },
];

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>

export default function User() {
    const theme = useTheme();

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // Fix: Add a loading state for the table
    const [loading, setLoading] = useState(true);

    /// <summary>
    /// Set users data, gets updated on users state change
    /// <Returns> returns cleanup function</Returns>
    /// </summary>

    useEffect(() => {
        get();
        return () => { };
    }, []);

    /// <summary>
    /// Load users api.
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// </summary>

    const get = () => {
        setLoading(true);
        UserAPI.getAll()
            .then(({ data }) => {
                setUsers(data);
                // console.log("users", data);
            })
            .catch((e) => enqueueSnackbar('Chargement échoué.', { variant: 'error' }))
            .finally(() => setLoading(false));
    };

    /// <summary>
    /// enable user api.
    /// <param name="id"> user id</param>
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// <Exception>throw NotFoundException if catalogs not found</Exception>
    /// </summary>

    const enable = (id) => {
        var proceed = confirm("Êtes-vous sur de vouloir l'activer?");
        if (proceed) {
            UserAPI.enable(id)
                .then((res) => {
                    enqueueSnackbar('Utilisateur activé.', { variant: 'success' });
                    get();
                })
                .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };

    /// <summary>
    /// disable user api.
    /// <param name="id"> user id</param>
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// <Exception>throw NotFoundException if catalogs not found</Exception>
    /// </summary>

    const disable = (id) => {
        var proceed = confirm('Êtes-vous sur de vouloir le désactiver?');
        if (proceed) {
            UserAPI.disable(id)
                .then((res) => {
                    enqueueSnackbar('Utilisateur désactivé.', { variant: 'success' });
                    get();
                })
                .catch((e) => enqueueSnackbar(e.response.data.message, { variant: 'error' }));
        }
    };

    /// <summary>
    /// on table row click, toggle user selection (checkbox)
    /// <param name="event"> object click event</param>
    /// <param name="name"> string user name</param>
    /// <Exception>none</Exception>
    /// </summary>

    const handleClick = (event, name) => {
        // select
        if (selected.includes(name)) setSelected(selected.filter((n) => n != name));
        // unselect
        else setSelected([...selected, name]);
    };

    /// <summary>
    /// navigate to user profile
    /// <param name="user"> object user</param>
    /// <Exception>throw PageNotFoundException if page not found</Exception>
    /// </summary>

    const goToProfile = (user) => {
        navigate('/dashboard/account', {
            state: user,
        });
    };

    /// <summary>
    /// Table body component, contain row cells.
    /// <Exception>throw UndefinedException if variables are undefined on component state</Exception>
    /// </summary>

    const TableBodyComponent = () => {
        const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;
        const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);
        return (
            <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { _id, name, isMale, tel, verified, role, enabled, createdAt } = row;
                    const isItemSelected = selected.indexOf(name) !== -1;

                    return (
                        <TableRow
                            hover
                            key={_id}
                            tabIndex={-1}
                            // role="checkbox"
                            // selected={isItemSelected}
                            aria-checked={isItemSelected}
                        >
                            {/* <TableCell padding="checkbox">
                                <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name)} />
                            </TableCell> */}
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {index + 1}
                                </Label>
                            </TableCell>
                            <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle2" noWrap>
                                        <Chip onClick={() => goToProfile(row)} label={name} component="a" href="#basic-chip" clickable />
                                    </Typography>
                                </Stack>
                            </TableCell>

                            {/* <TableCell align="center">{isMale ? "Homme" : 'Femme'}</TableCell> */}
                            <TableCell align="left">{tel}</TableCell>
                            {/* <TableCell align="left">{rating.value} ☆</TableCell> */}
                            <TableCell align="left">
                                <Label variant="ghost" color="info">
                                    {sentenceCase(role)}
                                </Label>
                            </TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={verified ? 'success' : 'error'}>
                                    {sentenceCase('')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">
                                <Label variant="ghost" color={enabled ? 'success' : 'error'}>
                                    {sentenceCase('')}
                                </Label>
                            </TableCell>
                            <TableCell align="left">{new Date(createdAt).toDateString()}</TableCell>
                            <TableCell align="right">
                                {enabled ?
                                    <ActionsMenu
                                        _id={row}
                                        actions={[
                                            { label: 'Activer', onClick: enable, icon: 'mdi:user-check-outline' },
                                        ]}
                                    /> :
                                    <ActionsMenu
                                        _id={row}
                                        actions={[
                                            { label: 'Désactiver', onClick: disable, icon: 'mdi:user-block-outline' },
                                        ]}
                                    />}
                            </TableCell>
                        </TableRow>
                    );
                })}
                {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                    </TableRow>
                )}
            </TableBody>
        );
    };

    /// <devdoc>
    ///    <para>User page components.</para>
    /// </devdoc>

    return (
        <Page title="Users">
            <Container>
                <UserListToolbar />
                {users && (
                    <MuiTable
                        data={users}
                        columns={COLUMNS}
                        page={page}
                        setPage={setPage}
                        order={order}
                        setOrder={setOrder}
                        orderBy={orderBy}
                        setOrderBy={setOrderBy}
                        selected={selected}
                        setSelected={setSelected}
                        filterName={filterName}
                        setFilterName={setFilterName}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        // Fix: Add required props for MuiTable
                        TableBodyComponent={TableBodyComponent}
                        numSelected={selected.length}
                        loading={loading}
                    />
                )}
            </Container>
        </Page>
    );
}