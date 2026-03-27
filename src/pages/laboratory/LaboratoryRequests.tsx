import React from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Phone, User, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLabRequests } from '../../hooks/useLabRequests';
import { formatDate } from '../../lib/utils';

export const LaboratoryRequests: React.FC = () => {
  const { requests, loading, updateRequestStatus, refresh } = useLabRequests();

  if (loading && requests.length === 0) return <div className="p-8 text-center text-gray-500">جاري تحميل الطلبات الخاصة...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">طلبات الاستفسار والخدمات الخاصة</h1>
        <p className="text-gray-600 mt-1">إدارة استفسارات الأطباء والطلبات غير القياسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{request.doctorName}</h3>
                    <p className="text-xs text-gray-500">{request.clinicName}</p>
                  </div>
                </div>
                {request.urgency === 'urgent' && (
                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    عاجل
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{request.type}</h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                  {request.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(request.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {request.contactPhone}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {request.status === 'pending' ? (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'accepted')}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      قبول
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                      size="sm"
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض
                    </Button>
                  </>
                ) : (
                  <div className={`w-full text-center py-2 rounded-lg text-sm font-bold ${request.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {request.status === 'accepted' ? 'تم القبول' : 'مرفوض'}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا توجد طلبات جديدة حالياً</p>
          <Button variant="outline" className="mt-4" onClick={refresh}>تحديث</Button>
        </div>
      )}
    </div>
  );
};
