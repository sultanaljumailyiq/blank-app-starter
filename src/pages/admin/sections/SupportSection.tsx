import React, { useState, useEffect } from 'react';
import { AdminTable, Column } from '../../../components/admin/AdminTable';
import { AdminModal, FormModal, ConfirmDeleteModal } from '../../../components/admin/AdminModal';
import { StatsCard } from '../../../components/admin/StatsCard';
import {
  Headphones,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  User,
  Star,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';
import { useAdminSupport, SupportTicket } from '../../../hooks/useAdminSupport';

export const SupportSection: React.FC = () => {
  const {
    tickets,
    loading,
    createTicket,
    updateTicketStatus,
    replyToTicket,
    deleteTicket,
    fetchTicketDetails,
    refresh
  } = useAdminSupport();

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [replyText, setReplyText] = useState('');

  // إحصائيات سريعة (محسوبة من البيانات الحقيقية)
  const stats = [
    {
      title: 'إجمالي التذاكر',
      value: tickets.length,
      trend: { value: 0, direction: 'up' as const }, // Dynamic trend requires history
      icon: Headphones,
      color: 'purple' as const
    },
    {
      title: 'التذاكر المفتوحة',
      value: tickets.filter(t => t.status === 'open').length,
      trend: { value: 0, direction: 'down' as const },
      icon: AlertCircle,
      color: 'orange' as const
    },
    {
      title: 'تم حلها',
      value: tickets.filter(t => t.status === 'resolved').length,
      trend: { value: 0, direction: 'up' as const },
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: 'نسبة الحل',
      value: tickets.length ? Math.round((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100) + '%' : '0%',
      trend: { value: 0, direction: 'up' as const },
      icon: Star,
      color: 'blue' as const
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    if (selectedStatus !== 'all' && ticket.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && ticket.priority !== selectedPriority) return false;
    return true;
  });

  const handleSubmitTicket = async (formData: any) => {
    const success = await createTicket(formData);
    if (success) setShowTicketModal(false);
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    const success = await replyToTicket(selectedTicket.id, replyText);
    if (success) {
      setReplyText('');
      // Refresh details? fetchTicketDetails updates local state passed via context if designed so, 
      // but here we manually trigger or rely on optimisitic update in hook. The hook updates 'tickets'.
      // We might want to re-fetch details to be sure.
      fetchTicketDetails(selectedTicket.id);
    }
  };

  const handleViewDetails = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
    await fetchTicketDetails(ticket.id);
    // Re-select from updated tickets list as hook updates it
    const updated = tickets.find(t => t.id === ticket.id);
    if (updated) setSelectedTicket(updated);
  };

  const ticketColumns: Column[] = [
    {
      key: 'title',
      title: 'عنوان التذكرة',
      sortable: true,
      render: (value, record: SupportTicket) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <User className="h-3 w-3" />
            <span>{record.user?.full_name || 'مستخدم'}</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {record.user?.role || 'user'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'الفئة',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value}
        </span>
      )
    },
    {
      key: 'priority',
      title: 'الأولوية',
      sortable: true,
      render: (value) => {
        const priorityMap: any = {
          low: { label: 'منخفضة', color: 'bg-gray-100 text-gray-800' },
          normal: { label: 'عادية', color: 'bg-blue-100 text-blue-800' },
          high: { label: 'مرتفعة', color: 'bg-orange-100 text-orange-800' },
          urgent: { label: 'عاجلة', color: 'bg-red-100 text-red-800' }
        };
        const priority = priorityMap[value] || priorityMap.normal;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
            {priority.label}
          </span>
        );
      }
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (value) => {
        const statusMap: any = {
          open: { label: 'مفتوحة', color: 'bg-red-100 text-red-800', icon: AlertCircle },
          in_progress: { label: 'قيد المعالجة', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          resolved: { label: 'محلولة', color: 'bg-green-100 text-green-800', icon: CheckCircle },
          closed: { label: 'مغلقة', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
        };
        const status = statusMap[value] || statusMap.open;
        const Icon = status.icon;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} flex items-center gap-1 w-fit`}>
            <Icon className="h-3 w-3" />
            {status.label}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      title: 'تاريخ الإنشاء',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('ar-EG')
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_, record: SupportTicket) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(record)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedTicket(record);
              setShowDeleteModal(true);
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const ticketFormFields = [
    { name: 'title', label: 'عنوان التذكرة', type: 'text' as const, required: true },
    {
      name: 'category', label: 'الفئة', type: 'select' as const, required: true,
      options: [
        { value: 'technical', label: 'مشاكل فنية' },
        { value: 'account', label: 'حساب' },
        { value: 'general', label: 'عام' }
      ]
    },
    {
      name: 'priority', label: 'الأولوية', type: 'select' as const, required: true,
      options: [
        { value: 'low', label: 'منخفضة' },
        { value: 'normal', label: 'عادية' },
        { value: 'high', label: 'مرتفعة' },
        { value: 'urgent', label: 'عاجلة' }
      ]
    },
    { name: 'description', label: 'الوصف', type: 'textarea' as const, required: true }
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} icon={stat.icon as any} trend={stat.trend as any} />
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl font-medium text-sm transition-all ${activeTab === 'tickets' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
        >
          <Headphones className="h-4 w-4" /> تذاكر الدعم
        </button>
      </div>

      <div className="mt-6">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">تذاكر الدعم الفني</h3>
            </div>
            <div className="flex gap-2">
              {/* Filters UI would go here */}
              <button
                onClick={() => { setSelectedTicket(null); setShowTicketModal(true); }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" /> إنشاء تذكرة
              </button>
            </div>
          </div>

          {loading ? <div>جاري التحميل...</div> : (
            <AdminTable
              columns={ticketColumns}
              data={filteredTickets}
              searchable={true}
            />
          )}
        </div>
      </div>

      {/* Forms */}
      <FormModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="إنشاء تذكرة"
        fields={ticketFormFields}
        onSubmit={handleSubmitTicket}
      />

      <AdminModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="تفاصيل التذكرة"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">العنوان</label>
                <div className="font-bold">{selectedTicket.title}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500">الحالة</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                  className="block w-full text-sm border-gray-300 rounded-md"
                >
                  <option value="open">مفتوحة</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="resolved">محلولة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">الوصف</label>
              <div className="bg-gray-50 p-3 rounded">{selectedTicket.description}</div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-bold mb-4">الردود</h4>
              <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                {selectedTicket.messages?.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${msg.is_support_reply ? 'bg-blue-50 ml-8' : 'bg-gray-100 mr-8'}`}>
                    <div className="text-xs font-bold mb-1">{msg.is_support_reply ? 'الدعم الفني' : 'المستخدم'}</div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="اكتب ردك..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <button onClick={handleReply} className="bg-blue-600 text-white px-4 py-2 rounded-lg">إرسال</button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => selectedTicket && deleteTicket(selectedTicket.id).then(() => setShowDeleteModal(false))}
        title="حذف التذكرة"
        message="هل أنت متأكد؟"
        itemName={selectedTicket?.title}
      />
    </div>
  );
};