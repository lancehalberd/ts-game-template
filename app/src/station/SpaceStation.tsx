import * as React from 'react';

import { MuiHeader } from '../mui';
import TopStatusBar from '../TopStatusBar';
import StationStepper from './StationStepper';

const SpaceStation = () => {
    return (
        <div className="space-station">
            <div className="header">
                <MuiHeader variant="h1">Eve Offline</MuiHeader>
                <TopStatusBar />
            </div>

            <StationStepper />
        </div>
    );
};

export default SpaceStation;
