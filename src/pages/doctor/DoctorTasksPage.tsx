import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckSquare,
  CheckCircle2,
  Timer,
  AlertCircle,
  XCircle,
  Square,
  Calendar,
  Clock,
  Tag,
  Users,
  Stethoscope,
  Plus,
  Eye,
  SquarePen,
  Trash2,
  TrendingUp,
  Building2,
  X,
  Save,
  MessageSquare,
  Send,
  LayoutList,
  Columns
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { useDoctorContext } from '../../contexts/DoctorContext';
import { useTasks } from '../../hooks/useTasks';
import { useStaff } from '../../hooks/useStaff';

// واجهات البيانات
interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface AssignedScope {
  type: 'all' | 'specific';
  ids?: string[]; // Staff IDs
  names?: string[]; // For display
}

interface ClinicScope {
  type: 'all' | 'specific';
  ids?: string[];
  names?: string[];
}

import { Task } from '../../hooks/useTasks';

interface TaskTemplate {
  id: string;
  title: string;
  type: 'task' | 'reminder';
  category: Task['category'];
  description: string;
  subtasks?: string[];
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  clinicId: string;
}



const TEMPLATES: TaskTemplate[] = [
  {
    id: 't1',
    title: 'مراجعة دورية لبروتوكولات التعقيم',
    type: 'task',
    category: 'صيانة',
    description: 'التأكد من صلاحية أجهزة التعقيم ومواد التطهير في العيادة.',
    subtasks: ['فحص الأوتوكلاف', 'فحص محاليل التعقيم', 'تدقيق سجلات التعقيم']
  },
  {
    id: 't2',
    title: 'اجتماع الطاقم الطبي الأسبوعي',
    type: 'reminder',
    category: 'اجتماعات',
    description: 'تذكير بموعد الاجتماع الأسبوعي لمناقشة الحالات.',
  },
  {
    id: 't3',
    title: 'طلب مستلزمات طبية شهرية',
    type: 'task',
    category: 'مشتريات',
    description: 'جرد المخزون وطلب النواقص من الموردين المعتمدين.',
    subtasks: ['جرد المخدر', 'جرد القفازات', 'جرد مواد الحشو']
  }
];



export const DoctorTasksPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { selectedClinicId } = useDoctorContext(); // Use Context
  const navigate = useNavigate();

  // State management
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks(selectedClinicId);
  const { staff } = useStaff(selectedClinicId === 'all' ? undefined : selectedClinicId);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  // clinicFilter is now derived/overridden by selectedClinicId
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');

  // Extended Modal Fields
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // User Context Simulation for Development if Auth not ready
  const currentUser = user || { id: 'mock-user-id', name: 'د. محمد الخزرجي', role: 'doctor' as any };
  const isOwner = user?.email?.includes('demo') || true; // Force owner for testing/demo
  const myClinicId = selectedClinicId === 'all' ? '101' : selectedClinicId;

  // Mock Clinics - In real app, comes from Context/DB
  const clinics = [
    { id: '101', name: 'العيادة الرئيسية' },
    { id: '102', name: 'عيادة الفرع' },
  ];

  // Logic Helpers
  const canEdit = (task: Task) => {
    // Creator can always edit
    if (task.creatorId === currentUser.id) return true;
    // Owner can edit everything (optional rule)
    if (isOwner) return true;
    return false;
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setFormData(prev => ({
      ...prev,
      title: template.title,
      type: template.type,
      category: template.category,
      description: template.description,
      subtasks: template.subtasks || []
    }));
    setSelectedTemplate(templateId);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      setFormData({
        type: 'task',
        status: 'pending',
        priority: 'medium',
        progress: 0,
        subtasks: [],
        tags: [],
        creatorId: currentUser.id,
        creatorName: currentUser.name || 'مستخدم',
        creatorRole: currentUser.role,
        clinicScope: { type: 'specific', ids: [myClinicId], names: ['عيادتي'] },
        assignedScope: { type: 'specific', ids: [currentUser.id], names: [currentUser.name || 'أنا'] },
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        comments: []
      });
    }
    setNewComment('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({});
    setSelectedTemplate('');
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    if (editingTask) {
      await updateTask(editingTask.id, formData);
      //   setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...formData } as Task : t));
    } else {
      await addTask(formData);
      //   const newTask: Task = {
      //     ...(formData as Task),
      //     id: Math.random().toString(36).substr(2, 9),
      //     lastUpdated: new Date().toLocaleDateString('en-GB'),
      //     duration: formData.duration || 30,
      //     comments: []
      //   };
      //   setTasks(prev => [newTask, ...prev]);
    }
    handleCloseModal();
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      deleteTask(taskId);
      //   setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleTaskStatusToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateTask(taskId, { status: newStatus });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: currentUser.name || 'مستخدم',
      text: newComment,
      timestamp: new Date().toLocaleString('ar-IQ')
    };

    const updatedComments = [...(formData.comments || []), comment];
    setFormData({ ...formData, comments: updatedComments });
    setNewComment('');
  };

  // Statistics Calculation (Filtered by Context First)
  const contextFilteredTasks = tasks.filter(task => {
    if (selectedClinicId === 'all') return true;
    return task.clinicScope.type === 'all' || task.clinicScope.ids?.includes(selectedClinicId);
  });

  const totalTasks = contextFilteredTasks.length;
  const completedTasks = contextFilteredTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = contextFilteredTasks.filter(t => t.status === 'in_progress').length;
  const urgentTasks = contextFilteredTasks.filter(t => t.priority === 'urgent').length;
  const overdueTasks = contextFilteredTasks.filter(t => t.status === 'overdue').length;

  // Filtering for List
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesCompleted = showCompleted || task.status !== 'completed';

    // Context Clinic Filter
    const matchesClinic = selectedClinicId === 'all' ||
      task.clinicScope.type === 'all' ||
      task.clinicScope.ids?.includes(selectedClinicId);

    if (!isOwner) {
      const isAssigned = task.assignedScope.type === 'all' || task.assignedScope.ids?.includes(currentUser.id);
      const isMyClinic = task.clinicScope.type === 'all' || task.clinicScope.ids?.includes(myClinicId);

      if (!isAssigned || !isMyClinic) return false;
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesClinic && matchesCompleted;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Statistics Cards --- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <BentoStatCard
          title="إجمالي المهام"
          value={totalTasks}
          icon={CheckSquare}
          color="blue"
          delay={100}
        />

        <BentoStatCard
          title="مكتملة"
          value={completedTasks}
          icon={CheckCircle2}
          color="green"
          delay={200}
        />

        <BentoStatCard
          title="قيد التنفيذ"
          value={inProgressTasks}
          icon={Timer}
          color="orange"
          delay={300}
        />

        <BentoStatCard
          title="طارئة"
          value={urgentTasks}
          icon={AlertCircle}
          color="red"
          delay={400}
        />

        <BentoStatCard
          title="متأخرة"
          value={overdueTasks}
          icon={XCircle}
          color="purple"
          delay={500}
        />
      </div>

      {/* --- View Toggle & Search --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">

          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100 w-fit">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutList className="w-4 h-4" />
              قائمة
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Columns className="w-4 h-4" />
              لوحة
            </button>
          </div>

          <div className="flex-1 relative max-w-lg">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في المهام والتذكيرات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-0 transition-all text-right"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 rounded-xl px-6"
            >
              <Plus className="w-4 h-4 ml-2" />
              مهمة جديدة
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          >
            <option value="all">كل الأولويات</option>
            <option value="urgent">طارئ</option>
            <option value="high">عاجل</option>
            <option value="medium">متوسط</option>
            <option value="low">عادي</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          >
            <option value="all">كل الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="overdue">متأخر</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-transparent cursor-pointer hover:bg-gray-100 transition-colors select-none ml-auto">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
            />
            إظهار المكتملة
          </label>
        </div>
      </div>

      {/* --- Tasks Content --- */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer border-l-4 group ${task.type === 'reminder' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}
              onClick={() => handleOpenModal(task)}
            >
              <div className="flex items-start gap-4">
                <button
                  className="mt-1 flex-shrink-0 transition-transform active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskStatusToggle(task.id);
                  }}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 transition-colors" />
                  ) : (
                    <Square className="w-6 h-6 text-gray-300 group-hover:text-blue-600 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {task.type === 'reminder' ? 'تذكير' : 'مهمة'}
                        </span>
                        <h3 className={`font-bold text-lg text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{task.description}</p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200">
                          <Users className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-500">من:</span>
                          <span className="font-medium text-gray-700">{task.creatorName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200">
                          <Building2 className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-500">العيادة:</span>
                          <span className="font-medium text-gray-700">
                            {task.clinicScope.type === 'all' ? 'كل العيادات' : task.clinicScope.names?.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'urgent' ? 'طارئ' : task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'pending' ? 'في الانتظار' : task.status === 'in_progress' ? 'قيد التنفيذ' : task.status === 'completed' ? 'مكتمل' : 'متأخر'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{task.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{task.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {canEdit(task) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(task);
                          }}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <SquarePen className="w-4 h-4 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          حذف
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(task);
                      }}
                      className="text-gray-600 hover:bg-gray-100 mr-auto"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6" style={{ scrollbarWidth: 'thin' }}>
          {[
            { id: 'pending', title: 'في الانتظار / متأخر', color: 'gray', statuses: ['pending', 'overdue'] },
            { id: 'in_progress', title: 'قيد التنفيذ', color: 'blue', statuses: ['in_progress'] },
            { id: 'completed', title: 'مكتمل', color: 'green', statuses: ['completed'] }
          ].map(col => {
            const colTasks = filteredTasks.filter(t => col.statuses.includes(t.status));
            return (
              <div key={col.id} className="min-w-[320px] max-w-[320px] flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-${col.color}-500`}></span>
                    {col.title}
                  </h3>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-gray-200">{colTasks.length}</span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-hide">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => handleOpenModal(task)}
                      className={`bg-white p-4 rounded-xl shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer border-l-4 ${task.type === 'reminder' ? 'border-l-yellow-400' : 'border-l-blue-400'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'urgent' ? 'طارئ' : task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </span>
                        {task.status === 'overdue' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{task.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.date}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-[10px]">
                          {task.assignedScope.names?.[0]?.charAt(0) || '?'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                      لا توجد مهام
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Task Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">{editingTask ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <form id="taskForm" onSubmit={handleSaveTask} className="space-y-4">

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({ ...formData, type: 'task' })}
                    className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.type === 'task' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}
                  >
                    <CheckSquare className="w-5 h-5" />
                    <span className="font-bold">مهمة</span>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, type: 'reminder' })}
                    className={`cursor-pointer border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.type === 'reminder' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-sm' : 'border-gray-200 hover:border-yellow-200 hover:bg-gray-50'}`}
                  >
                    <Timer className="w-5 h-5" />
                    <span className="font-bold">تذكير</span>
                  </div>
                </div>

                {/* Templates - Only for new */}
                {!editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">استخدام قالب (اختياري)</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    >
                      <option value="">-- اختر قالب --</option>
                      {TEMPLATES.filter(t => t.type === formData.type).map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Advanced Scope Selection (Clinic & Staff) */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">النطاق والتعيين</h4>

                  {/* Clinic Logic */}
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">العيادة المستهدفة:</span>
                    <div className="flex flex-wrap gap-2">
                      {isOwner ? (
                        <>
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                            <input
                              type="radio"
                              name="clinicScope"
                              checked={formData.clinicScope?.type === 'all'}
                              onChange={() => setFormData(p => ({ ...p, clinicScope: { type: 'all' } }))}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>كل العيادات</span>
                          </label>
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                            <input
                              type="radio"
                              name="clinicScope"
                              checked={formData.clinicScope?.type === 'specific'}
                              onChange={() => setFormData(p => ({ ...p, clinicScope: { type: 'specific', ids: [clinics[0].id], names: [clinics[0].name] } }))}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>عيادة محددة</span>
                          </label>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {clinics.find(c => c.id === myClinicId)?.name || 'عيادتي الحالية'} (ثابت)
                        </span>
                      )}
                    </div>

                    {/* Clinic Dropdown if specific and owner */}
                    {isOwner && formData.clinicScope?.type === 'specific' && (
                      <select
                        className="mt-2 w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const c = clinics.find(x => x.id === e.target.value);
                          if (c) setFormData(p => ({ ...p, clinicScope: { type: 'specific', ids: [c.id], names: [c.name] } }))
                        }}
                      >
                        {clinics.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Staff Logic */}
                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">تعيين إلى:</span>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="assignedScope"
                          checked={formData.assignedScope?.type === 'all'}
                          onChange={() => setFormData(p => ({ ...p, assignedScope: { type: 'all' } }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>كل الطاقم</span>
                      </label>
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="assignedScope"
                          checked={formData.assignedScope?.type === 'specific'}
                          onChange={() => setFormData(p => ({ ...p, assignedScope: { type: 'specific', ids: staff.length > 0 ? [staff[0].id] : [], names: staff.length > 0 ? [staff[0].name] : [] } }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>شخص محدد</span>
                      </label>
                    </div>

                    {/* Staff Dropdown - Filtered by Clinic */}
                    {formData.assignedScope?.type === 'specific' && (
                      <select
                        className="mt-2 w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const s = staff.find(x => x.id === e.target.value);
                          if (s) setFormData(p => ({ ...p, assignedScope: { type: 'specific', ids: [s.id], names: [s.name] } }))
                        }}
                      >
                        <option value="">-- اختر موظف --</option>
                        {staff.filter(s => selectedClinicId === 'all' || s.clinicId === selectedClinicId).map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select
                      value={formData.category || 'إدارية'}
                      onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    >
                      <option value="متابعة مرضى">متابعة مرضى</option>
                      <option value="علاجات">علاجات</option>
                      <option value="تأمين">تأمين</option>
                      <option value="مشتريات">مشتريات</option>
                      <option value="إدارية">إدارية</option>
                      <option value="اجتماعات">اجتماعات</option>
                      <option value="صيانة">صيانة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                    <select
                      value={formData.priority || 'medium'}
                      onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    >
                      <option value="urgent">طارئ</option>
                      <option value="high">عاجل</option>
                      <option value="medium">متوسط</option>
                      <option value="low">عادي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                    <input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
                    <input
                      type="time"
                      value={formData.time || '09:00'}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={formData.status || 'pending'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                    >
                      <option value="pending">في الانتظار</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="overdue">متأخر</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  المناقشة
                </h4>

                <div className="space-y-4 mb-4 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {formData.comments && formData.comments.length > 0 ? (
                    formData.comments.map((comment) => (
                      <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-blue-800">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center text-sm py-2">لا توجد تعليقات حتى الآن</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 h-auto"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={handleCloseModal}
                className="text-gray-600 hover:bg-gray-200"
              >
                إلغاء
              </Button>
              {canEdit(editingTask || formData as Task) && (
                <Button
                  onClick={(e) => {
                    // Since Button component doesn't inherently support 'type=submit' prop without passing it through, 
                    // and we need to submit the form. 
                    // Check Button implementation: it passes ...props. 
                    // So specificing type="submit" and form="taskForm" should work if Button supports it.
                    // But safer to just trigger submit via ref or just use onClick to trigger form logic if outside form? 
                    // The form has id "taskForm". 
                    // Let's use simpler onClick handling or rely on Button props passing.
                  }}
                  type="submit"
                  form="taskForm"
                  className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};