/**
 * صفحة تذاكر الدعم الفني
 */
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

interface Ticket {
  id: string;
  subject: string;
  userId: string;
  userName: string;
  category: 'technical' | 'billing' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  lastReply: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // Mock data
      setTickets([
        {
          id: 'T001',
          subject: 'مشكلة في الدفع',
          userId: 'u1',
          userName: 'محمد أحمد',
          category: 'billing',
          priority: 'high',
          status: 'open',
          createdAt: '2024-01-25T10:30:00',
          lastReply: '2024-01-25T10:30:00',
        },
        {
          id: 'T002',
          subject: 'لا أستطيع تسجيل الدخول',
          userId: 'u2',
          userName: 'أحمد علي',
          category: 'account',
          priority: 'urgent',
          status: 'in_progress',
          createdAt: '2024-01-25T09:15:00',
          lastReply: '2024-01-25T11:00:00',
        },
        {
          id: 'T003',
          subject: 'استفسار عن المزاد',
          userId: 'u3',
          userName: 'سالم محمود',
          category: 'other',
          priority: 'low',
          status: 'resolved',
          createdAt: '2024-01-24T14:20:00',
          lastReply: '2024-01-24T16:30:00',
        },
        {
          id: 'T004',
          subject: 'خطأ في التطبيق',
          userId: 'u4',
          userName: 'خالد إبراهيم',
          category: 'technical',
          priority: 'medium',
          status: 'open',
          createdAt: '2024-01-24T11:00:00',
          lastReply: '2024-01-24T11:00:00',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'منخفض' },
      medium: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'متوسط' },
      high: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'عالي' },
      urgent: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'عاجل' },
    };
    const p = priorities[priority] || priorities.low;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${p.bg} ${p.text}`}
      >
        {p.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { bg: string; text: string; label: string }> = {
      open: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'مفتوح' },
      in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'قيد المعالجة' },
      resolved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'تم الحل' },
      closed: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'مغلق' },
    };
    const s = statuses[status] || statuses.open;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${s.bg} ${s.text}`}
      >
        {s.label}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      technical: 'تقني',
      billing: 'مالي',
      account: 'حساب',
      other: 'أخرى',
    };
    return categories[category] || category;
  };

  const stats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="تذاكر الدعم">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <ClockIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.open}</p>
              <p className="text-sm text-slate-400">تذاكر مفتوحة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              <p className="text-sm text-slate-400">قيد المعالجة</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
              <p className="text-sm text-slate-400">تم حلها</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث في التذاكر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 py-2 pl-4 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">جميع الحالات</option>
          <option value="open">مفتوح</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">تم الحل</option>
          <option value="closed">مغلق</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">رقم</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الموضوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">التصنيف</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  الأولوية
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="transition-colors hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{ticket.id}</td>
                  <td className="px-4 py-3 text-white">{ticket.subject}</td>
                  <td className="px-4 py-3 text-slate-300">{ticket.userName}</td>
                  <td className="px-4 py-3 text-slate-300">{getCategoryLabel(ticket.category)}</td>
                  <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(ticket.createdAt).toLocaleDateString('ar-LY')}
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-600 hover:text-white">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
