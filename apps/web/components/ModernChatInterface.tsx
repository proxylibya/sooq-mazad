import React, { useState } from 'react';
import FaceSmileIcon from '@heroicons/react/24/outline/FaceSmileIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import MicrophoneIcon from '@heroicons/react/24/outline/MicrophoneIcon';
import PaperAirplaneIcon from '@heroicons/react/24/outline/PaperAirplaneIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import HandThumbUpIcon from '@heroicons/react/24/outline/HandThumbUpIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';

const ModernChatInterface = () => {
  const [message, setMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const quickActions = [
    {
      id: 'responses',
      label: 'ردود سريعة',
      icon: FaceSmileIcon,
      gradient: 'from-blue-500 to-purple-600',
      hoverGradient: 'from-blue-600 to-purple-700',
    },
    {
      id: 'file',
      label: 'ملف',
      icon: DocumentIcon,
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'from-purple-600 to-pink-700',
    },
    {
      id: 'location',
      label: 'موقع',
      icon: MapPinIcon,
      gradient: 'from-red-500 to-orange-600',
      hoverGradient: 'from-red-600 to-orange-700',
    },
    {
      id: 'schedule',
      label: 'جدولة',
      icon: CalendarIcon,
      gradient: 'from-orange-500 to-yellow-600',
      hoverGradient: 'from-orange-600 to-yellow-700',
    },
    {
      id: 'quick-bid',
      label: 'مزايدة سريعة',
      icon: HandRaisedIcon,
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'from-green-600 to-emerald-700',
      special: true,
    },
  ];

  const quickResponses = [
    { text: 'مرحباً بك', icon: FaceSmileIcon, color: 'blue' },
    { text: 'شكراً جزيلاً', icon: HandThumbUpIcon, color: 'purple' },
    { text: 'موافق تماماً', icon: CheckIcon, color: 'green' },
    { text: 'آسف، غير موافق', icon: XMarkIcon, color: 'red' },
    { text: 'في انتظار ردك', icon: ClockIcon, color: 'orange' },
    { text: 'تم الاتفاق', icon: HandRaisedIcon, color: 'emerald' },
  ];

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-2xl backdrop-blur-sm">
      {/* Quick Responses Panel */}
      {showQuickActions && (
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-1.5">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">ردود سريعة</span>
            </div>
            <button
              onClick={() => setShowQuickActions(false)}
              className="rounded-full p-1 transition-colors hover:bg-white/50"
            >
              <XMarkIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(response.text);
                  setShowQuickActions(false);
                }}
                className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-${response.color}-300 `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg bg-gradient-to-r from-${response.color}-100 to-${response.color}-200 flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <response.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {response.text}
                  </span>
                </div>
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-${response.color}-500/5 to-${response.color}-600/5 opacity-0 transition-opacity group-hover:opacity-100`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="space-y-4 p-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'responses') {
                    setShowQuickActions(!showQuickActions);
                  }
                }}
                className={`group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 ${action.gradient} hover:${action.hoverGradient} hover:scale-105 hover:shadow-lg active:scale-95 ${action.special ? 'ring-2 ring-green-300 ring-opacity-50' : ''} ${action.id === 'responses' && showQuickActions ? 'ring-2 ring-white ring-opacity-50' : ''} `}
              >
                <IconComponent className="h-4 w-4 transition-transform group-hover:rotate-12" />
                <span>{action.label}</span>

                {action.special && (
                  <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                )}

                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>

        {/* Message Input Area */}
        <div className="flex items-end gap-3">
          {/* Media Buttons */}
          <div className="flex gap-2">
            <label className="group cursor-pointer">
              <div className="rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 p-3 text-blue-600 transition-all duration-200 hover:scale-105 hover:from-blue-200 hover:to-purple-200 hover:shadow-md">
                <PhotoIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
              </div>
              <input type="file" className="hidden" accept="image/*" />
            </label>

            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`rounded-xl p-3 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                isRecording
                  ? 'animate-pulse bg-gradient-to-r from-red-500 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200'
              } `}
              title={isRecording ? 'إيقاف التسجيل' : 'رسالة صوتية'}
            >
              <MicrophoneIcon
                className={`h-5 w-5 transition-transform ${isRecording ? 'scale-110' : 'group-hover:rotate-12'}`}
              />
            </button>
          </div>

          {/* Message Input */}
          <div className="relative flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white/80 px-5 py-4 text-gray-800 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                dir="rtl"
              />

              {message && (
                <button
                  onClick={() => setMessage('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full p-1 transition-colors hover:bg-gray-100"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            disabled={!message.trim()}
            className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
              message.trim()
                ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:scale-105 hover:from-blue-700 hover:to-purple-800 hover:shadow-xl active:scale-95'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            } `}
            title="إرسال الرسالة"
          >
            <PaperAirplaneIcon
              className={`h-5 w-5 transition-transform ${message.trim() ? 'hover:translate-x-1' : ''}`}
            />

            {message.trim() && (
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
            )}
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

export default ModernChatInterface;
