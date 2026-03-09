import React from 'react';
import { Card } from '../../../../../components/common/Card';
import { Button } from '../../../../../components/common/Button';
import { ClipboardList, Plus, Truck } from 'lucide-react';

export const AssetsInventoryManagement: React.FC = () => {
    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">إدارة عمليات المخزون</h3>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Truck className="w-4 h-4 ml-2" />
                            الموردين
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="w-4 h-4 ml-2" />
                            طلب شراء جديد
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">سجل الحركات</h4>
                                <p className="text-sm text-gray-500">تتبع الإدخالات والإخراجات من المخزون</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">طلبات الشراء</h4>
                                <p className="text-sm text-gray-500">إدارة الطلبات المعلقة والمكتملة</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="font-bold text-gray-900 mb-4">أحدث الحركات</h4>
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-500">لا توجد حركات حديثة لعرضها</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
