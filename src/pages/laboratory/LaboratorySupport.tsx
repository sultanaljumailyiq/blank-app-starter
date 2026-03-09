import React, { useState } from 'react';
import { HelpCircle, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLabSupport } from '../../hooks/useLabSupport';

export const LaboratorySupport: React.FC = () => {
  const { tickets, loading, createTicket } = useLabSupport();
  const [showForm, setShowForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'technical', priority: 'normal' as const });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket(newTicket);
    setShowForm(false);
    setNewTicket({ subject: '', category: 'technical', priority: 'normal' });
  };

  if (loading && tickets.length === 0) return <div className="p-8 text-center text-gray-500">جاري تحميل التذاكر...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الدعم والمساعدة</h1>
          <p className="text-gray-600 mt-1">فريق الدعم موجود لمساعدتك في حل أي مشكلة</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 ml-2" />
          تذكرة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FileText className="w-5 h-5" /></div>
            <h3 className="font-bold text-blue-900">تذاكر مفتوحة</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{tickets.filter(t => t.status === 'open').length}</p>
        </Card>
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><Clock className="w-5 h-5" /></div>
            <h3 className="font-bold text-orange-900">قيد المعالجة</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">{tickets.filter(t => t.status === 'pending').length}</p>
        </Card>
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><CheckCircle className="w-5 h-5" /></div>
            <h3 className="font-bold text-green-900">تم الحل</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{tickets.filter(t => t.status === 'closed').length}</p>
        </Card>
      </div>

      {showForm && (
        <Card className="p-6 border-2 border-blue-100">
          <h3 className="font-bold text-lg mb-4">فتح تذكرة دعم جديدة</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الموضوع</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={newTicket.subject}
                onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">القسم</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newTicket.category}
                  onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                >
                  <option value="technical">دعم فني</option>
                  <option value="financial">مالية</option>
                  <option value="account">الحساب</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الأولوية</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newTicket.priority}
                  onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                >
                  <option value="low">منخفضة</option>
                  <option value="normal">عادية</option>
                  <option value="high">عالية</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>إلغاء</Button>
              <Button type="submit" variant="primary">إرسال التذكرة</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right p-4 font-medium text-gray-600">رقم التذكرة</th>
                <th className="text-right p-4 font-medium text-gray-600">الموضوع</th>
                <th className="text-right p-4 font-medium text-gray-600">القسم</th>
                <th className="text-right p-4 font-medium text-gray-600">الأولوية</th>
                <th className="text-right p-4 font-medium text-gray-600">آخر تحديث</th>
                <th className="text-right p-4 font-medium text-gray-600">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{ticket.id}</td>
                  <td className="p-4">{ticket.subject}</td>
                  <td className="p-4 text-sm text-gray-600">{ticket.category}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>{
                        ticket.priority === 'high' ? 'عالية' : ticket.priority === 'normal' ? 'عادية' : 'منخفضة'
                      }</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{ticket.lastUpdate}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'closed' ? 'bg-gray-200 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                      }`}>
                      {ticket.status === 'open' ? 'مفتوحة' : ticket.status === 'closed' ? 'مغلقة' : 'قيد المعالجة'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
