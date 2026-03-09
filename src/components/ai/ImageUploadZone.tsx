import React, { useRef, useState } from 'react';
import { Upload, FileUp, Loader2 } from 'lucide-react';

interface ImageUploadZoneProps {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onFileSelect, isUploading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSelect(e.target.files[0]);
        }
    };

    const validateAndSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG).');
            return;
        }
        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('File size too large. Max 5MB.');
            return;
        }
        onFileSelect(file);
    };

    return (
        <div
            className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    ${isUploading ? 'bg-primary/10' : 'bg-gray-100'}
                `}>
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8 text-gray-500" />
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">
                        {isUploading ? 'جاري رفع وتحليل الصورة...' : 'اضغط للرفع أو اسحب الصورة هنا'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        PNG, JPG up to 5MB
                    </p>
                </div>
            </div>
        </div>
    );
};
