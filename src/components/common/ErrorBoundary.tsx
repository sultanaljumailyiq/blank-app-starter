import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            عذراً، حدث خطأ غير متوقع
                        </h1>

                        <p className="text-gray-500 mb-8">
                            نواجه مشكلة في عرض هذه الصفحة. تم تسجيل الخطأ وسنعمل على إصلاحه قريباً.
                        </p>

                        {this.state.error && process.env.NODE_ENV === 'development' && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left text-xs font-mono text-red-600 overflow-auto max-h-40 border border-gray-200" dir="ltr">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                إعادة تحميل الصفحة
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                العودة للرئيسية
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
