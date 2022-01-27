import {
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

import * as React from 'react';
import { GameContext } from '../App';
import AsteroidPane from '../mining/AsteroidPane';

const ContractDetailItem = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}): JSX.Element => {
    return (
        <Paper>
            {label}: {value}
        </Paper>
    );
};

const ContractPicker = () => {
    const { gameState, gameApi, refreshGameState } = React.useContext(GameContext);
    const [selectedContract, setSelectedContract] = React.useState<Contract>();

    const handleContractClick = (contract: Contract) => {
        setSelectedContract(contract);
    };

    const handleContractSelect = (contract: Contract) => {
        gameApi.purchaseContract(contract.id, { spendCredit: true });
        refreshGameState();
    };

    const visibleContracts = gameState.station.availableContracts.slice(0, 10);

    return (
        <div className="item-picker">
            <div className="item-list">
                <List>
                    {visibleContracts.map((contract) => {
                        return (
                            <ListItem disablePadding key={contract.id}>
                                <ListItemButton
                                    onClick={() =>
                                        handleContractClick(contract)
                                    }
                                    selected={
                                        selectedContract?.id === contract.id
                                    }
                                >
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
            {selectedContract && (
                <>
                    <div className="item-details">
                        <ContractDetailItem
                            label="Cost"
                            value={selectedContract.cost}
                        />
                        <ContractDetailItem
                            label="Distance"
                            value={selectedContract.distance}
                        />
                        <AsteroidPane
                            contract={selectedContract}
                            readonly
                        />
                    </div>
                    <div className="select-item-pane">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() =>
                                handleContractSelect(selectedContract)
                            }
                        >
                            Buy Contract
                        </Button>
                        <p>
                            Pick the Contract you'd like to work on, then you
                            can select your Ship!
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContractPicker;
