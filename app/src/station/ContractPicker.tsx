import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

import * as React from 'react';
import { GameContext } from '../App';

const ContractPicker = () => {
    const { gameState } = React.useContext(GameContext);

    return (
        <div className="contract-picker">
            <div className="contract-list">
                <List>
                    {gameState.station.availableContracts.map((contract) => {
                        return (
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <ArticleIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={`Contract ${contract.id}`}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </div>
        </div>
    );
};

export default ContractPicker;
