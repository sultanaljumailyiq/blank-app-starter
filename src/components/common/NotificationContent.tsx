import React from 'react';

interface NotificationContentProps {
    text: string;
}

export const NotificationContent: React.FC<NotificationContentProps> = ({ text }) => {
    if (!text) return null;

    // Regex to match [type:value] pattern
    const parts = text.split(/(\[[a-z]+:[^\]]+\])/g);

    return (
        <span>
            {parts.map((part, index) => {
                const match = part.match(/^\[([a-z]+):([^\]]+)\]$/);

                if (match) {
                    const [, type, value] = match;
                    let className = 'font-bold ';

                    switch (type) {
                        case 'clinic':
                            className += 'text-indigo-600';
                            break;
                        case 'patient':
                            className += 'text-emerald-600';
                            break;
                        case 'doctor':
                        case 'staff':
                            className += 'text-purple-600';
                            break;
                        case 'lab':
                            className += 'text-orange-600';
                            break;
                        case 'item':
                            className += 'text-red-500';
                            break;
                        case 'plan':
                            className += 'text-blue-700 font-extrabold';
                            break;
                        case 'system':
                            className += 'text-gray-900 underline';
                            break;
                        default:
                            className += 'text-gray-800';
                    }

                    return <span key={index} className={className}>{value}</span>;
                }

                return <span key={index} className="text-gray-600">{part}</span>;
            })}
        </span>
    );
};
