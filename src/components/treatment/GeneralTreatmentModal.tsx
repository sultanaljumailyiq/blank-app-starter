import React, { useMemo } from 'react';
import { Modal } from '../common/Modal';
import { TreatmentAsset } from '../../data/mock/assets';
import { Card } from '../common/Card';
import { Clock, Stethoscope, ChevronRight, Activity, Zap, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/utils';
import { treatmentWorkflows } from '../../data/treatmentWorkflows';

interface GeneralTreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableTreatments: TreatmentAsset[];
    onSave: (data: any) => void;
}

export const GeneralTreatmentModal: React.FC<GeneralTreatmentModalProps> = ({
    isOpen,
    onClose,
    availableTreatments,
    onSave
}) => {

    // Filter for General or Both scopes
    const generalTreatments = useMemo(() => {
        return availableTreatments.filter(t => t.scope === 'general' || t.scope === 'both' || !t.scope);
    }, [availableTreatments]);

    // Group by category
    const groupedTreatments = useMemo(() => {
        const groups: Record<string, TreatmentAsset[]> = {};
        generalTreatments.forEach(t => {
            if (!groups[t.category]) groups[t.category] = [];
            groups[t.category].push(t);
        });
        return groups;
    }, [generalTreatments]);

    const handleSelectTreatment = (asset: TreatmentAsset) => {
        // Immediate Save Logic
        const workflowName = asset.name.split('(')[0].trim(); // Try to match by Arabic name
        const workflows = treatmentWorkflows as Record<string, any>;

        // Try exact match, then Arabic part match, then fallback
        const workflow = workflows[asset.name] ||
            workflows[workflowName] ||
            Object.values(workflows).find(w => w.type === 'general') || {
            type: 'general',
            requiresLab: false,
            defaultSessions: [{ title: 'جلسة علاج', duration: 30, schemaId: 'general' }]
        };

        const treatmentPlan = {
            assetId: asset.id,
            workflowType: workflow.type,
            name: asset.name,
            sessions: workflow.defaultSessions.map((s: any, idx: number) => ({
                title: s.title,
                duration: s.duration,
                schemaId: s.schemaId,
                status: 'pending'
            })),
            requiresLab: workflow.requiresLab || asset.isComplex
        };

        onSave({
            toothNumber: 0, // Always 0 for general
            condition: 'healthy', // No specific condition needed
            treatmentType: workflow.type,
            notes: asset.name,
            estimatedCost: asset.basePrice,
            startDate: new Date().toLocaleDateString('en-GB'),
            treatmentPlan: treatmentPlan
        });

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            contentClassName="p-0"
            title="إضافة علاج عام" // Optional, can be removed if header is custom
        >
            <div className="flex flex-col h-full bg-gray-50/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 flex justify-between items-center shadow-md z-10 sticky top-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Zap className="w-6 h-6" />
                            </div>
                            علاجات عامة وتقويم
                        </h2>
                        <p className="text-teal-100 opacity-90 mt-1 mr-14">اختر العلاج لإضافته مباشرة للخطة العلاجية</p>
                    </div>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
                    {Object.entries(groupedTreatments).map(([category, treatments]) => (
                        <div key={category}>
                            <h4 className="font-bold text-gray-700 mb-4 px-2 border-r-4 border-teal-500 bg-gray-100 py-1 rounded-l-md inline-block">
                                {category}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {treatments.map(asset => (
                                    <div
                                        key={asset.id}
                                        onClick={() => handleSelectTreatment(asset)}
                                        className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-white bg-white p-5 transition-all hover:shadow-lg hover:border-teal-200 hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600`}>
                                                {asset.category}
                                            </span>
                                            {asset.isComplex && (
                                                <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                                                    <Clock className="w-3 h-3" /> جلسات متعددة
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">{asset.name}</h4>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <span className="font-bold text-lg text-teal-600">{formatCurrency(asset.basePrice)}</span>
                                        </div>
                                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-teal-50 text-teal-600 p-1.5 rounded-full shadow-sm">
                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {generalTreatments.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">لا توجد علاجات عامة متاحة حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
