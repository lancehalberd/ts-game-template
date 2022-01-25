import {
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

import * as React from 'react';
import { GameContext } from '../App';

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
    const { gameState, gameApi, setGameState } = React.useContext(GameContext);
    const [selectedContract, setSelectedContract] = React.useState<Contract>();

    const handleContractClick = (contract: Contract) => {
        setSelectedContract(contract);
    };

    const handleContractSelect = (contract: Contract) => {
        gameApi.purchaseContract(contract.id, { spendCredit: true });
        setGameState(gameApi.getState());
    };

    const visibleContracts = gameState.station.availableContracts.slice(0, 10);

    return (
        <div className="contract-picker" style={{ display: 'flex' }}>
            <div className="contract-list">
                <List>
                    {visibleContracts.map((contract) => {
                        return (
                            <ListItem disablePadding key={contract.id}>
                                <ListItemButton
                                    onClick={() =>
                                        handleContractClick(contract)
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
                    <div className="contract-details">
                        <Stack spacing={2}>
                            <ContractDetailItem
                                label="Cost"
                                value={selectedContract.cost}
                            />
                            <ContractDetailItem
                                label="Cargo"
                                value={selectedContract.cargo.join(',')}
                            />
                            <ContractDetailItem
                                label="Cargo Space"
                                value={selectedContract.cargoSpace}
                            />
                            <ContractDetailItem
                                label="Distance"
                                value={selectedContract.distance}
                            />
                            <ContractDetailItem
                                label="Grid Points"
                                value={selectedContract.grid.length}
                            />
                        </Stack>
                    </div>
                    <div className="select-contract-pane">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() =>
                                handleContractSelect(selectedContract)
                            }
                        >
                            Select This Contract
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
