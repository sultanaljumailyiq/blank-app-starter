import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, FlipHorizontal, Save, Undo, Brush, Eraser } from 'lucide-react';
import { Button } from './Button';

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (newUrl: string) => void;
    onSaveCopy?: (newUrl: string) => void;
}

interface Point {
    x: number;
    y: number;
}

interface DrawPath {
    points: Point[];
    color: string;
    size: number;
    opacity: number;
    tool: 'brush' | 'eraser';
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, imageUrl, onSave, onSaveCopy }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Image State
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Drawing State (Committed Paths)
    const [paths, setPaths] = useState<DrawPath[]>([]);

    // Active Drawing State (Refs for performance)
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<Point[]>([]);

    // Tool State
    const [currentType, setCurrentType] = useState<'brush' | 'eraser'>('brush');
    const [brushSize, setBrushSize] = useState(5);
    const [brushOpacity, setBrushOpacity] = useState(100);
    const [brushColor, setBrushColor] = useState('#ef4444');

    // Cursor State
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [showCursor, setShowCursor] = useState(false);

    useEffect(() => {
        if (isOpen && imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;
            img.onload = () => setImage(img);
        }
    }, [isOpen, imageUrl]);

    // Re-render when content changes (Undo, Load, Transform)
    useEffect(() => {
        drawEverything();
    }, [image, rotation, flipH, flipV, paths]);

    const getTransformedPoint = (clientX: number, clientY: number) => {
        if (!canvasRef.current || !image) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Canvas / Image scaling factor
        // The canvas resolution equals image resolution.
        // The display size is `rect.width` x `rect.height`.
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Mouse relative to canvas top-left visually
        const xVisual = (clientX - rect.left) * scaleX;
        const yVisual = (clientY - rect.top) * scaleY;

        // Visual Center
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const dx = xVisual - cx;
        const dy = yVisual - cy;

        // Inverse Transform Logic
        // 1. Un-Scale
        const sx = flipH ? -1 : 1;
        const sy = flipV ? -1 : 1;
        const tx = dx / sx;
        const ty = dy / sy;

        // 2. Un-Rotate
        const rad = (-rotation * Math.PI) / 180;
        const rx = tx * Math.cos(rad) - ty * Math.sin(rad);
        const ry = tx * Math.sin(rad) + ty * Math.cos(rad);

        // 3. Un-Translate (Active Image coordinates center = 0,0 locally after shifting)
        // Image Top-Left relative to center is -w/2, -h/2
        // We want 0..Width coordinates.
        return {
            x: rx + image.width / 2,
            y: ry + image.height / 2
        };
    };

    const drawEverything = (activePoints?: Point[]) => {
        if (!image || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Maintain Dimensions
        if (rotation % 180 !== 0) {
            canvas.width = image.height;
            canvas.height = image.width;
        } else {
            canvas.width = image.width;
            canvas.height = image.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Create Temp Canvas for "Un-transformed" Image + Strokes
        // We compose everything in "Image Space" first, then draw that to result canvas with transforms?
        // Actually, previous method was fine: Transform context -> Draw Image -> Draw Strokes.
        // Strokes share Image Space coordinate system.

        ctx.save();

        // Transform Context to Image Space
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-image.width / 2, -image.height / 2);

        // Draw Image
        ctx.drawImage(image, 0, 0);

        // Draw Committed Paths
        // Optimization: For eraser, we really need a separate layer approach if we want to "erase ink only".
        // Simpler for now: 'eraser' just draws on top with destination-out? 
        // destination-out will execute against the Image too if on same canvas.
        // To fix eraser: Draw all INK to a separate canvas first, then composite.

        if (paths.length > 0 || activePoints) {
            const inkCanvas = document.createElement('canvas'); // Optimization: Could cache this
            inkCanvas.width = image.width;
            inkCanvas.height = image.height;
            const inkCtx = inkCanvas.getContext('2d');

            if (inkCtx) {
                inkCtx.lineCap = 'round';
                inkCtx.lineJoin = 'round';

                // Helper to draw a path
                const drawPath = (pts: Point[], color: string, size: number, opacity: number, tool: 'brush' | 'eraser') => {
                    if (pts.length < 1) return;
                    inkCtx.beginPath();
                    inkCtx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++) {
                        // Simple smoothing could go here
                        inkCtx.lineTo(pts[i].x, pts[i].y);
                    }
                    inkCtx.lineWidth = size;

                    if (tool === 'eraser') {
                        inkCtx.globalCompositeOperation = 'destination-out';
                        inkCtx.strokeStyle = 'rgba(0,0,0,1)';
                        inkCtx.globalAlpha = 1;
                    } else {
                        inkCtx.globalCompositeOperation = 'source-over';
                        inkCtx.strokeStyle = color;
                        inkCtx.globalAlpha = opacity / 100;
                    }
                    inkCtx.stroke();
                };

                // Committed
                paths.forEach(p => drawPath(p.points, p.color, p.size, p.opacity, p.tool));

                // Active
                if (activePoints) {
                    drawPath(activePoints, brushColor, brushSize, brushOpacity, currentType);
                }

                // Composite Ink Layer
                ctx.drawImage(inkCanvas, 0, 0);
            }
        }

        ctx.restore();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!image) return;
        isDrawingRef.current = true;

        const p = getTransformedPoint(e.clientX, e.clientY);
        currentPathRef.current = [p];

        // Initial Draw
        drawEverything(currentPathRef.current);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Cursor Update (Global)
        setCursorPos({ x: e.clientX, y: e.clientY });

        if (!isDrawingRef.current || !image) return;

        // Thin out points? Or just push.
        const p = getTransformedPoint(e.clientX, e.clientY);
        currentPathRef.current.push(p);

        // Imperative Draw (Fast)
        requestAnimationFrame(() => {
            drawEverything(currentPathRef.current);
        });
    };

    const handleMouseUp = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;

        const newPath: DrawPath = {
            points: [...currentPathRef.current],
            color: brushColor,
            size: brushSize,
            opacity: brushOpacity,
            tool: currentType
        };

        setPaths(prev => [...prev, newPath]);
        currentPathRef.current = [];
    };

    const handleUndo = () => {
        setPaths(prev => prev.slice(0, -1));
    };

    const handleSave = () => {
        if (canvasRef.current) {
            const newUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
            onSave(newUrl);
            onClose();
        }
    };

    const handleSaveCopy = () => {
        if (canvasRef.current && onSaveCopy) {
            const newUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
            onSaveCopy(newUrl);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/95 z-[200] flex flex-col animate-in fade-in"
            onMouseMove={(e) => {
                setCursorPos({ x: e.clientX, y: e.clientY });
            }}
        >
            {/* Header */}
            <div className="bg-black/50 p-4 flex justify-between items-center backdrop-blur-sm border-b border-white/10 relative z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Brush className="w-5 h-5 text-blue-400" />
                    تعديل ورسم
                </h3>
                <div className="flex gap-2">
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleUndo} disabled={paths.length === 0}>
                        <Undo className="w-4 h-4 ml-2" />
                        تراجع
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Main Board */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden flex items-center justify-center p-8 bg-[#1a1a1a] relative cursor-none"
                onMouseEnter={() => setShowCursor(true)}
                onMouseLeave={() => setShowCursor(false)}
            >
                <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    onMouseDown={handleMouseDown}
                    // attached to container or window better? Canvas is fine if we handle mouseleave
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />

                {/* Fixed Cursor */}
                {showCursor && (
                    <div
                        className="fixed pointer-events-none border-2 border-white rounded-full mix-blend-difference shadow-[0_0_2px_rgba(0,0,0,0.5)] z-50"
                        style={{
                            left: cursorPos.x,
                            top: cursorPos.y,
                            width: brushSize * (image ? (canvasRef.current?.offsetWidth || 1) / image.width * 2 : 1), // Approximate visual scale
                            height: brushSize * (image ? (canvasRef.current?.offsetHeight || 1) / image.height * 2 : 1),
                            transform: 'translate(-50%, -50%)',
                            borderColor: currentType === 'eraser' ? '#fff' : brushColor
                        }}
                    />
                )}
            </div>

            {/* Tools Footer */}
            <div className="bg-gray-900 border-t border-gray-800 p-4 relative z-10">
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setCurrentType('brush')}
                                className={`p-3 rounded-md transition-colors ${currentType === 'brush' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="فرشاة"
                            >
                                <Brush className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentType('eraser')}
                                className={`p-3 rounded-md transition-colors ${currentType === 'eraser' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="ممحاة"
                            >
                                <Eraser className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-700"></div>

                        {currentType === 'brush' && (
                            <div className="flex gap-2">
                                {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setBrushColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${brushColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="h-8 w-px bg-gray-700"></div>

                        <div className="flex gap-2">
                            <button onClick={() => setRotation(r => r + 90)} className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors" title="تدوير">
                                <RotateCw className="w-5 h-5" />
                            </button>
                            <button onClick={() => setFlipH(f => !f)} className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors" title="عكس">
                                <FlipHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 max-w-2xl mx-auto w-full px-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>حجم الفرشاة</span>
                                <span>{brushSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="1" max="50"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>الشفافية</span>
                                <span>{brushOpacity}%</span>
                            </div>
                            <input
                                type="range"
                                min="10" max="100"
                                value={brushOpacity}
                                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center mt-2">
                        <div className="flex gap-2">
                            {onSaveCopy && (
                                <Button onClick={handleSaveCopy} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-900/20">
                                    <Save className="w-4 h-4 ml-2" />
                                    حفظ نسخة
                                </Button>
                            )}
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] shadow-lg shadow-blue-900/20">
                                <Save className="w-4 h-4 ml-2" />
                                حفظ
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
