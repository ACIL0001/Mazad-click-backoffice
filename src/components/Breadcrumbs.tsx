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


export interface BreadcrumbLink {
    name: string;
    href?: string;
}

export interface BreadcrumbProps {
    links?: BreadcrumbLink[];
}

export default function Breadcrumb({ links }: BreadcrumbProps = {}) {
    const navigate = useNavigate();

    let displayLinks: any[] = [];

    if (links) {
        displayLinks = links;
    } else {
        const rawPaths = window.location.pathname.split('/').filter(x => x);
        displayLinks = rawPaths.map((name, i) => {
            return {
                name: translateToFrench(name),
                href: "/" + rawPaths.slice(0, i + 1).join('/'),
                path: rawPaths.slice(0, i + 1).join('/')
            };
        });
    }

    const redirect = (p: any) => {
        if (!p.href && !p.path) return;
        
        if (p.name === "Tableau de bord") {
            navigate("/dashboard/app");
        } else if (p.href) {
            navigate(p.href);
        } else if (p.path) {
            navigate("/" + p.path);
        }
    }

    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb">
                {displayLinks.map((p, i) => (
                    <Link 
                        key={i} 
                        underline="hover" 
                        href={p.href || '#'} 
                        onClick={() => redirect(p)}
                        color={i == displayLinks.length - 1 ? "text.primary" : "inherit"}
                        sx={{ cursor: (p.href || p.path) ? 'pointer' : 'default' }}
                    >
                        {p.name}
                    </Link>
                ))}
            </Breadcrumbs>
        </div >
    );
}
