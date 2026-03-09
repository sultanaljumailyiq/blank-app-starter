import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = "جاري التحميل...",
    size = 'md',
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3 p-4">
            <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
            {message && (
                <p className="text-gray-500 text-sm font-medium animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            {content}
        </div>
    );
};
