
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';

interface UnavailableItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
    unavailableItems: any[];
}

export const UnavailableItemsModal: React.FC<UnavailableItemsModalProps> = ({
    isOpen, onClose, onProceed, unavailableItems
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            تنبيه: منتجات غير متوفرة
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">
                        بعض المنتجات في طلبك السابق لم تعد متوفرة حالياً. هل تريد المتابعة بإضافة المنتجات المتوفرة فقط إلى السلة؟
                    </p>

                    <div className="space-y-2 mb-6 max-h-40 overflow-y-auto border border-red-50 bg-red-50/30 rounded-lg p-2">
                        {unavailableItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-red-100">
                                <img src={item.image} className="w-10 h-10 rounded bg-gray-100 object-cover grayscale opacity-70" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-red-500">غير متوفر حالياً</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={onProceed}
                        >
                            متابعة (إضافة المتوفر)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
