//------------------------------------------------------------------------------
// <copyright file="Breadcrumbs.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------


import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';


/// <summary>
/// Handle div click
/// </summary>


function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
}

function translateToFrench(name: string): string {
    switch (name) {
        case "dashboard":
            return "Tableau de bord";
        case "users":
            return "Utilisateurs";
        case "categories":
            return "Categories";
        case "add":
            return "Ajouter";
        case "clients":
            return "Clients";
        case "riders":
            return "Livreurs";
        case "restaurants":
            return "Restaurants";
        case "identities":
            return "Identités";
        case "configuration":
            return "Configuration";
        case "update":
            return "Mettre à jour";
        case "deliveries":
            return "Livraisons";
        default:
            return name;
    }
}

/// <devdoc>
///    <para>  Breadcrumbs component to display page route. </para>
/// </devdoc>


export default function Breadcrumb() {
    const navigate = useNavigate();

    let paths: any[] = window.location.pathname.split('/').filter(x => x).slice()


    /// <summary>
    /// reformat data
    /// </summary>


    paths = paths.map((name, i) => {
        return {
            name: translateToFrench(name),
            href: window.location.origin + "/" + paths.slice(0, i + 1).join('/'),
            path: paths.slice(0, i + 1).join('/')
        }
    })


    /// <summary>
    /// redirect to page
    /// </summary>


    const redirect = (p) => {
        if (p.name == "Tableau de bord") navigate("/dashboard/app")
        else navigate("/" + p.path)
    }


    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb">
                {paths.map((p: any, i) => (
                    <Link key={i} underline="hover" href={p.href} onClick={() => redirect(p)}
                        color={i == paths.length - 1 ? "text.primary" : "inherit"}>
                        {p.name}
                    </Link>
                ))}
            </Breadcrumbs>
        </div >
    );
}
