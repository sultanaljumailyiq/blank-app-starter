import React, { useState } from 'react';
import { X, Upload, Users, Hash } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useCommunityContext } from '../../../contexts/CommunityContext';
import { Modal } from '../../../components/common/Modal'; // Assuming generic modal exists or using simple implementation

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
    const { createGroup } = useCommunityContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('طب أسنان عام');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description) return;

        setLoading(true);
        try {
            await createGroup(name, description, category, privacy);
            onClose();
            setName('');
            setDescription('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إنشاء مجموعة جديدة">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">اسم المجموعة</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="مثال: أطباء زراعة الأسنان في بغداد"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                        placeholder="وصف مختصر لأهداف المجموعة ومحتواها..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="طب أسنان عام">طب أسنان عام</option>
                            <option value="جراحة">جراحة</option>
                            <option value="تقويم">تقويم</option>
                            <option value="تجميل">تجميل</option>
                            <option value="أطفال">أطفال</option>
                            <option value="طلاب">طلاب</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">الخصوصية</label>
                        <select
                            value={privacy}
                            onChange={(e) => setPrivacy(e.target.value as any)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="public">عامة (يمكن للجميع الانضمام)</option>
                            <option value="private">خاصة (تتطلب موافقة)</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-xl"
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                        disabled={loading || !name}
                    >
                        {loading ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
