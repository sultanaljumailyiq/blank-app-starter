import React from 'react';
import { Outlet } from 'react-router-dom';
import { StoreHeader } from '../components/store/StoreHeader';

import { BottomNavigation } from '../components/layout/BottomNavigation';

export const StoreLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <StoreHeader />
            <Outlet />
            <BottomNavigation />
        </div>
    );
};
