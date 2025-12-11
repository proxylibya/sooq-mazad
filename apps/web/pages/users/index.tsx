// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { checkAuth } from '../../lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  registeredAt: string;
  lastLogin: string;
  totalBids: number;
  totalWins: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'أحمد محمد علي',
        email: 'ahmed@example.com',
        phone: '0912345678',
        role: 'user',
        status: 'active',
        registeredAt: '2024-06-15',
        lastLogin: '2025-01-12',
        totalBids: 45,
        totalWins: 3
      },
      {
        id: '2',
        name: 'سارة الطاهر',
        email: 'sara@example.com',
        phone: '0923456789',
        role: 'seller',
        status: 'active',
        registeredAt: '2024-03-20',
        lastLogin: '2025-01-11',
        totalBids: 0,
        totalWins: 0
      },
      {
        id: '3',
        name: 'محمود إبراهيم',
        email: 'mahmoud@example.com',
        phone: '0934567890',
        role: 'user',
        status: 'suspended',
        registeredAt: '2024-08-10',
        lastLogin: '2024-12-30',
        totalBids: 12,
        totalWins: 1
      },
      {
        id: '4',
        name: 'فاطمة أحمد',
        email: 'fatima@example.com',
        phone: '0945678901',
        role: 'seller',
        status: 'pending',
        registeredAt: '2025-01-10',
        lastLogin: '2025-01-10',
        totalBids: 0,
        totalWins: 0
      }
    ];
    setUsers(mockUsers);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        classes: 'bg-green-900/50 text-green-400 border-green-500',
        icon: CheckCircleIcon,
        text: 'نشط'
      },
      suspended: { 
        classes: 'bg-red-900/50 text-red-400 border-red-500',
        icon: XCircleIcon,
        text: 'موقوف'
      },
      pending: { 
        classes: 'bg-yellow-900/50 text-yellow-400 border-yellow-500',
        icon: null,
        text: 'قيد المراجعة'
      }
    }[status] || { 
      classes: 'bg-gray-900/50 text-gray-400 border-gray-500',
      icon: null,
      text: status
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.classes}`}>
        {statusConfig.icon && <statusConfig.icon className="h-3 w-3 ml-1" />}
        {statusConfig.text}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { 
        classes: 'bg-purple-900/50 text-purple-400 border-purple-500',
        text: 'مدير'
      },
      seller: { 
        classes: 'bg-blue-900/50 text-blue-400 border-blue-500',
        text: 'بائع'
      },
      user: { 
        classes: 'bg-gray-900/50 text-gray-400 border-gray-500',
        text: 'مستخدم'
      }
    }[role] || { 
      classes: 'bg-gray-900/50 text-gray-400 border-gray-500',
      text: role
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleConfig.classes}`}>
        {roleConfig.text}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
              <p className="text-sm text-gray-400 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <UserPlusIcon className="h-5 w-5 ml-2" />
              إضافة مستخدم جديد
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">المستخدمون النشطون</p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">البائعون</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {users.filter(u => u.role === 'seller').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">قيد المراجعة</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {users.filter(u => u.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الأدوار</option>
              <option value="user">مستخدم</option>
              <option value="seller">بائع</option>
              <option value="admin">مدير</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="suspended">موقوف</option>
              <option value="pending">قيد المراجعة</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    التواصل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    النشاط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    آخر دخول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-xs text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-300">
                          <EnvelopeIcon className="h-3 w-3 ml-1 text-gray-500" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <PhoneIcon className="h-3 w-3 ml-1 text-gray-500" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        <div>المزايدات: {user.totalBids}</div>
                        <div>الفوز: {user.totalWins}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.lastLogin).toLocaleDateString('ar-LY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-yellow-400 hover:bg-gray-700 rounded" title="تعديل">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-red-400 hover:bg-gray-700 rounded" title="حذف">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-700/30 px-6 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              عرض {filteredUsers.length} من {users.length} مستخدم
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                السابق
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return checkAuth(context);
};
