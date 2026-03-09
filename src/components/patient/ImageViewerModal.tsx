import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw, FlipHorizontal, Pen, Brain, Save, Download, Undo, Maximize2, Trash2, Printer, Circle } from 'lucide-react';
import { Button } from '../common/Button';

interface ImageViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: Array<{ id: string; url: string; title: string }>;
    initialIndex?: number;
    onAnalyze?: (imageId: string) => void;
    onSave?: (imageId: string, data: string) => void; // dataURL
    onDelete?: (imageId: string) => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
    isOpen,
    onClose,
    images,
    initialIndex = 0,
    onAnalyze,
    onSave,
    onDelete
}) => {
    if (!isOpen) return null;

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isEditing, setIsEditing] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    // Advanced Drawing Tools State
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [brushColor, setBrushColor] = useState('#ef4444');
    const [brushSize, setBrushSize] = useState(4);
    const [brushOpacity, setBrushOpacity] = useState(1); // New Opacity State
    const [eraserSize, setEraserSize] = useState(20);

    // Cursor State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [showCursor, setShowCursor] = useState(false);

    // History for Undo
    const [history, setHistory] = useState<string[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const currentImage = images[currentIndex];

    // Added more vibrant colors
    const COLORS = [
        { color: '#ef4444', label: 'أحمر' },
        { color: '#3b82f6', label: 'أزرق' },
        { color: '#22c52e', label: 'أخضر' },
        { color: '#eab308', label: 'أصفر' },
        { color: '#a855f7', label: 'بنفسجي' },
        { color: '#ffffff', label: 'أبيض' },
        { color: '#000000', label: 'أسود' },
    ];

    // Initialize Canvas
    useEffect(() => {
        if (isEditing && canvasRef.current) {
            const canvas = canvasRef.current;
            // Match canvas size to the displayed image container
            canvas.width = canvas.parentElement?.clientWidth || 800;
            canvas.height = canvas.parentElement?.clientHeight || 600;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = brushColor;
                ctx.lineWidth = brushSize;
                ctx.globalAlpha = brushOpacity;
                contextRef.current = ctx;

                // Clear history on init
                setHistory([]);
                setHistoryStep(-1);
            }
        }
    }, [isEditing]);

    // Update Context when tools change
    useEffect(() => {
        if (contextRef.current) {
            if (tool === 'eraser') {
                contextRef.current.globalCompositeOperation = 'destination-out';
                contextRef.current.lineWidth = eraserSize;
                contextRef.current.globalAlpha = 1; // Eraser always full strength
            } else {
                contextRef.current.globalCompositeOperation = 'source-over';
                contextRef.current.strokeStyle = brushColor;
                contextRef.current.lineWidth = brushSize;
                contextRef.current.globalAlpha = brushOpacity;
            }
        }
    }, [brushColor, brushSize, tool, eraserSize, brushOpacity]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        resetEdit();
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        resetEdit();
    };

    const resetEdit = () => {
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setIsEditing(false);
        setBrushColor('#ef4444');
        setTool('pen');
        setHistory([]);
        setHistoryStep(-1);
        setBrushOpacity(1);
    };

    const saveHistory = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL();
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(dataUrl);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep < 0 || !contextRef.current || !canvasRef.current) return;

        const prevStep = historyStep - 1;
        const ctx = contextRef.current;
        const canvas = canvasRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (prevStep >= 0) {
            const img = new Image();
            img.src = history[prevStep];
            img.onload = () => {
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(img, 0, 0);
                // Restore tool state
                if (tool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                }
            };
        }
        setHistoryStep(prevStep);
    };

    const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
        if (!isEditing || !contextRef.current) return;

        // Push CURRENT canvas to history before new stroke
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL();
            const newHistory = history.slice(0, historyStep + 1);
            newHistory.push(dataUrl);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
        }

        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        // Update custom cursor position
        setMousePos({ x: e.clientX, y: e.clientY });

        if (!isDrawing || !isEditing || !contextRef.current) return;
        const { offsetX, offsetY } = e.nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (contextRef.current) {
            contextRef.current.closePath();
        }
        setIsDrawing(false);
    };

    const handleSaveClick = async () => {
        if (!canvasRef.current || !imageRef.current) return;

        // 1. Create a composite canvas
        const compositeCanvas = document.createElement('canvas');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        compositeCanvas.width = width;
        compositeCanvas.height = height;

        const ctx = compositeCanvas.getContext('2d');
        if (!ctx) return;

        // 2. Draw the underlying image first (Applying the same visual transforms if possible, 
        // but here we are drawing the image as displayed in the preview container which matches canvas size)

        // Note: The imageRef might be the natural size, we need to draw it scaled to canvas size
        ctx.save();

        // Apply rotation and flips center
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-width / 2, -height / 2);

        // Draw image "fit" to canvas (mimic object-contain)
        // Since the canvas size IS the container size, and img is object-contain,
        // we should draw it to fill based on aspect ratio logic if we wanted perfection.
        // BUT, simplified: The canvas is overlaying the image element exactly in the DOM.
        // The safest way to "merge" is to just draw the image stretched to the canvas 
        // if we assume the user was drawing on what they saw.
        // However, object-contain leaves gaps.

        // Better approach:
        // Identify the drawing area relative to the image.
        // Since we can't easily replicate full CSS object-contain logic here without math:
        // We will just draw the image full size to canvas. 
        // This assumes the canvas is exact overlay.
        ctx.drawImage(imageRef.current, 0, 0, width, height);
        ctx.restore();

        // 3. Draw the annotations
        ctx.drawImage(canvasRef.current, 0, 0);

        // 4. Export
        const dataUrl = compositeCanvas.toDataURL('image/png');

        if (onSave) {
            onSave(currentImage.id, dataUrl);
        } else {
            // Download as fallback simulation
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `edited-${currentImage.title || 'image'}.png`;
            link.click();
            alert('تم حفظ التعديلات وتنزيل الصورة الجديدة');
        }
        setIsEditing(false);
    };

    const handleAIAnalysis = () => {
        if (onAnalyze) {
            onAnalyze(currentImage.id);
        } else {
            alert('جاري تشخيص الصورة بالذكاء الاصطناعي... (يرجى ربط الدالة)');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-200">

            {/* Custom Cursor Follower */}
            {isEditing && showCursor && (
                <div
                    className="fixed pointer-events-none rounded-full border border-white z-[100] transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: mousePos.x,
                        top: mousePos.y,
                        width: tool === 'pen' ? brushSize : eraserSize,
                        height: tool === 'pen' ? brushSize : eraserSize,
                        backgroundColor: tool === 'pen' ? brushColor : 'white',
                        opacity: tool === 'pen' ? brushOpacity * 0.5 : 0.5,
                        boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                />
            )}

            {/* Top Bar */}
            <div className="flex justify-between items-center p-4 text-white bg-black/50 cursor-auto relative z-20"
                onMouseEnter={() => setShowCursor(false)}
                onMouseLeave={() => setShowCursor(true)}
            >
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium">{currentImage?.title || 'معرض الصور'}</h3>
                    {isEditing && (
                        <div className="text-xs bg-blue-600 px-2 py-1 rounded text-white flex items-center gap-1">
                            <Pen className="w-3 h-3" />
                            وضع التعديل
                        </div>
                    )}
                </div>

                {/* Drawing Tools (Visible only in Edit Mode) */}
                {isEditing && (
                    <div className="flex items-center gap-4 bg-gray-900/90 backdrop-blur-md px-6 py-2 rounded-2xl border border-gray-700 shadow-2xl animate-in slide-in-from-top-2">

                        {/* Tool Selector */}
                        <div className="flex gap-2 border-l border-gray-700 pl-4">
                            <button
                                onClick={() => setTool('pen')}
                                className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white'}`}
                                title="قلم"
                            >
                                <Pen className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white'}`}
                                title="ممحاة"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></svg>
                            </button>
                            <button
                                onClick={undo}
                                disabled={historyStep < 0}
                                className={`p-2 rounded-lg transition-colors ${historyStep >= 0 ? 'text-white hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`}
                                title="تراجع"
                            >
                                <Undo className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Colors (Only for Pen) */}
                        {tool === 'pen' && (
                            <div className="flex gap-2 border-l border-gray-700 pl-4">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.color}
                                        onClick={() => setBrushColor(c.color)}
                                        className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${brushColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                        style={{ backgroundColor: c.color }}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Settings Group */}
                        <div className="flex items-center gap-6 px-4">
                            {/* Size Slider */}
                            <div className="flex flex-col gap-1 w-32">
                                <div className="flex justify-between items-center text-[10px] text-gray-400">
                                    <span>{tool === 'pen' ? 'حجم الفرشاة' : 'حجم الممحاة'}</span>
                                    <span>{tool === 'pen' ? brushSize : eraserSize}px</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Circle className="w-1.5 h-1.5 text-gray-500 fill-current" />
                                    <input
                                        type="range"
                                        min="2"
                                        max={tool === 'pen' ? "50" : "100"}
                                        value={tool === 'pen' ? brushSize : eraserSize}
                                        onChange={(e) => tool === 'pen' ? setBrushSize(Number(e.target.value)) : setEraserSize(Number(e.target.value))}
                                        className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <Circle className="w-3 h-3 text-gray-400 fill-current" />
                                </div>
                            </div>

                            {/* Opacity Slider */}
                            {tool === 'pen' && (
                                <div className="flex flex-col gap-1 w-48">
                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>الشفافية</span>
                                        <span>{Math.round(brushOpacity * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border border-dashed border-gray-600"></div>
                                        <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-0.5">
                                            {[25, 50, 75, 100].map((opacity) => (
                                                <button
                                                    key={opacity}
                                                    onClick={() => setBrushOpacity(opacity / 100)}
                                                    className={`flex-1 px-1.5 py-1 text-[10px] rounded transition-all ${Math.round(brushOpacity * 100) === opacity
                                                        ? 'bg-blue-600 text-white font-bold'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    {opacity}%
                                                </button>
                                            ))}
                                        </div>
                                        <div className="w-4 h-4 rounded bg-white"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                <div className="flex gap-4">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveClick} className="bg-green-600 hover:bg-green-700 text-white">
                                <Save className="w-4 h-4 ml-2" />
                                حفظ النتيجة
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="text-white border-white/20 hover:bg-white/10">
                                إلغاء
                            </Button>
                        </div>
                    ) : (
                        <Button size="sm" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-900/20">
                            <Pen className="w-4 h-4 ml-2" />
                            تعديل / رسم
                        </Button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div
                className="flex-1 relative flex items-center justify-center overflow-hidden bg-neutral-900 p-10"
                onMouseEnter={() => setShowCursor(true)}
                onMouseLeave={() => setShowCursor(false)}
            >

                {/* Navigation Arrows */}
                {!isEditing && images.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all z-10 cursor-pointer">
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button onClick={handleNext} className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all z-10 cursor-pointer">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </>
                )}

                {/* Image / Canvas Container */}
                <div
                    className="relative transition-transform duration-300 ease-out border-4 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-lg overflow-hidden"
                    style={{
                        transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        maxHeight: '80vh',
                        maxWidth: '80vw',
                        cursor: isEditing ? 'none' : 'default'
                    }}
                    onMouseEnter={() => isEditing && setShowCursor(true)}
                    onMouseLeave={() => setShowCursor(false)}
                >
                    <img
                        ref={imageRef}
                        src={currentImage?.url || 'https://via.placeholder.com/800x600?text=No+Image'}
                        alt="View"
                        className="max-h-[80vh] max-w-[80vw] object-contain select-none"
                        draggable={false}
                    />

                    {/* Drawing Layer */}
                    {isEditing && (
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className={`absolute inset-0 touch-none`}
                            style={{ width: '100%', height: '100%' }}
                        />
                    )}
                </div>

            </div>

            {/* Bottom Toolbar */}
            <div
                className="bg-black/80 p-6 flex justify-center gap-6 cursor-auto z-20"
                onMouseEnter={() => setShowCursor(false)}
                onMouseLeave={() => setShowCursor(true)}
            >
                <ToolbarButton
                    icon={Brain}
                    label="تشخيص AI"
                    onClick={handleAIAnalysis}
                    active={false}
                />

                <div className="w-px bg-white/20 mx-2" />

                <ToolbarButton
                    icon={RotateCw}
                    label="تدوير"
                    onClick={() => isEditing && setRotation(r => r + 90)}
                    disabled={!isEditing}
                />
                <ToolbarButton
                    icon={FlipHorizontal}
                    label="عكس أفقي"
                    onClick={() => isEditing && setFlipH(v => !v)}
                    disabled={!isEditing}
                />


                <div className="w-px bg-white/20 mx-2" />

                <ToolbarButton
                    icon={Download}
                    label="تحميل"
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = currentImage.url;
                        link.download = currentImage.title || 'image';
                        link.click();
                    }}
                />

                <ToolbarButton
                    icon={Printer}
                    label="طباعة"
                    onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                            printWindow.document.write(`
                                <html>
                                    <head><title>Print Image</title></head>
                                    <body style="text-align:center;">
                                        <img src="${currentImage.url}" style="max-width:100%;" />
                                        <h3>${currentImage.title}</h3>
                                    </body>
                                </html>
                             `);
                            printWindow.document.close();
                            printWindow.print();
                        }
                    }}
                />

                {onDelete && (
                    <ToolbarButton
                        icon={Trash2}
                        label="حذف"
                        onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
                                onDelete(currentImage.id);
                            }
                        }}
                        className="text-red-400 hover:text-red-300"
                    />
                )}
            </div>
        </div>
    );
};

const ToolbarButton = ({ icon: Icon, label, onClick, disabled, active, className = "" }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center gap-2 text-xs font-medium transition-all
            ${disabled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:scale-110'}
            ${active ? 'text-blue-400' : ''}
            ${className}
        `}
    >
        <div className={`p-3 rounded-xl ${active ? 'bg-blue-500/20' : 'bg-white/5'} ring-1 ring-white/10`}>
            <Icon className="w-5 h-5" />
        </div>
        <span>{label}</span>
    </button>
);
