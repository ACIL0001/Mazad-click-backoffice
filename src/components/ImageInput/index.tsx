import { Box, Typography, IconButton, Stack } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';
import Iconify from '../Iconify';
import app from '@/config';
import { alpha, useTheme } from "@mui/material";

export default function ImageInput({
    handleFile,
    file,
    defaultImage,
    label,
    sx, // Changed from 'style' to 'sx' for Material-UI styling
}: {
    handleFile: (file: File | null) => void;
    file: File | null | undefined;
    defaultImage?: string;
    label?: string;
    sx?: object; // Changed from 'style' to 'sx'
}) {
    const hiddenFileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const theme = useTheme();

    useEffect(() => {
        if (file instanceof File) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (file === null) {
            setPreview(null);
        } else if (defaultImage) {
            setPreview(app.route + defaultImage);
        } else {
            setPreview(null);
        }
    }, [file, defaultImage]);

    const handleClick = () => {
        hiddenFileInput.current?.click();
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileUploaded = event.target.files?.[0] || null;
        handleFile(fileUploaded);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent triggering the file input click when deleting
        handleFile(null);
        setPreview(null);
    };

    const hasImage = preview !== null;

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                minHeight: 150,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                overflow: 'hidden',
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.1)} 0%, ${alpha(theme.palette.grey[300], 0.1)} 100%)`,
                transition: 'all 0.3s ease-in-out',
                "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                ...sx, // Apply custom sx props
            }}
            onClick={handleClick} // Make the entire Box clickable
        >
            {label && <Typography variant="subtitle2" align="center" gutterBottom sx={{ position: 'absolute', top: 8, zIndex: 3 }}>
                {label}
            </Typography>}

            <input
                type="file"
                ref={hiddenFileInput}
                onChange={handleChange}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {hasImage ? (
                <img
                    src={preview!}
                    alt="Preview"
                    style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain',
                        padding: 0,
                        margin: 0,
                    }}
                />
            ) : (
                <Stack alignItems="center" spacing={1} sx={{ zIndex: 1, color: theme.palette.text.secondary }}>
                    <Iconify width={60} height={60} icon="bi:image-fill" />
                    <Typography variant="body2">
                        Glissez ou cliquez pour ajouter une image
                    </Typography>
                </Stack>
            )}

            {hasImage && (
                <IconButton
                    onClick={handleDelete}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 0, 0, 0.7)',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'red',
                            transform: 'scale(1.1)',
                        },
                        transition: 'transform 0.2s ease-in-out',
                        zIndex: 3,
                    }}
                >
                    <Iconify width={20} height={20} icon="zondicons:close-solid" />
                </IconButton>
            )}

            <Box
                className="hover-overlay"
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.common.black, 0.6),
                    color: "common.white",
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    zIndex: 1,
                    "&:hover": {
                        opacity: 1,
                    },
                }}
            >
                <Stack alignItems="center" spacing={1}>
                    <Iconify icon="mdi:camera-plus" width={48} height={48} />
                    <Typography variant="subtitle1">
                        {hasImage ? "Cliquez ou glissez pour modifier" : "Cliquez ou glissez une image"}
                    </Typography>
                </Stack>
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    bgcolor: (theme) => alpha(theme.palette.common.black, 0.5),
                    color: "common.white",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    zIndex: 2,
                }}
            >
                {hasImage ? "Cliquez pour modifier l'image" : "Ajouter une image"}
            </Box>
        </Box>
    );
}