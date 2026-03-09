import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useBrands } from '../../hooks/useBrands';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface BrandCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (brand: any) => void;
    initialName?: string;
}

export const BrandCreationModal: React.FC<BrandCreationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialName = ''
}) => {
    const { user } = useAuth();
    const { createBrand } = useBrands();
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            checkUserRole();
        }
    }, [isOpen, initialName]);

    const checkUserRole = async () => {
        if (!user) return;
        setCheckingRole(true);
        try {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            setIsAdmin(data?.role === 'admin' || data?.role === 'super_admin');
        } catch (error) {
            console.error('Error checking role:', error);
        } finally {
            setCheckingRole(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            // isAdmin determines if verification is automatic
            const newBrand = await createBrand(name, logo || undefined, description, isAdmin);

            if (newBrand) {
                onSuccess(newBrand);
                handleClose();
            }
        } catch (error) {
            console.error('Failed to create brand:', error);
            toast.error('فشل إنشاء العلامة التجارية');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setLogo(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${isAdmin ? 'bg-purple-50' : 'bg-blue-50'}`}>
                    <div>
                        <h3 className={`font-bold text-lg ${isAdmin ? 'text-purple-900' : 'text-blue-900'}`}>
                            إضافة علامة تجارية
                        </h3>
                        {!checkingRole && (
                            <p className={`text-xs ${isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
                                {isAdmin ? 'سيتم التوثيق تلقائياً (مسؤول)' : 'سيتم إرسال الطلب للمراجعة'}
                            </p>
                        )}
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم العلامة التجارية <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="مثال: 3M, Dentsply..."
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            شعار العلامة (اختياري)
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
                            {logo ? (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-blue-600 break-all px-4">{logo.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">اضغط للتغيير</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-blue-500">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <p className="text-sm">اضغط لرفع الشعار</p>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            وصف مختصر (اختياري)
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="معلومات إضافية عن العلامة..."
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className={`w-full py-3 text-base ${isAdmin ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                            disabled={loading || !name.trim() || checkingRole}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الإضافة...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 ml-2" />
                                    {isAdmin ? 'إضافة وتوثيق' : 'إرسال للمراجعة'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
