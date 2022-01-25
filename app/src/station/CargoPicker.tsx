import * as React from 'react';
import { Box, Tab, Tabs } from '@mui/material';

const CargoPicker = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <div className="cargo-picker">
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={value} onChange={handleChange} centered>
                    <Tab label="Digging Tools" />
                    <Tab label="Fuels" />
                    <Tab label="Ores" />
                </Tabs>
            </Box>
        </div>
    );
};

export default CargoPicker;
