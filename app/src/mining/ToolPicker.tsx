import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

import * as React from 'react';

import { useGameContext } from '../App';

interface Props {
    selectedToolType?: ToolType
    onSelectTool: (toolType: ToolType) => void
}

const ToolPicker = ({selectedToolType, onSelectTool}: Props) => {
    const { gameState } = useGameContext();

    const visibleItems = gameState.currentShip!.cargo.filter(cargo => cargo.type === 'tool') as DiggingTool[];
    let foundSelectedType = false;
    return (
        <div className="item-list">
            <List>
                {visibleItems.map((tool, index) => {
                    let selected = false;
                    if (!foundSelectedType && tool.cargoType === selectedToolType) {
                        selected = true;
                        foundSelectedType = true;
                    }
                    // Eventually we should indicate energy use of tools.
                    const text = `${tool.name} - ${tool.remainingUses}`;
                    return (
                        <ListItem disablePadding key={text + index}>
                            <ListItemButton
                                onClick={() => onSelectTool(tool.cargoType)}
                                selected={ selected }
                            >
                                <ListItemIcon>
                                    <BuildIcon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
};

export default ToolPicker;
