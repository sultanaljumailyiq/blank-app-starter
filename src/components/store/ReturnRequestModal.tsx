
import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, selectedItems: string[]) => Promise<void>;
    items: any[];
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
    isOpen, onClose, onSubmit, items
}) => {
    const [reason, setReason] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!reason || selectedItems.length === 0) return;
        setLoading(true);
        await onSubmit(reason, selectedItems);
        setLoading(false);
        onClose();
    };

    const toggleItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">طلب إرجاع</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">حدد المنتجات للإرجاع</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => toggleItem(item.id)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <div className="flex items-center gap-2">
                                            <img src={item.image || item.product?.image_url} className="w-8 h-8 rounded bg-gray-100 object-cover" />
                                            <span className="text-sm font-medium line-clamp-1">{item.name || item.product?.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">سبب الإرجاع</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="يرجى توضيح سبب الإرجاع..."
                            />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg flex gap-2 text-blue-700 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>سيتم مراجعة الطلب من قبل المورد والرد خلال 24 ساعة.</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleSubmit}
                                disabled={loading || !reason || selectedItems.length === 0}
                            >
                                {loading ? 'جاري الإرسال...' : 'تأكيد الإرجاع'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
