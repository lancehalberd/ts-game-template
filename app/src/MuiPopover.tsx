import Popover from '@mui/material/Popover';
import { PopoverOrigin } from '@mui/material';
import * as React from 'react';

interface Props {
    popoverContent: React.ReactNode;
    anchorOrigin?: PopoverOrigin;
    transformOrigin?: PopoverOrigin;
}
const MuiPopover: React.FunctionComponent<Props> = ({
    children,
    popoverContent,
    anchorOrigin,
    transformOrigin,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const isOpen = Boolean(anchorEl);

    const triggerContent = (
        <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
            {children}
        </div>
    );

    anchorOrigin ||= {
        vertical: 'bottom',
        horizontal: 'left',
    };

    transformOrigin ||= {
        vertical: 'top',
        horizontal: 'left',
    };

    return (
        <>
            {triggerContent}
            <Popover
                id="mouse-over-popover"
                sx={{
                    pointerEvents: 'none',
                }}
                open={isOpen}
                anchorEl={anchorEl}
                anchorOrigin={anchorOrigin}
                transformOrigin={transformOrigin}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                {popoverContent}
            </Popover>
        </>
    );
};

export default MuiPopover;
