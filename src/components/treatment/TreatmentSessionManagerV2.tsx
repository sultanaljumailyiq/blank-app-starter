import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, ChevronDown, ChevronUp, AlertCircle, Lock, Wand2, DollarSign, Plus, X } from 'lucide-react';
import { Button } from '../common/Button';
import { ClinicalSchemas, FormField } from '../../types/clinical-schemas';
import { TreatmentPlan, TreatmentSession } from '../../types/treatment';

interface TreatmentSessionManagerProps {
    plan: TreatmentPlan;
    onUpdateSession: (planId: string, sessionId: string, data: any) => void;
    onCompleteSession: (planId: string, sessionId: string, cost?: number) => void;
    onAddPayment?: (planId: string, sessionId: string, amount?: number) => void; // Updated signature
    isReadOnly?: boolean; // New prop
}

export const TreatmentSessionManager: React.FC<TreatmentSessionManagerProps> = ({
    plan,
    onUpdateSession,
    onCompleteSession,
    onAddPayment,
    isReadOnly = false // Default false
}) => {
    // Local state to manage immediate UI updates for responsiveness
    // We initialize this from the prop 'plan' initially
    const [localSessions, setLocalSessions] = useState<TreatmentSession[]>(plan.sessions || []);
    const [expandedSession, setExpandedSession] = useState<string | null>((plan.sessions || []).find(s => s.status === 'pending')?.id || null);

    // Payment Mode State
    const [paymentModes, setPaymentModes] = useState<Record<string, boolean>>({});
    const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
    const [lastPayments, setLastPayments] = useState<Record<string, number>>({});

    const togglePaymentMode = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPaymentModes(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
    };

    const handlePaymentSubmit = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const amount = parseFloat(paymentAmounts[sessionId] || '0');
        if (amount > 0 && onAddPayment) {
            onAddPayment(plan.id, sessionId, amount);
            setPaymentModes(prev => ({ ...prev, [sessionId]: false }));
            setPaymentAmounts(prev => ({ ...prev, [sessionId]: '' }));
            setLastPayments(prev => ({ ...prev, [sessionId]: amount }));
        }
    };

    // Sync local state when prop 'plan' changes, but preserve local inputs to prevent typing-lag overwrites
    useEffect(() => {
        setLocalSessions(prev => {
            if (prev.length === 0) return plan.sessions || []; // Initial load

            return (plan.sessions || []).map(serverSession => {
                const localSession = prev.find(l => l.id === serverSession.id);
                // If local session exists, keep its data (user edits), but accept server status/meta changes
                if (localSession) {
                    return {
                        ...serverSession,
                        data: localSession.data // PRESERVE LOCAL DATA
                    };
                }
                return serverSession;
            });
        });
    }, [plan.sessions]);

    const toggleSession = (sessionId: string) => {
        setExpandedSession(expandedSession === sessionId ? null : sessionId);
    };

    // --- Smart Sync Logic ---
    useEffect(() => {
        if (plan.type !== 'endo' || isReadOnly) return;

        const sessions = localSessions;
        const accessSession = sessions.find(s => s.schemaId === 'endo_access');
        const cleaningSession = sessions.find(s => s.schemaId === 'endo_cleaning');
        const fillSession = sessions.find(s => s.schemaId === 'endo_fill');

        let needsUpdate = false;
        let updatedSessions = [...sessions];

        // Sync: Access -> Cleaning
        if (accessSession?.data?.canals_data && cleaningSession && cleaningSession.status === 'pending') {
            const definedCanals = (accessSession.data.canals_data as any[]) || [];
            const currentPrepData = (cleaningSession.data?.canal_prep as any[]) || [];

            if (definedCanals.length > 0) {
                const newPrepData = [...currentPrepData];
                let changed = false;

                definedCanals.forEach(sourceCanal => {
                    const existingIndex = newPrepData.findIndex(p => p.name === sourceCanal.name);

                    if (existingIndex === -1) {
                        // Add new canal
                        newPrepData.push({
                            name: sourceCanal.name,
                            size: '',
                            taper: '04',
                            wl: sourceCanal.wl
                        });
                        changed = true;
                    } else {
                        // Update existing? Only if empty? 
                        // Let's perform a soft update: if WL is missing in target but present in source, update it.
                        // But generally, we just ensure it exists. 
                        // User likely wants WL to carry over if they haven't confirmed it yet.
                        if (!newPrepData[existingIndex].wl && sourceCanal.wl) {
                            newPrepData[existingIndex] = { ...newPrepData[existingIndex], wl: sourceCanal.wl };
                            changed = true;
                        }
                    }
                });

                if (changed) {
                    const cleaningIndex = updatedSessions.findIndex(s => s.id === cleaningSession.id);
                    updatedSessions[cleaningIndex] = {
                        ...cleaningSession,
                        data: { ...cleaningSession.data, canal_prep: newPrepData }
                    };
                    needsUpdate = true;
                }
            }
        }

        // Sync: Cleaning -> Filling (Chained: Use updatedSessions to get the latest Cleaning data)
        const updatedCleaningSession = updatedSessions.find(s => s.schemaId === 'endo_cleaning');

        if (updatedCleaningSession?.data?.canal_prep && fillSession && fillSession.status === 'pending') {
            const prepData = (updatedCleaningSession.data.canal_prep as any[]) || [];
            const currentFillData = (fillSession.data?.obturation_data as any[]) || [];

            if (prepData.length > 0) {
                const newFillData = [...currentFillData];
                let changed = false;

                prepData.forEach(sourceCanal => {
                    const existingIndex = newFillData.findIndex(p => p.name === sourceCanal.name);

                    if (existingIndex === -1) {
                        newFillData.push({
                            name: sourceCanal.name,
                            cone_size: sourceCanal.size,
                            length: sourceCanal.wl,
                            sealer: 'Resin'
                        });
                        changed = true;
                    } else {
                        // Update values if missing in target
                        let updated = false;
                        const target = { ...newFillData[existingIndex] }; // clone

                        if (!target.cone_size && sourceCanal.size) { target.cone_size = sourceCanal.size; updated = true; }
                        if (!target.length && sourceCanal.wl) { target.length = sourceCanal.wl; updated = true; }

                        if (updated) {
                            newFillData[existingIndex] = target;
                            changed = true;
                        }
                    }
                });

                if (changed) {
                    const fillIndex = updatedSessions.findIndex(s => s.id === fillSession.id);
                    updatedSessions[fillIndex] = {
                        ...fillSession,
                        data: { ...fillSession.data, obturation_data: newFillData }
                    };
                    needsUpdate = true;
                }
            }
        }

        if (needsUpdate) {
            setLocalSessions(updatedSessions);
            // We also persist these auto-changes to parent immediately so they aren't lost
            updatedSessions.forEach(session => {
                if (session.id === cleaningSession?.id || session.id === fillSession?.id) {
                    onUpdateSession(plan.id, session.id, session.data);
                }
            });
        }

    }, [plan.type, expandedSession, localSessions]); // Run when data changes too (Reactive Sync)


    // Handle local field change (Immediate UI update)
    const handleLocalChange = (sessionId: string, fieldId: string, value: any) => {
        if (isReadOnly) return;
        setLocalSessions(prev => prev.map(session => {
            if (session.id !== sessionId) return session;
            return {
                ...session,
                data: {
                    ...(session.data || {}),
                    [fieldId]: value
                }
            };
        }));
    };

    // Propagate changes to parent on Blur or specific events
    // For Selects/Toggles, we can do it immediately after local set
    const persistChange = (sessionId: string, fieldId: string, value: any) => {
        if (isReadOnly) return;
        // Get the *latest* data from localSessions state for this session might be tricky inside closure
        // So we construct data combining current (potentially stale in closure) with new value
        // Better approach: Find session in current localSessions
        const session = localSessions.find(s => s.id === sessionId);
        const currentData = session?.data || {};
        const newData = { ...currentData, [fieldId]: value };
        onUpdateSession(plan.id, sessionId, newData);
    };


    const renderField = (field: FormField, session: TreatmentSession) => {
        const value = session.data?.[field.id];
        const safeValue = value !== undefined ? value : (field.defaultValue !== undefined ? field.defaultValue : (field.type === 'table' ? [] : ''));

        // Conditional Rendering Logic
        if (field.visibleIf) {
            const dependentValue = session.data?.[field.visibleIf.fieldId];
            if (dependentValue !== field.visibleIf.value) {
                return null;
            }
        }

        switch (field.type) {
            case 'text':
            case 'number':
                return (
                    <div key={field.id}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={field.type}
                                disabled={isReadOnly}
                                className={`w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                placeholder={field.placeholder}
                                value={safeValue}
                                onChange={(e) => handleLocalChange(session.id, field.id, e.target.value)}
                                onBlur={(e) => persistChange(session.id, field.id, e.target.value)}
                            />
                            {field.unit && (
                                <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-medium bg-gray-50 px-1 rounded">
                                    {field.unit}
                                </span>
                            )}
                        </div>
                    </div>
                );
            case 'select':
                return (
                    <div key={field.id}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            disabled={isReadOnly}
                            className={`w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            value={safeValue}
                            onChange={(e) => {
                                handleLocalChange(session.id, field.id, e.target.value);
                                persistChange(session.id, field.id, e.target.value);
                            }}
                        >
                            <option value="">-- اختر --</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'boolean':
                return (
                    <div key={field.id} className="flex items-center gap-2 mt-6 bg-white p-2 border rounded-lg">
                        <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={!!safeValue}
                            onChange={(e) => {
                                handleLocalChange(session.id, field.id, e.target.checked);
                                persistChange(session.id, field.id, e.target.checked);
                            }}
                            className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        <label className="text-sm font-medium text-gray-700 select-none">
                            {field.label}
                        </label>
                    </div>
                );
            case 'table':
                const columns = field.columns || [];
                const rows = Array.isArray(safeValue) ? safeValue : [];

                const updateRow = (rowIndex: number, colId: string, val: any) => {
                    const newRows = rows.map((r: any, i: number) => i === rowIndex ? { ...r, [colId]: val } : r);
                    handleLocalChange(session.id, field.id, newRows);
                    // For tables, we might want to defer saving until 'onBlur' of inputs or explicit save, 
                    // but for select/dropdowns inside table we save immediately
                    // To be safe and simple: save immediately for now
                    persistChange(session.id, field.id, newRows);
                };

                const addRow = () => {
                    if (isReadOnly) return;
                    const newRow: any = {};
                    columns.forEach(col => newRow[col.id] = col.type === 'number' ? 0 : '');
                    const newRows = [...rows, newRow];
                    handleLocalChange(session.id, field.id, newRows);
                    persistChange(session.id, field.id, newRows);
                };

                const removeRow = (rowIndex: number) => {
                    if (isReadOnly) return;
                    const newRows = rows.filter((_: any, i: number) => i !== rowIndex);
                    handleLocalChange(session.id, field.id, newRows);
                    persistChange(session.id, field.id, newRows);
                };

                return (
                    <div key={field.id} className="col-span-1 md:col-span-2 mt-2">
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold text-gray-700">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {rows.length > 0 && field.id !== 'canals_data' && (
                                <span className="text-[10px] text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                                    <Wand2 className="w-3 h-3" /> تمت المزامنة تلقائياً
                                </span>
                            )}
                        </div>

                        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            {columns.map(col => (
                                                <th key={col.id} className="px-4 py-2 font-medium text-gray-500 whitespace-nowrap">{col.label}</th>
                                            ))}
                                            {!isReadOnly && <th className="w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {rows.length === 0 && (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="p-4 text-center text-gray-400 text-xs">
                                                    لا توجد بيانات. {isReadOnly ? '' : 'اضغط على "إضافة" للبدء.'}
                                                </td>
                                            </tr>
                                        )}
                                        {rows.map((row: any, rowIndex: number) => (
                                            <tr key={rowIndex} className="group hover:bg-gray-50">
                                                {columns.map(col => (
                                                    <td key={col.id} className="p-2 min-w-[80px]">
                                                        {col.type === 'select' ? (
                                                            <select
                                                                disabled={isReadOnly}
                                                                className={`w-full p-1.5 border border-gray-200 rounded text-sm bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none ${isReadOnly ? 'cursor-not-allowed opacity-75' : ''}`}
                                                                value={row[col.id] || ''}
                                                                onChange={(e) => updateRow(rowIndex, col.id, e.target.value)}
                                                            >
                                                                <option value="">--</option>
                                                                {col.options?.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type={col.type}
                                                                disabled={isReadOnly}
                                                                className={`w-full p-1.5 border border-gray-200 rounded text-sm bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none ${isReadOnly ? 'cursor-not-allowed opacity-75' : ''}`}
                                                                value={row[col.id]}
                                                                placeholder="-"
                                                                onChange={(e) => updateRow(rowIndex, col.id, e.target.value)}
                                                            />
                                                        )}
                                                    </td>
                                                ))}
                                                {!isReadOnly && (
                                                    <td className="p-2 text-center">
                                                        <button
                                                            onClick={() => removeRow(rowIndex)}
                                                            className="text-red-400 hover:text-red-600 transition-opacity p-1"
                                                        >
                                                            <CheckCircle className="w-4 h-4 rotate-45" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!isReadOnly && (
                                <div className="p-2 border-t bg-gray-50">
                                    <button
                                        onClick={addRow}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    >
                                        <ChevronDown className="w-3 h-3" /> إضافة صف جديد
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderDynamicForm = (session: TreatmentSession) => {
        if (!session.schemaId || !ClinicalSchemas[session.schemaId]) {
            return (
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    لا يوجد نموذج بيانات محدد لهذه الجلسة. يمكنك إضافة ملاحظات عامة.
                </div>
            );
        }

        const schema = ClinicalSchemas[session.schemaId];

        return (
            <div className="mt-4 bg-gray-50/80 p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {schema.title}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schema.fields.map(field => renderField(field, session))}
                </div>
            </div>
        );
    };

    if (!localSessions || localSessions.length === 0) {
        return <div className="p-4 text-center text-gray-500">لا توجد جلسات لعرضها</div>;
    }

    return (
        <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-[1.15rem] before:w-0.5 before:bg-gray-200 before:z-0">
            {localSessions.map((session, index) => {
                const isCompleted = session.status === 'completed';
                const isNext = session.status === 'pending' && (index === 0 || localSessions[index - 1].status === 'completed');

                // Logic for "Locked" vs "Disabled Interaction"
                // isLocked usually means "User cannot get here yet because previous steps aren't done"
                // But in ReadOnly mode (Archived), we want to see everything, but not edit.
                const isSequenceLocked = session.status === 'pending' && !isNext;
                const isLocked = isSequenceLocked && !isReadOnly; // If ReadOnly, we ignore sequence lock for viewing

                return (
                    <div
                        key={session.id}
                        className={`relative z-10 transition-all duration-300 ${isLocked ? 'opacity-60 grayscale' : ''}`}
                    >
                        <div
                            className={`border rounded-xl overflow-hidden transition-all duration-300 bg-white ${isCompleted ? 'border-green-200 shadow-sm' :
                                isNext ? 'border-blue-400 ring-4 ring-blue-50 shadow-md transform scale-[1.01]' :
                                    'border-gray-200'
                                }`}
                        >
                            {/* Header */}
                            <div
                                className={`p-4 flex items-center justify-between cursor-pointer select-none ${isCompleted ? 'bg-green-50/50' :
                                    isNext ? 'bg-blue-50/30' :
                                        'bg-white'
                                    }`}
                                onClick={() => !isLocked && toggleSession(session.id)}
                            >
                                {/* Left Side: Icon + Title */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border-2 ${isCompleted ? 'bg-green-500 border-green-600 text-white' :
                                        isNext ? 'bg-blue-500 border-blue-600 text-white animate-pulse' :
                                            'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-bold text-base ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                                                {session.title}
                                            </h4>
                                            {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                                        </div>
                                        {isCompleted && <span className="text-green-600 font-bold">تم الإكمال</span>}
                                    </div>
                                </div>

                                {/* Right Side: Actions + Chevron */}
                                <div className="flex items-center gap-3">
                                    {/* Payment Button Moved to Body */}

                                    {!isLocked && (
                                        <div className={`transition-transform duration-300 ${expandedSession === session.id ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            {expandedSession === session.id && !isLocked && (
                                <div className="px-4 pb-5 pt-2 animate-in slide-in-from-top-2 border-t border-gray-100">
                                    {renderDynamicForm(session)}

                                    {!isCompleted && !isReadOnly && (
                                        <div className="mt-6 flex justify-end gap-3">
                                            <Button
                                                variant='outline'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Force save logic here if needed, though we reactively save now
                                                }}
                                            >
                                                حفظ مؤقت
                                            </Button>

                                            {/* Payment Button / Input Area */}
                                            {onAddPayment && (
                                                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                                                    {paymentModes[session.id] ? (
                                                        <div className="flex items-center gap-2 animate-in slide-in-from-right-5 fade-in">
                                                            <div className="relative w-24">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                                                    placeholder="المبلغ..."
                                                                    value={paymentAmounts[session.id] || ''}
                                                                    onChange={e => setPaymentAmounts(prev => ({ ...prev, [session.id]: e.target.value }))}
                                                                    onClick={e => e.stopPropagation()}
                                                                    autoFocus
                                                                />
                                                                <span className="absolute left-1 top-1.5 text-[10px] text-gray-400">د.ع</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-green-200 text-green-700 hover:bg-green-50 px-3"
                                                                disabled={!paymentAmounts[session.id] || parseFloat(paymentAmounts[session.id]) <= 0}
                                                                onClick={(e) => handlePaymentSubmit(session.id, e)}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => togglePaymentMode(session.id, e)}
                                                                className="text-gray-400 hover:text-red-500 p-1 h-auto"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={(e) => togglePaymentMode(session.id, e)}
                                                            className={`border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 ${lastPayments[session.id] ? 'bg-green-50 border-green-300 font-bold' : ''}`}
                                                        >
                                                            {lastPayments[session.id] ? (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                                                                    دفعة: {lastPayments[session.id].toLocaleString()}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DollarSign className="w-4 h-4 ml-2" />
                                                                    تسجيل دفعة
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const estimatedSessionCost = 50000;
                                                    onCompleteSession(plan.id, session.id, estimatedSessionCost);
                                                }}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 px-8 py-2.5 h-auto text-sm font-bold rounded-lg transform hover:-translate-y-0.5 transition-all"
                                            >
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                إكمال الجلسة وتوثيق البيانات
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            {/* End of sessions list */}
        </div >
    );
};
