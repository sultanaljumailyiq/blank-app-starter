import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Calendar, DollarSign, Activity, CheckCircle, AlertCircle, ChevronRight, ChevronDown, Stethoscope, Clock, Shield, Beaker } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { TreatmentAsset } from '../../data/mock/assets';
import { getWorkflowForAsset, TreatmentWorkflow } from '../../lib/treatment-registry';
import { formatCurrency } from '../../lib/utils';
import { ToothCondition } from '../../types/treatment';

interface ToothInteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Multi-tooth support
    toothNumbers: number[];
    onSave: (data: any) => void;
    availableTreatments?: TreatmentAsset[];
}

export const ToothInteractionModal: React.FC<ToothInteractionModalProps> = ({
    isOpen,
    onClose,
    toothNumbers = [],
    onSave,
    availableTreatments = []
}) => {
    // Only two tabs now: treatment and confirm
    const [activeTab, setActiveTab] = useState<'treatment' | 'confirm'>('treatment');

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab('treatment');
            setFormData({
                notes: '',
                selectedAssetId: '',
                customCost: 0, // Cost PER TOOTH
                priority: 'medium',
                startDate: new Date().toISOString().split('T')[0],
                assignedDoctor: 'د. أحمد محمد'
            });
            setSelectedAsset(null);
            setSelectedWorkflow(null);
        }
    }, [isOpen, toothNumbers]);

    const [formData, setFormData] = useState({
        notes: '',
        selectedAssetId: '',
        customCost: 0,
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        assignedDoctor: 'د. أحمد محمد'
    });

    const [selectedAsset, setSelectedAsset] = useState<TreatmentAsset | null>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<TreatmentWorkflow | null>(null);

    // Handle Asset Selection
    useEffect(() => {
        if (formData.selectedAssetId && availableTreatments.length > 0) {
            const asset = availableTreatments.find(t => t.id === formData.selectedAssetId);
            if (asset) {
                setSelectedAsset(asset);
                setFormData(prev => ({ ...prev, customCost: asset.basePrice }));

                // Determine Clinical Workflow from Registry
                const workflow = getWorkflowForAsset(asset.name, asset.category);
                setSelectedWorkflow(workflow);
            }
        } else {
            setSelectedAsset(null);
            setSelectedWorkflow(null);
        }
    }, [formData.selectedAssetId, availableTreatments]);

    // Group treatments by category for better UI
    const groupedTreatments = React.useMemo(() => {
        const groups: Record<string, TreatmentAsset[]> = {};

        // If toothNumbers includes 0, it means "General Treatment" (e.g. cleaning, whitening)
        const isGeneral = toothNumbers.length === 1 && toothNumbers[0] === 0;

        availableTreatments.filter(t => {
            const treatmentScope = t.scope || 'tooth';
            if (isGeneral) {
                return treatmentScope === 'general' || treatmentScope === 'both';
            } else {
                return treatmentScope === 'tooth' || treatmentScope === 'both';
            }
        }).forEach(t => {
            if (!groups[t.category]) groups[t.category] = [];
            groups[t.category].push(t);
        });
        return groups;
    }, [availableTreatments, toothNumbers]);

    const handleConfirmTreatment = () => {
        if (!selectedAsset || !selectedWorkflow) return;

        // Determine the "Resulting Condition" based on the Treatment Type
        let resultingCondition = 'healthy'; // Default fallback, but actually it will be merged with current condition in parent

        if (selectedWorkflow.type === 'endo' || selectedAsset.category === 'علاج جذور') {
            resultingCondition = 'endo';
        } else if (selectedWorkflow.type === 'implant' || (selectedAsset.category === 'جراحة' && selectedAsset.name.includes('Implant'))) {
            resultingCondition = 'implant';
        } else if (selectedWorkflow.type === 'prosthetic' || selectedAsset.category === 'تعويضات') {
            resultingCondition = 'crown';
        } else if (selectedAsset.name.toLowerCase().includes('extraction') || selectedAsset.name.includes('قلع')) {
            resultingCondition = 'missing';
        } else if (selectedAsset.category === 'ترميمي' || selectedAsset.category === 'Restorative') {
            resultingCondition = 'filled';
        }

        onSave({
            toothNumbers,
            condition: resultingCondition, // Applied predictive visual condition per tooth
            treatmentType: selectedWorkflow.type,
            notes: formData.notes,

            estimatedCostPerTooth: formData.customCost, // Note: per tooth
            startDate: formData.startDate,
            priority: formData.priority,

            // Construct the Plan blueprint
            treatmentPlan: {
                assetId: selectedAsset.id,
                workflowType: selectedWorkflow.type,
                name: selectedAsset.name,
                sessions: selectedWorkflow.defaultSessions.map((s) => ({
                    title: s.title,
                    duration: s.duration,
                    schemaId: s.schemaId,
                    status: 'pending'
                })),
                requiresLab: selectedWorkflow.requiresLab || selectedAsset.isComplex
            }
        });
        onClose();
    };

    const isGeneral = toothNumbers.length === 1 && toothNumbers[0] === 0;
    const titleString = isGeneral
        ? 'اختيار علاج عام'
        : `خطة علاج لـ ${toothNumbers.length > 1 ? `(${toothNumbers.length}) أسنان` : `السن رقم ${toothNumbers[0]}`}`;

    const teethListString = isGeneral ? 'عام' : toothNumbers.join(' , ');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            contentClassName="p-0"
        >
            <div className="flex flex-col h-full bg-gray-50/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex justify-between items-center shadow-md z-10 sticky top-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Activity className="w-6 h-6" />
                            </div>
                            {titleString}
                        </h2>
                        <p className="text-blue-100 opacity-90 mt-1 mr-14">
                            {!isGeneral && `الأسنان المستهدفة: ${teethListString}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Stepper / Status Bar */}
                <div className="bg-gray-50 border-b p-4 flex justify-end items-center text-sm shadow-sm z-10">
                    <div className="flex items-center gap-2">
                        {['treatment', 'confirm'].map((step, idx) => (
                            <div key={step} className={`flex items-center ${idx < 1 ? 'after:content-[""] after:w-8 after:h-0.5 after:mx-2 after:bg-gray-200' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeTab === step ? 'bg-blue-600 text-white shadow-md scale-110' :
                                        (idx < ['treatment', 'confirm'].indexOf(activeTab)) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {idx + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6">
                    {activeTab === 'treatment' && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="grid grid-cols-1 gap-8">
                                {Object.entries(groupedTreatments).map(([category, treatments]) => (
                                    <div key={category}>
                                        <h4 className="font-bold text-gray-700 mb-4 px-2 border-r-4 border-blue-500 bg-gray-100 py-1 rounded-l-md inline-block">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {treatments.map(asset => (
                                                <div
                                                    key={asset.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, selectedAssetId: asset.id }))}
                                                    className={`cursor-pointer group relative overflow-hidden rounded-xl border-2 p-5 transition-all hover:shadow-lg ${formData.selectedAssetId === asset.id
                                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                        : 'border-white bg-white hover:border-blue-200'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600`}>
                                                            {asset.category}
                                                        </span>
                                                        {asset.isComplex && (
                                                            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                                                                <Clock className="w-3 h-3" /> جلسات
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{asset.name}</h4>

                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                        <span className="font-bold text-lg text-blue-600">{formatCurrency(asset.basePrice)}</span>
                                                        <div className="text-xs text-gray-400">
                                                            {getWorkflowForAsset(asset.name, asset.category).defaultSessions.length} جلسات م.
                                                        </div>
                                                    </div>

                                                    {/* Selection Indicator */}
                                                    {formData.selectedAssetId === asset.id && (
                                                        <div className="absolute top-0 left-0 bg-blue-500 text-white p-1 rounded-br-lg shadow-sm">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(groupedTreatments).length === 0 && (
                                    <div className="text-center py-12 text-gray-500">لا توجد علاجات متاحة لهذه الفئة.</div>
                                )}
                            </div>

                            <div className="flex justify-end pt-6 border-t mt-4 sticky bottom-0 bg-gray-50/95 backdrop-blur-sm p-4 border-t-gray-200 -mx-6 -mb-6">
                                <Button
                                    onClick={() => setActiveTab('confirm')}
                                    disabled={!formData.selectedAssetId}
                                    className={`px-8 transition-all ${!formData.selectedAssetId ? 'opacity-50 grayscale' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'}`}
                                >
                                    التالي: تأكيد الخطة
                                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'confirm' && selectedAsset && selectedWorkflow && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Summary Card */}
                                <Card className="lg:col-span-2 p-0 overflow-hidden border-blue-200">
                                    <div className="bg-blue-50/50 p-6 border-b border-blue-100">
                                        <h3 className="text-lg font-bold flex items-center gap-2 text-blue-900">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            ملخص الخطة العلاجية ({toothNumbers.length} أسنان)
                                        </h3>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1 font-medium">نوع العلاج المختار</p>
                                                <h4 className="font-bold text-xl text-gray-900">{selectedAsset.name}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{selectedAsset.category}</span>
                                                    {selectedWorkflow.requiresLab && (
                                                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md flex items-center gap-1 border border-orange-100">
                                                            <Beaker className="w-3 h-3" /> يتطلب مختبر
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm text-gray-500 mb-1 font-medium">تكلفة السن الواحد</p>
                                                <p className="font-bold text-xl text-blue-600 font-mono">{formatCurrency(formData.customCost)}</p>
                                                {toothNumbers.length > 1 && (
                                                    <p className="text-xs font-bold text-indigo-700 mt-1">الإجمالي: {formatCurrency(formData.customCost * toothNumbers.length)}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                سير العمل المقترح ({selectedWorkflow.defaultSessions.length} جلسات)
                                            </h5>
                                            <div className="space-y-0 relative before:absolute before:inset-y-0 before:right-3.5 before:w-0.5 before:bg-gray-200">
                                                {selectedWorkflow.defaultSessions.map((session, idx) => (
                                                    <div key={idx} className="relative flex items-center gap-4 py-3 pr-8">
                                                        <div className="absolute right-1.5 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 z-10"></div>
                                                        <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100 flex justify-between items-center hover:bg-white hover:shadow-sm transition-all">
                                                            <div>
                                                                <span className="text-xs font-bold text-blue-600 block mb-0.5">جلسة {idx + 1}</span>
                                                                <span className="text-sm font-medium text-gray-800">{session.title}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">
                                                                {session.duration} دقيقة
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Settings Sidebar */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                                        <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b">إعدادات الخطة</h4>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1.5">تعديل التكلفة (للسن الواحد)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.customCost}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, customCost: parseFloat(e.target.value) }))}
                                                        className="w-full p-2.5 pl-8 bg-gray-50 border border-gray-200 rounded-lg font-bold text-green-700 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                    />
                                                    <DollarSign className="w-4 h-4 text-green-600 absolute left-2.5 top-3" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1.5">الأولوية</label>
                                                <div className="relative">
                                                    <select
                                                        value={formData.priority}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                                        className="w-full p-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="low">منخفضة</option>
                                                        <option value="medium">متوسطة</option>
                                                        <option value="high">عالية</option>
                                                        <option value="urgent">طوارئ</option>
                                                    </select>
                                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ البدء</label>
                                                <input
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                    className="w-full p-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات إضافية</label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                    className="w-full p-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    placeholder="أية ملاحظات خاصة..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleConfirmTreatment}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-100 py-3 text-lg font-bold rounded-xl transform transition-all hover:-translate-y-1"
                                    >
                                        <CheckCircle className="w-5 h-5 ml-2" />
                                        اعتماد وتوليد الخطط ({toothNumbers.length})
                                    </Button>

                                    <Button variant="ghost" onClick={() => setActiveTab('treatment')} className="w-full text-gray-500">
                                        العودة للاختيار
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
