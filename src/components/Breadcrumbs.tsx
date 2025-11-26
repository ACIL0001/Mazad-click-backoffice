//------------------------------------------------------------------------------
// <copyright file="Breadcrumbs.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------


import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


/// <summary>
/// Handle div click
/// </summary>


function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
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
    const { t } = useTranslation();

    const translatePath = (name: string): string => {
        // Try to get translation from navigation namespace first
        const navKey = `navigation.${name}`;
        const translation = t(navKey, { defaultValue: '' });
        if (translation && translation !== navKey) {
            return translation;
        }
        
        // Fallback to common translations
        const commonKey = `common.${name}`;
        const commonTranslation = t(commonKey, { defaultValue: '' });
        if (commonTranslation && commonTranslation !== commonKey) {
            return commonTranslation;
        }
        
        // If no translation found, return capitalized name
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    let displayLinks: any[] = [];

    if (links) {
        displayLinks = links;
    } else {
        const rawPaths = window.location.pathname.split('/').filter(x => x);
        displayLinks = rawPaths.map((name, i) => {
            return {
                name: translatePath(name),
                href: "/" + rawPaths.slice(0, i + 1).join('/'),
                path: rawPaths.slice(0, i + 1).join('/')
            };
        });
    }

    const redirect = (p: any) => {
        if (!p.href && !p.path) return;
        
        if (p.name === t('navigation.dashboard') || p.path === 'app') {
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
