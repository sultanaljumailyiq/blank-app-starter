import React from 'react';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Outlet, useLocation } from 'react-router-dom';

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const shouldHideHeader = location.pathname.includes('/community');

    return (
        <div className="min-h-screen bg-white pb-24">
            {!shouldHideHeader && (
                <GlobalHeader
                    cartItemsCount={3}
                    notificationsCount={2}
                    messagesCount={5}
                />
            )}
            <Outlet />
            <BottomNavigation />
        </div>
    );
};
