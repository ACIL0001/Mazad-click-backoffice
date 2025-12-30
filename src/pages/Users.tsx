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
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../components/skeletons/TableSkeleton';

/// <devdoc>
///    <para>  User Page for users management. </para>
/// </devdoc>

export default function User() {
    const { t } = useTranslation();
    const theme = useTheme();

    const COLUMNS = [
        { id: 'name', label: t('users.name') || 'Nom', alignRight: false },
        // { id: 'isMale', label: 'Male', alignRight: false },
        { id: 'phone', label: t('common.phone'), alignRight: false },
        // { id: 'rating', label: 'Rating', alignRight: false },
        { id: 'role', label: t('common.role') || 'Role', alignRight: false },
        { id: 'verified', label: t('users.verified') || 'Vérifié', alignRight: false },
        { id: 'enabled', label: t('users.enabled') || 'Activé', alignRight: false },
        { id: 'createdAt', label: t('users.createdAt') || 'Créé Le', alignRight: false },
        { id: '' },
    ];

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Refactored to React Query
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await UserAPI.getAll();
            return data;
        },
        staleTime: Infinity,
    });
    
    const users = usersData || [];

    const [page, setPage] = useState(0);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState([]);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // Loading managed by useQuery

    // Data fetching handled by useQuery
    // Removed get() and useEffect

    /// <summary>
    /// enable user api.
    /// <param name="id"> user id</param>
    /// <Exception>throw UnauthorizedAccessException if access is denied</Exception>
    /// <Exception>throw NotFoundException if catalogs not found</Exception>
    /// </summary>

    const enable = (id) => {
        var proceed = confirm(t('users.confirmEnable') || "Êtes-vous sur de vouloir l'activer?");
        if (proceed) {
            UserAPI.enable(id)
                .then((res) => {
                    enqueueSnackbar(t('users.userEnabled') || 'Utilisateur activé.', { variant: 'success' });
                    queryClient.invalidateQueries({ queryKey: ['users'] });
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
        var proceed = confirm(t('users.confirmDisable') || 'Êtes-vous sur de vouloir le désactiver?');
        if (proceed) {
            UserAPI.disable(id)
                .then((res) => {
                    enqueueSnackbar(t('users.userDisabled') || 'Utilisateur désactivé.', { variant: 'success' });
                    queryClient.invalidateQueries({ queryKey: ['users'] });
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
                                            { label: t('users.enable') || 'Activer', onClick: enable, icon: 'mdi:user-check-outline' },
                                        ]}
                                    /> :
                                    <ActionsMenu
                                        _id={row}
                                        actions={[
                                            { label: t('users.disable') || 'Désactiver', onClick: disable, icon: 'mdi:user-block-outline' },
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
                {isLoading ? (
                    <TableSkeleton rows={10} columns={COLUMNS.length} />
                ) : (
                    users && (
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
                        loading={isLoading}
                    />
                ))}
            </Container>
        </Page>
    );
}