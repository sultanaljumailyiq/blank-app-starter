import React from 'react';
import { Button } from '../../../components/common/Button';
import { mockFriends } from '../../../data/mock';
import { MessageCircle, User } from 'lucide-react';

interface FriendsListProps {
    onProfileClick?: (id: string) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onProfileClick }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">شبكة التواصل</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockFriends.map(friend => (
                    <div key={friend.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-xl group-hover:scale-105 transition-transform">
                                {friend.name[0]}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>

                        <div className="flex-1">
                            <h3
                                className="font-bold text-gray-900 text-lg cursor-pointer hover:text-purple-600 transition-colors"
                                onClick={() => onProfileClick?.(friend.id)}
                            >
                                {friend.name}
                            </h3>
                            <p className="text-sm text-gray-500">{friend.role}</p>
                            <div className="flex gap-2 mt-3">
                                <Button size="sm" className="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border-none h-8">
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    مراسلة
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="px-2 h-8"
                                    onClick={() => onProfileClick?.(friend.id)}
                                >
                                    <User className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
