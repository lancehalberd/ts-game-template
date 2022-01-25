import * as React from 'react';
import Typography from '@mui/material/Typography';

type MuiHeaderVariant = 'h1' | 'h2' | 'h3' | 'h4';

const muiHeaderBase = (
    variant: MuiHeaderVariant,
    children: React.ReactNode
) => (
    <Typography variant={variant} component="div" gutterBottom>
        {children}
    </Typography>
);

export const MuiH1: React.FunctionComponent = ({ children }) =>
    muiHeaderBase('h1', children);

export const MuiH2: React.FunctionComponent = ({ children }) =>
    muiHeaderBase('h2', children);

export const MuiH3: React.FunctionComponent = ({ children }) =>
    muiHeaderBase('h3', children);

export const MuiH4: React.FunctionComponent = ({ children }) =>
    muiHeaderBase('h4', children);
