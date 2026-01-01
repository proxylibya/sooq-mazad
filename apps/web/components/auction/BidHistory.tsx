/**
 * Bid History Component
 * مكون سجل العروض
 */

import {
  AdjustmentsHorizontalIcon,
  ArrowDownIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef } from 'react';
import { BidData, SocketUser } from '../../types/socket';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';

interface BidHistoryProps {
  bids: (BidData & { user: SocketUser })[];
  autoScroll: boolean;
  showMyBidsOnly: boolean;
  currentUserId: string | null;
  onToggleAutoScroll: () => void;
  onToggleMyBidsOnly: () => void;
}

const BidHistory: React.FC<BidHistoryProps> = ({
  bids,
  autoScroll,
  showMyBidsOnly,
  currentUserId,
  onToggleAutoScroll,
  onToggleMyBidsOnly,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastBidCountRef = useRef(bids.length);

  // Auto scroll to bottom when new bids arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current && bids.length > lastBidCountRef.current) {
      const container = scrollRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
    lastBidCountRef.current = bids.length;
  }, [bids.length, autoScroll]);

  // Filter bids based on settings
  const filteredBids = useMemo(() => {
    if (showMyBidsOnly && currentUserId) {
      return bids.filter((bid) => bid.userId === currentUserId);
    }
    return bids;
  }, [bids, showMyBidsOnly, currentUserId]);

  // Get bid position (rank)
  const getBidPosition = (bid: BidData & { user: SocketUser }, index: number) => {
    if (index === 0) return 1; // Highest bid
    return index + 1;
  };

  // Get user role display
  const getUserRoleDisplay = (user: SocketUser) => {
    const roleMap = {
      USER: 'مستخدم',
      ADMIN: 'إدارة',
      MODERATOR: 'مشرف',
      SUPER_ADMIN: 'إدارة عليا',
    };
    return roleMap[user.role] || 'مستخدم';
  };

  // Get user account type display
  const getAccountTypeDisplay = (user: SocketUser) => {
    const typeMap = {
      REGULAR_USER: 'مستخدم عادي',
      TRANSPORT_OWNER: 'مالك نقل',
      COMPANY: 'شركة',
      SHOWROOM: 'معرض',
    };
    return typeMap[user.accountType as keyof typeof typeMap] || 'مستخدم';
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-white shadow-lg">
      {/* Header */}
      <div className="rounded-t-lg border-b bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">سجل العروض</h3>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {filteredBids.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto Scroll Toggle */}
            <button
              onClick={onToggleAutoScroll}
              className={`rounded-lg p-1.5 transition-colors ${
                autoScroll
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={autoScroll ? 'إيقاف التمرير التلقائي' : 'تشغيل التمرير التلقائي'}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>

            {/* My Bids Only Toggle */}
            {currentUserId && (
              <button
                onClick={onToggleMyBidsOnly}
                className={`rounded-lg p-1.5 transition-colors ${
                  showMyBidsOnly
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={showMyBidsOnly ? 'عرض جميع العروض' : 'عرض عروضي فقط'}
              >
                {showMyBidsOnly ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Settings */}
            <button
              className="rounded-lg bg-gray-100 p-1.5 text-gray-400 transition-colors hover:bg-gray-200"
              title="إعدادات العرض"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {bids.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(bids[0]?.amount || 0)}
              </div>
              <div className="text-xs text-gray-500">أعلى عرض</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{bids.length}</div>
              <div className="text-xs text-gray-500">إجمالي العروض</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {new Set(bids.map((bid) => bid.userId)).size}
              </div>
              <div className="text-xs text-gray-500">المزايدون</div>
            </div>
          </div>
        )}
      </div>

      {/* Bid List */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
        style={{ maxHeight: '500px' }}
      >
        {filteredBids.length === 0 ? (
          <div className="py-8 text-center">
            <ClockIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-500">
              {showMyBidsOnly ? 'لم تقدم أي عروض بعد' : 'لا توجد عروض بعد'}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {showMyBidsOnly ? 'كن أول من يقدم عرضاً!' : 'ابدأ المزايدة الآن!'}
            </p>
          </div>
        ) : (
          filteredBids.map((bid, index) => {
            const position = getBidPosition(bid, index);
            const isMyBid = currentUserId === bid.userId;
            const isWinning = index === 0;

            return (
              <div
                key={bid.bidId}
                className={`rounded-lg border p-3 transition-all ${
                  isMyBid
                    ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-300'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                } ${isWinning ? 'bg-green-50 ring-2 ring-green-300' : ''}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Position Badge */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold leading-none ${
                        isWinning
                          ? 'bg-green-500 text-white'
                          : position <= 3
                            ? 'bg-yellow-400 text-yellow-800'
                            : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isWinning ? <TrophyIcon className="h-3 w-3" /> : position}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span
                        className={`text-sm font-medium ${
                          isMyBid ? 'text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {bid.user.name}
                      </span>

                      {/* Verified Badge */}
                      {bid.user.verified && (
                        <div className="h-3 w-3 rounded-full bg-green-500" title="مستخدم موثق" />
                      )}

                      {/* My Bid Label */}
                      {isMyBid && (
                        <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                          أنت
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bid Amount */}
                  <div
                    className={`font-bold ${
                      isWinning
                        ? 'text-lg text-green-600'
                        : isMyBid
                          ? 'text-blue-600'
                          : 'text-gray-700'
                    }`}
                  >
                    {formatCurrency(bid.amount)}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>{getAccountTypeDisplay(bid.user)}</span>
                    <span>{getUserRoleDisplay(bid.user)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{formatTimeAgo(bid.timestamp)}</span>
                  </div>
                </div>

                {/* Winning Badge */}
                {isWinning && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
                    <TrophyIcon className="h-3 w-3" />
                    <span>العرض الفائز حالياً</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {filteredBids.length > 0 && (
        <div className="rounded-b-lg border-t bg-gray-50 p-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>آخر تحديث: {formatTimeAgo(filteredBids[0]?.timestamp || Date.now())}</span>
            <span>{autoScroll ? 'تمرير تلقائي مفعل' : 'تمرير يدوي'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidHistory;
