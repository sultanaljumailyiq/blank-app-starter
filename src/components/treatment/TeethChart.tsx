import React from 'react';
import { ToothCondition } from '../../types/treatment';
import { Check, MousePointerClick } from 'lucide-react';
import { Button } from '../common/Button';

interface TeethChartProps {
    teeth: ToothCondition[];
    onToothClick: (tooth: ToothCondition) => void;
    // New Multi-Select Props
    isSelectionMode?: boolean;
    selectedTeethNumbers?: number[];
    onSelectionChange?: (toothNumbers: number[]) => void;
    onSelectionComplete?: () => void;
    onCancelSelection?: () => void;
    onEnableSelection?: () => void;
}

export const TeethChart: React.FC<TeethChartProps> = ({
    teeth,
    onToothClick,
    isSelectionMode = false,
    selectedTeethNumbers = [],
    onSelectionChange,
    onSelectionComplete,
    onCancelSelection,
    onEnableSelection
}) => {

    const toggleToothSelection = (toothNumber: number) => {
        if (!onSelectionChange) return;
        if (selectedTeethNumbers.includes(toothNumber)) {
            onSelectionChange(selectedTeethNumbers.filter(n => n !== toothNumber));
        } else {
            onSelectionChange([...selectedTeethNumbers, toothNumber]);
        }
    };

    const handleToothInteraction = (tooth: ToothCondition) => {
        if (isSelectionMode) {
            toggleToothSelection(tooth.number);
        } else {
            onToothClick(tooth);
        }
    };

    // SVG Paths for reusable shapes
    const ToothShape = () => (
        <path d="M10,2 C5,2 2,5 2,10 L2,25 C2,35 8,40 10,40 C12,40 18,35 18,25 L18,10 C18,5 15,2 10,2 Z" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
    );

    const RootShape = () => (
        <path d="M5,25 L5,45 C5,48 8,50 10,50 C12,50 15,48 15,45 L15,25" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
    );

    const renderToothInfo = (tooth: ToothCondition) => {
        const isSelected = selectedTeethNumbers.includes(tooth.number);
        const condition = tooth.condition;

        return (
            <button
                key={tooth.number}
                onClick={() => handleToothInteraction(tooth)}
                className={`relative group flex flex-col items-center p-1 transition-all duration-200 outline-none
                    ${condition === 'missing' ? 'opacity-40 grayscale' : 'hover:-translate-y-1 hover:drop-shadow-md'}
                    ${isSelectionMode && isSelected ? 'scale-110 drop-shadow-xl z-10' : ''}`}
            >
                <div className={`relative w-12 h-16 flex items-center justify-center rounded-xl transition-all ${isSelectionMode && isSelected ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''}`}>

                    <svg viewBox="0 0 20 52" className="w-full h-full overflow-visible drop-shadow-sm">
                        {/* Roots (simplified) */}
                        <RootShape />

                        {/* Crown Body */}
                        <ToothShape />

                        {/* Condition Overlays */}
                        {condition === 'decayed' && (
                            <circle cx="10" cy="12" r="3" fill="#ef4444" opacity="0.8" />
                        )}

                        {condition === 'filled' && (
                            <path d="M6,8 Q10,12 14,8 L14,14 Q10,18 6,14 Z" fill="#3b82f6" opacity="0.7" />
                        )}

                        {condition === 'endo' && (
                            <g stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round">
                                <line x1="10" y1="10" x2="10" y2="45" strokeDasharray="1 1" />
                                <circle cx="10" cy="8" r="1.5" fill="#9333ea" />
                            </g>
                        )}

                        {condition === 'implant' && (
                            <g>
                                {/* Screw Thread Visual */}
                                <path d="M7,28 L13,30 M7,32 L13,34 M7,36 L13,38 M7,40 L13,42" stroke="#6b7280" strokeWidth="1.5" />
                                <rect x="8.5" y="25" width="3" height="22" rx="1" fill="#9ca3af" />
                                {/* Abutment */}
                                <rect x="7" y="20" width="6" height="4" fill="#6b7280" />
                            </g>
                        )}

                        {condition === 'crown' && (
                            <path d="M2,10 L2,2 Q10,-2 18,2 L18,10 Q10,14 2,10 Z" fill="none" stroke="#ca8a04" strokeWidth="2" /> // Gold border
                        )}
                    </svg>

                    {/* Badge for Condition */}
                    {condition !== 'healthy' && !isSelected && (
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${condition === 'decayed' ? 'bg-red-500' :
                            condition === 'missing' ? 'bg-gray-400' :
                                condition === 'filled' ? 'bg-blue-500' :
                                    condition === 'endo' ? 'bg-purple-500' :
                                        condition === 'implant' ? 'bg-gray-600' :
                                            condition === 'crown' ? 'bg-yellow-500' : 'bg-gray-200'
                            }`}></div>
                    )}

                    {/* Selected Checkmark Badge */}
                    {isSelectionMode && isSelected && (
                        <div className="absolute -top-2 -right-2 bg-indigo-600 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm z-20">
                            <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                    )}
                </div>
                <span className={`text-xs font-bold mt-1 font-mono transition-colors group-hover:text-blue-600 ${isSelected ? 'text-indigo-700' : 'text-gray-500'}`}>{tooth.number}</span>
            </button>
        );
    };

    // Upper Jaw: 18-11 (Right), 21-28 (Left)
    const upperRight = teeth.filter(t => t.number >= 11 && t.number <= 18).sort((a, b) => b.number - a.number);
    const upperLeft = teeth.filter(t => t.number >= 21 && t.number <= 28).sort((a, b) => a.number - b.number);

    // Lower Jaw: 48-41 (Right), 31-38 (Left)
    const lowerRight = teeth.filter(t => t.number >= 41 && t.number <= 48).sort((a, b) => b.number - a.number);
    const lowerLeft = teeth.filter(t => t.number >= 31 && t.number <= 38).sort((a, b) => a.number - b.number);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 relative">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    مخطط الأسنان التفاعلي
                </h3>

                <div className="flex items-center gap-3">
                    {/* Multi-Selection Controls */}
                    {isSelectionMode ? (
                        <div className="flex items-center gap-2 bg-indigo-50 py-1.5 px-3 rounded-lg border border-indigo-100 animate-in fade-in">
                            <span className="text-sm font-bold text-indigo-700">{selectedTeethNumbers.length} محدد</span>
                            <div className="w-px h-5 bg-indigo-200 mx-1"></div>
                            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700 h-8 px-3" onClick={onCancelSelection}>
                                إلغاء التحديد
                            </Button>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-8 px-4" onClick={onSelectionComplete} disabled={selectedTeethNumbers.length === 0}>
                                إكمال
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 flex items-center gap-2"
                            onClick={onEnableSelection}
                        >
                            <MousePointerClick className="w-4 h-4" />
                            تحديد
                        </Button>
                    )}

                    <div className="flex gap-2 text-xs mr-2 hidden md:flex">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">FDI System</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">Permanent</span>
                    </div>
                </div>
            </div>

            <div className={`flex flex-col items-center gap-8 transition-opacity duration-300 ${isSelectionMode ? 'bg-slate-50/50 p-4 rounded-xl ring-1 ring-slate-100 ring-inset' : ''}`}>
                {/* Upper Jaw */}
                <div className="flex justify-center gap-1 md:gap-4 pb-6 border-b border-dashed border-gray-200 w-full overflow-x-auto">
                    <div className="flex gap-1 md:gap-2">{upperRight.map(renderToothInfo)}</div>
                    <div className="w-px bg-gray-300 h-12 self-center mx-2 md:mx-6 opacity-30"></div>
                    <div className="flex gap-1 md:gap-2">{upperLeft.map(renderToothInfo)}</div>
                </div>

                {/* Lower Jaw */}
                <div className="flex justify-center gap-1 md:gap-4 w-full overflow-x-auto">
                    <div className="flex gap-1 md:gap-2">{lowerRight.map(renderToothInfo)}</div>
                    <div className="w-px bg-gray-300 h-12 self-center mx-2 md:mx-6 opacity-30"></div>
                    <div className="flex gap-1 md:gap-2">{lowerLeft.map(renderToothInfo)}</div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-4 border-t border-gray-100 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> سليم</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-400 rounded-sm relative"><div className="absolute inset-0 bg-red-500 rounded-full scale-50"></div></div> تسوس</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded-sm"></div> حشوة</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-100 border border-purple-400 rounded-sm"></div> عصب</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-50 border border-yellow-400 rounded-sm"></div> تلبيس</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded-sm"></div> زرعة</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-50 border border-dashed border-gray-300 rounded-sm opacity-50"></div> مفقود</div>
            </div>
        </div>
    );
};
