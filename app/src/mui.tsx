import * as React from 'react';
import Typography from '@mui/material/Typography';

type MuiHeaderVariant = 'h1' | 'h2' | 'h3' | 'h4';

interface MuiHeaderProps {
    variant: MuiHeaderVariant;
    children: React.ReactNode;
}
export const MuiHeader: React.FC<MuiHeaderProps> = ({ variant, children }) => (
    <Typography variant={variant} component="div" gutterBottom>
        {children}
    </Typography>
);
