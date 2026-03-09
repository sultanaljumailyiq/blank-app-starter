import React, { useState } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Button } from './Button';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        name: string;
        url?: string;
        type: string;
    } | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, file }) => {
    if (!isOpen || !file || !file.url) return null;

    const isImage = file.type === 'xray' || file.name.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPDF = file.name.endsWith('.pdf') || file.type === 'report';

    return (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-gray-900 truncate flex-1">{file.name}</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(file.url, '_blank')}>
                            <ExternalLink className="w-4 h-4 ml-2" />
                            فتح في نافذة جديدة
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-4 relative">
                    {isImage ? (
                        <img src={file.url} className="max-w-full max-h-full rounded shadow-lg object-contain" />
                    ) : isPDF ? (
                        <iframe src={file.url} className="w-full h-full rounded shadow-sm bg-white" title={file.name} />
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-gray-500 mb-4">لا يمكن معاينة هذا الملف مباشرة</p>
                            <Button onClick={() => window.open(file.url, '_blank')}>
                                <Download className="w-4 h-4 ml-2" />
                                تحميل الملف
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
