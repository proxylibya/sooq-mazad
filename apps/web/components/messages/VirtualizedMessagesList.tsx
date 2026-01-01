import React, { useCallback, useEffect, useRef } from 'react';
import { InfiniteScrollList } from '@/components/virtualized/VirtualizedList';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import useAuth from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: Date;
  type?: string; // e.g. TEXT, IMAGE, etc. (returned by API)
  sender: {
    id: string;
    name: string;
    image?: string;
    profileImage?: string;
    accountType: string;
  };
  receiver: {
    id: string;
    name: string;
    image?: string;
    profileImage?: string;
    accountType: string;
  };
}

interface VirtualizedMessagesListProps {
  conversationId?: string;
  currentUserId: string;
  onMessageClick?: (message: Message) => void;
  className?: string;
}

export function VirtualizedMessagesList({
  conversationId,
  currentUserId,
  onMessageClick,
  className = '',
}: VirtualizedMessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  // دالة جلب الرسائل
  const fetchMessages = useCallback(
    async (page: number, pageSize: number) => {
      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
      });

      if (conversationId) {
        params.append('conversationId', conversationId);
      }

      // استخدام cursor-based pagination
      const token = getToken?.();
      const response = await fetch(`/api/messages/paginated?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result = await response.json();

      return {
        data: result.data,
        hasMore: result.hasMore,
      };
    },
    [conversationId, getToken],
  );

  const {
    data: messages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useInfiniteScroll<Message>({
    fetchData: fetchMessages,
    pageSize: 50,
  });

  // التمرير إلى أحدث رسالة
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      scrollToBottom();
    }
  }, [messages.length, isLoading, scrollToBottom]);

  // عرض الرسالة
  const renderMessage = useCallback(
    (message: Message, _index: number, _style: React.CSSProperties) => {
      const isSentByMe = message.senderId === currentUserId;
      const otherUser = isSentByMe ? message.receiver : message.sender;
      const avatarSrc = otherUser.image || otherUser.profileImage;
      const msgType = (message.type || 'TEXT').toString().toUpperCase();

      return (
        <div
          key={message.id}
          className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} px-4 py-2`}
          onClick={() => onMessageClick?.(message)}
        >
          <div className={`flex max-w-[70%] gap-2 ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* صورة المستخدم */}
            <div className="flex-shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt={otherUser.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-700">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* محتوى الرسالة */}
            <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-lg px-4 py-2 ${
                  isSentByMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msgType === 'IMAGE' ? (
                  <img
                    src={message.content}
                    alt="صورة"
                    className="max-h-64 w-full rounded-md object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/cars/default-car.svg';
                    }}
                  />
                ) : (
                  <p className="break-words text-sm">{message.content}</p>
                )}
              </div>

              {/* وقت الرسالة */}
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {new Date(message.createdAt).toLocaleTimeString('ar-LY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                {isSentByMe && (
                  <span>
                    {message.read ? (
                      <svg
                        className="h-4 w-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    },
    [currentUserId, onMessageClick],
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* قائمة الرسائل المحسنة */}
      <div className="flex-1">
        <InfiniteScrollList
          items={messages}
          height={600}
          itemHeight={(i) => {
            const m = messages[i] as Message | undefined;
            const t = (m?.type || 'TEXT').toString().toUpperCase();
            // تقدير ارتفاع العنصر للـ virtualization (يشمل الحواشي)
            if (t === 'IMAGE') return 320; // رسالة صورة بارتفاع تقريبي أكبر
            return 100; // نص عادي
          }}
          renderItem={renderMessage}
          loading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          emptyMessage="لا توجد رسائل"
          className="bg-white"
        />
      </div>

      {/* زر التحديث */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={refresh}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          تحديث الرسائل
        </button>
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
}

export default VirtualizedMessagesList;
