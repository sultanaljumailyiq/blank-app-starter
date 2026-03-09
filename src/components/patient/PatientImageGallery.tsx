import React, { useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, Printer, Download, CheckSquare, Square, X } from 'lucide-react';
import { Button } from '../common/Button';
import { ImageViewerModal } from './ImageViewerModal';

interface ImageFile {
    id: string;
    url: string;
    title: string;
    date: string;
}

interface PatientImageGalleryProps {
    images: ImageFile[];
    onAddImage: () => void;
    onAnalyze?: (imageId: string) => void;
    onDelete?: (imageId: string, e?: React.MouseEvent) => void;
}

export const PatientImageGallery: React.FC<PatientImageGalleryProps> = ({ images, onAddImage, onAnalyze, onDelete }) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleImageClick = (index: number) => {
        setSelectedIndex(index);
        setViewerOpen(true);
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === images.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(images.map(img => img.id));
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`هل أنت متأكد من حذف ${selectedIds.length} صور؟`)) {
            selectedIds.forEach(id => onDelete?.(id));
            setSelectedIds([]);
        }
    };

    const handleBulkPrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const selectedImages = images.filter(img => selectedIds.includes(img.id));
            const html = `
                <html>
                <head>
                    <title>طباعة الصور</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; direction: rtl; }
                        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                        .img-container { text-align: center; page-break-inside: avoid; border: 1px solid #ddd; padding: 10px; border-radius: 8px; }
                        img { max-width: 100%; max-height: 400px; object-fit: contain; }
                        h3 { margin: 10px 0 5px; }
                        p { margin: 0; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>تقرير الصور الطبية</h1>
                    <div class="grid">
                        ${selectedImages.map(img => `
                            <div class="img-container">
                                <img src="${img.url}" />
                                <h3>${img.title}</h3>
                                <p>${img.date}</p>
                            </div>
                        `).join('')}
                    </div>
                    <script>window.print();</script>
                </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header / Actions */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center justify-between text-indigo-900 bg-indigo-50 p-2 rounded-xl">
                        <div className="flex items-center gap-4 px-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                                <X className="w-5 h-5" />
                            </Button>
                            <span className="font-bold">تم تحديد {selectedIds.length}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleBulkPrint} className="bg-white hover:bg-indigo-100 border-indigo-200 text-indigo-700">
                                <Printer className="w-4 h-4 ml-2" />
                                طباعة
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white hover:bg-indigo-100 border-indigo-200 text-indigo-700">
                                <Download className="w-4 h-4 ml-2" />
                                تحميل
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="bg-white hover:bg-red-100 border-red-200 text-red-600"
                            >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف المحدد
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ImageIcon className="w-6 h-6 text-blue-600" />
                                معرض الصور
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                {images.length} صور محفوظة (أشعة، صور فوتوغرافية، مستندات مصورة)
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {images.length > 0 && (
                                <Button variant="outline" onClick={toggleSelectAll} className="text-gray-600">
                                    <CheckSquare className="w-4 h-4 ml-2" />
                                    تحديد الكل
                                </Button>
                            )}
                            <Button onClick={onAddImage} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                                <Plus className="w-5 h-5 ml-2" />
                                إضافة صورة
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => {
                    const isSelected = selectedIds.includes(image.id);
                    return (
                        <div
                            key={image.id}
                            className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                                }`}
                            onClick={() => handleImageClick(index)}
                        >
                            <img
                                src={image.url}
                                alt={image.title}
                                className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-95' : 'group-hover:scale-105'}`}
                            />

                            {/* Selection Checkbox */}
                            <div
                                className="absolute top-2 right-2 z-10"
                                onClick={(e) => toggleSelection(image.id, e)}
                            >
                                <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-white/80 hover:bg-white text-gray-500 hover:text-blue-500'
                                    }`}>
                                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                </div>
                            </div>

                            {/* Actions Overlay (Always visible on mobile, hover on desktop if not selected) */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 translate-y-0 transition-transform flex flex-col justify-end">
                                <p className="text-white font-bold text-sm truncate">{image.title}</p>
                                <div className="flex justify-between items-end mt-1">
                                    <p className="text-gray-300 text-xs">{image.date}</p>
                                    <div className="flex gap-2">
                                        {/* Permanent Delete Button as requested */}
                                        {onDelete && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(image.id, e);
                                                }}
                                                className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                                                title="حذف الصورة"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); /* Handle download mock */ }}
                                            className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition-colors"
                                            title="تحميل"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); /* Handle print mock */ }}
                                            className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition-colors"
                                            title="طباعة"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {images.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">لا توجد صور محفوظة</p>
                        <p className="text-sm text-gray-400">اضغط على "إضافة صورة" للبدء</p>
                    </div>
                )}
            </div>

            {/* Viewer Modal */}
            <ImageViewerModal
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                images={images}
                initialIndex={selectedIndex}
                onAnalyze={onAnalyze}
                onDelete={(id) => {
                    onDelete?.(id);
                    setViewerOpen(false);
                }}
            />
        </div>
    );
};
