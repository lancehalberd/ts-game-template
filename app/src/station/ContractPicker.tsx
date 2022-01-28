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

import { contractNumber } from 'app/gameConstants';

import * as React from 'react';
import { GameContext } from '../App';
import AsteroidPane from '../mining/AsteroidPane';
import { formatNumber } from 'app/utils/string';

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
    const { gameState, gameApi, refreshGameState, setStationStep } =
        React.useContext(GameContext);
    const [selectedContract, setSelectedContract] = React.useState<Contract>(gameState.station.availableContracts[0]);

    const handleContractClick = (contract: Contract) => {
        setSelectedContract(contract);
    };

    const handleContractSelect = (contract: Contract) => {
        gameApi.purchaseContract(contract.id, { spendCredit: true });
        refreshGameState();
        setStationStep('rentShip');
    };

    const visibleContracts = gameState.station.availableContracts.slice(0, contractNumber);

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
                                        primary={`${contract.name}`}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                        gameApi.rest();
                        refreshGameState();
                        setSelectedContract(gameApi.getContract(0));
                    } }
                >
                    Wait for New Contracts
                </Button>
            </div>
            {selectedContract && (
                <>
                    <div className="item-details">
                        <ContractDetailItem
                            label="Cost"
                            value={formatNumber(selectedContract.cost, true)}
                        />
                        <ContractDetailItem
                            label="Distance"
                            value={formatNumber(
                                selectedContract.distance,
                                false,
                                true
                            )}
                        />
                        <AsteroidPane contract={selectedContract} />
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
