import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ContractPicker from './ContractPicker';
import { GameContext } from '../App';
import ShipPicker from './ShipPicker';
import CargoPicker from './CargoPicker';
import { Paper } from '@mui/material';
import PreviewTrip from './PreviewTrip';

interface StepItem {
    key: StationStep;
    label: string;
}
const steps: StepItem[] = [
    { label: 'Purchase a Contract', key: 'purchaseContract' },
    { label: 'Rent a Ship', key: 'rentShip' },
    { label: 'Outfit Your Ship', key: 'outfitShip' },
    { label: 'Preview your Trip', key: 'previewTrip' },
];

export const DetailItem = ({
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

export default function StationStepper() {
    const { gameState, stationStep } = React.useContext(GameContext);
    const [activeStep, setActiveStep] = React.useState(0);
    const [completed, setCompleted] = React.useState<{
        [k: number]: boolean;
    }>({});

    React.useEffect(() => {
        const activeItem = steps.find(
            (step) => step.key === stationStep
        );
        const stepIndex = (activeItem && steps.indexOf(activeItem)) || 0;
        setActiveStep(stepIndex);
    }, [stationStep]);

    React.useEffect(() => {
        if (gameState.currentContract) {
            setCompleted({ ...completed, 0: true });
        }
        if (gameState.station.ships.length) {
            setCompleted({ ...completed, 1: true });
        }
    }, [gameState.currentContract, gameState.station.ships]);

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.keys(completed).length;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();
    };

    const handleStep = (step: number) => () => {
        setActiveStep(step);
    };

    const handleReset = () => {
        setActiveStep(0);
        setCompleted({});
    };

    const getStepContent = (activeStep: number) => {
        switch (activeStep) {
            case 0:
                return <ContractPicker />;
                break;
            case 1:
                return <ShipPicker />;
                break;
            case 2:
                return <CargoPicker />;
                break;
            case 3:
                return <PreviewTrip />;
                break;
            default:
                return 'TBD';
        }
    };

    return (
        <div className="station-stepper">
            <Box sx={{ width: '100%' }}>
                <Stepper nonLinear activeStep={activeStep}>
                    {steps.map((stepItem, index) => (
                        <Step key={stepItem.label} completed={completed[index]}>
                            <StepButton
                                color="inherit"
                                onClick={handleStep(index)}
                            >
                                {stepItem.label}
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>
                <div>
                    {allStepsCompleted() ? (
                        <React.Fragment>
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                All steps completed - you&apos;re finished
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    pt: 2,
                                }}
                            >
                                <Box sx={{ flex: '1 1 auto' }} />
                                <Button onClick={handleReset}>Reset</Button>
                            </Box>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            {getStepContent(activeStep)}
                        </React.Fragment>
                    )}
                </div>
            </Box>
        </div>
    );
}
