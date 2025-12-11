import React, { useState } from 'react';
import FaceSmileIcon from '@heroicons/react/24/outline/FaceSmileIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import MicrophoneIcon from '@heroicons/react/24/outline/MicrophoneIcon';
import PaperAirplaneIcon from '@heroicons/react/24/outline/PaperAirplaneIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import HandThumbUpIcon from '@heroicons/react/24/outline/HandThumbUpIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';

const ImprovedChatInterface = () => {
  const [message, setMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickResponses = [
    { text: 'مرحباً', icon: FaceSmileIcon },
    { text: 'شكراً لك', icon: HandThumbUpIcon },
    { text: 'موافق', icon: CheckIcon },
    { text: 'غير موافق', icon: XMarkIcon },
    { text: 'في انتظارك', icon: ClockIcon },
    { text: 'تم الاتفاق', icon: HandRaisedIcon },
  ];

  const quickActions = [
    {
      id: 'responses',
      label: 'ردود سريعة',
      icon: FaceSmileIcon,
      color: 'blue',
      action: () => setShowQuickActions(!showQuickActions),
    },
    {
      id: 'file',
      label: 'ملف',
      icon: DocumentIcon,
      color: 'purple',
      action: () => document.getElementById('file-input')?.click(),
    },
    {
      id: 'location',
      label: 'موقع',
      icon: MapPinIcon,
      color: 'red',
      action: () => console.log('مشاركة الموقع'),
    },
    {
      id: 'schedule',
      label: 'جدولة',
      icon: CalendarIcon,
      color: 'orange',
      action: () => console.log('جدولة موعد'),
    },
    {
      id: 'quick-bid',
      label: 'مزايدة سريعة',
      icon: HandRaisedIcon,
      color: 'green',
      action: () => console.log('مزايدة سريعة'),
    },
  ];

  const getActionButtonClass = (color: string) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
      purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
      red: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
      orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
      green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  };

  return (
    <div className="border-t border-gray-200 bg-white shadow-lg">
      {/* Quick Responses Dropdown */}
      {showQuickActions && (
        <div className="border-b border-gray-100 bg-gray-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">ردود سريعة</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(response.text);
                  setShowQuickActions(false);
                }}
                className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
              >
                <response.icon className="h-4 w-4 text-gray-600 transition-transform group-hover:scale-110" />
                <span className="text-gray-700">{response.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="p-4">
        {/* Quick Actions Row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm ${getActionButtonClass(action.color)} ${action.id === 'responses' && showQuickActions ? 'ring-2 ring-blue-300' : ''} `}
              >
                <IconComponent className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Input Row */}
        <div className="flex items-center gap-3">
          {/* Image Upload */}
          <label className="group cursor-pointer">
            <div className="rounded-xl bg-gray-50 p-2.5 text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm">
              <PhotoIcon className="h-5 w-5" />
            </div>
            <input type="file" className="hidden" accept="image/*" />
          </label>

          {/* Voice Message */}
          <button
            className="group rounded-xl bg-gray-50 p-2.5 text-gray-600 transition-all duration-200 hover:bg-green-50 hover:text-green-600 hover:shadow-sm"
            title="رسالة صوتية"
          >
            <MicrophoneIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Message Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
              dir="rtl"
            />
            {message && (
              <button
                onClick={() => setMessage('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                <PlusIcon className="h-4 w-4 rotate-45" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            disabled={!message.trim()}
            className={`rounded-xl p-2.5 transition-all duration-200 hover:shadow-sm ${
              message.trim()
                ? 'bg-blue-600 text-white shadow-md hover:scale-105 hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            } `}
            title="إرسال الرسالة"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
        />
      </div>
    </div>
  );
};

export default ImprovedChatInterface;
