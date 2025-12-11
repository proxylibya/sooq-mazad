// @ts-nocheck
/**
 * Participants List Component
 * مكون قائمة المشاركين
 */

import {
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  TrophyIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { AuctionParticipant } from '../../types/socket';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';

interface ParticipantsListProps {
  participants: AuctionParticipant[];
  currentUserId: string | null;
  showOnlineOnly: boolean;
  onToggleOnlineOnly: () => void;
}

type SortField = 'name' | 'totalBids' | 'highestBid' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  showOnlineOnly,
  onToggleOnlineOnly,
}) => {
  const [sortField, setSortField] = useState<SortField>('totalBids');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter participants
  const filteredParticipants = useMemo(() => {
    if (showOnlineOnly) {
      return participants.filter((p) => p.isOnline);
    }
    return participants;
  }, [participants, showOnlineOnly]);

  // Sort participants
  const sortedParticipants = useMemo(() => {
    return [...filteredParticipants].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalBids':
          aValue = a.totalBids;
          bValue = b.totalBids;
          break;
        case 'highestBid':
          aValue = a.highestBid || 0;
          bValue = b.highestBid || 0;
          break;
        case 'lastActivity':
          aValue = a.lastActivity;
          bValue = b.lastActivity;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredParticipants, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get account type icon
  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'COMPANY':
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case 'TRANSPORT_OWNER':
        return <TruckIcon className="h-4 w-4" />;
      case 'SHOWROOM':
        return <HomeModernIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  // Get account type display
  const getAccountTypeDisplay = (accountType: string) => {
    const typeMap = {
      REGULAR_USER: 'مستخدم عادي',
      TRANSPORT_OWNER: 'مالك نقل',
      COMPANY: 'شركة',
      SHOWROOM: 'معرض',
    };
    return typeMap[accountType as keyof typeof typeMap] || 'مستخدم';
  };

  // Get user role display
  const getUserRoleDisplay = (role: string) => {
    const roleMap = {
      USER: 'مستخدم',
      ADMIN: 'إدارة',
      MODERATOR: 'مشرف',
      SUPER_ADMIN: 'إدارة عليا',
    };
    return roleMap[role as keyof typeof roleMap] || 'مستخدم';
  };

  // Get top participants
  const topParticipants = useMemo(() => {
    return [...participants]
      .filter((p) => p.totalBids > 0)
      .sort((a, b) => (b.highestBid || 0) - (a.highestBid || 0))
      .slice(0, 3);
  }, [participants]);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white shadow-lg">
      {/* Header */}
      <div className="rounded-t-lg border-b bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">المشاركون</h3>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {filteredParticipants.length}
            </span>
          </div>

          <button
            onClick={onToggleOnlineOnly}
            className={`rounded-lg p-1.5 transition-colors ${
              showOnlineOnly
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={showOnlineOnly ? 'عرض جميع المشاركين' : 'عرض المتصلين فقط'}
          >
            {showOnlineOnly ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {participants.filter((p) => p.isOnline).length}
            </div>
            <div className="text-xs text-gray-500">متصل</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {participants.filter((p) => p.totalBids > 0).length}
            </div>
            <div className="text-xs text-gray-500">مزايد</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{participants.length}</div>
            <div className="text-xs text-gray-500">إجمالي</div>
          </div>
        </div>
      </div>

      {/* Top Participants */}
      {topParticipants.length > 0 && (
        <div className="border-b bg-yellow-50 p-4">
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
            <TrophyIcon className="h-4 w-4 text-yellow-600" />
            أعلى المزايدين
          </h4>
          <div className="space-y-1">
            {topParticipants.map((participant, index) => (
              <div key={participant.userId} className="flex items-center gap-2 text-xs">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`font-medium ${
                    currentUserId === participant.userId ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {participant.name}
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(participant.highestBid || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="border-b bg-gray-50 p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">ترتيب حسب:</span>
          {[
            { field: 'totalBids' as SortField, label: 'العروض' },
            { field: 'highestBid' as SortField, label: 'أعلى عرض' },
            { field: 'name' as SortField, label: 'الاسم' },
            { field: 'lastActivity' as SortField, label: 'النشاط' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                sortField === field
                  ? 'border border-blue-300 bg-blue-100 text-blue-700'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
              {sortField === field &&
                (sortDirection === 'asc' ? (
                  <SortAscendingIcon className="h-3 w-3" />
                ) : (
                  <SortDescendingIcon className="h-3 w-3" />
                ))}
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {sortedParticipants.length === 0 ? (
          <div className="py-8 text-center">
            <UsersIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-500">
              {showOnlineOnly ? 'لا يوجد مشاركون متصلون' : 'لا يوجد مشاركون'}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {showOnlineOnly ? 'جرب عرض جميع المشاركين' : 'انتظر انضمام المزايدين'}
            </p>
          </div>
        ) : (
          sortedParticipants.map((participant) => {
            const isMe = currentUserId === participant.userId;
            const isOnline = participant.isOnline;

            return (
              <div
                key={participant.userId}
                className={`rounded-lg border p-3 transition-all ${
                  isMe
                    ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-300'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Online Status */}
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />

                    {/* Account Type Icon */}
                    <div className="text-gray-400">
                      {getAccountTypeIcon(participant.accountType)}
                    </div>

                    {/* Name */}
                    <span
                      className={`text-sm font-medium ${isMe ? 'text-blue-700' : 'text-gray-700'}`}
                    >
                      {participant.name}
                    </span>

                    {/* Verified Badge */}
                    {participant.verified && (
                      <ShieldCheckIcon className="h-4 w-4 text-green-500" title="مستخدم موثق" />
                    )}

                    {/* Me Badge */}
                    {isMe && (
                      <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                        أنت
                      </span>
                    )}
                  </div>

                  {/* Total Bids */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{participant.totalBids} عرض</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">النوع: </span>
                    {getAccountTypeDisplay(participant.accountType)}
                  </div>
                  <div>
                    <span className="font-medium">الدور: </span>
                    {getUserRoleDisplay(participant.role)}
                  </div>
                  {participant.highestBid && (
                    <div className="col-span-2">
                      <span className="font-medium">أعلى عرض: </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(participant.highestBid)}
                      </span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium">آخر نشاط: </span>
                    {formatTimeAgo(participant.lastActivity)}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isOnline ? 'متصل' : 'غير متصل'}
                    </div>

                    {participant.totalBids > 0 && (
                      <div className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        مزايد نشط
                      </div>
                    )}
                  </div>

                  {/* Activity Indicator */}
                  {isOnline && (
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-1 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">نشط</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="rounded-b-lg border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            عرض {filteredParticipants.length} من أصل {participants.length}
          </span>
          <span>{showOnlineOnly ? 'متصلون فقط' : 'جميع المشاركين'}</span>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsList;
