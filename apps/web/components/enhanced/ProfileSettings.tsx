import React from 'react';
import { UserIcon, PhotoIcon, PencilIcon } from '@heroicons/react/24/outline';
import ProfileImageUpload from '../ProfileImageUpload';
import PhoneInputField from '../PhoneInputField';
import SelectField from '../ui/SelectField';
import { type Country } from '../CountryCodeSelector';
import { libyanCities } from '../../data/libyan-cities';

interface ProfileSettingsProps {
  settings: any;
  user: any;
  updateSettings: (section: string, key: string, value: any) => void;
  setProfileCountryCode: (code: string) => void;
  getDecodedUserName: (user: any) => string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  settings,
  user,
  updateSettings,
  setProfileCountryCode,
  getDecodedUserName
}) => {
  return (
    <div className="space-y-8">
      {/* قسم الصورة الشخصية المحسن */}
      <div className="rounded-2xl border border-gradient-to-r from-blue-200 to-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-8 shadow-lg">
        <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="rounded-xl bg-blue-100 p-2">
            <PhotoIcon className="h-7 w-7 text-blue-600" />
          </div>
          الصورة الشخصية والهوية
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* الصورة */}
          <div className="lg:col-span-1 flex justify-center">
            <ProfileImageUpload
              currentImage={settings.profile.avatar}
              accountType={user?.accountType || 'REGULAR_USER'}
              onImageChange={(imageUrl) => updateSettings('profile', 'avatar', imageUrl)}
            />
          </div>
          
          {/* معلومات المستخدم */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center lg:text-right">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {getDecodedUserName(user)}
              </h4>
              <div className="flex justify-center lg:justify-start items-center gap-2">
                <div className={`rounded-full px-4 py-2 text-sm font-medium ${
                  user?.accountType === 'TRANSPORT_OWNER' ? 'bg-blue-100 text-blue-800' :
                  user?.accountType === 'COMPANY' ? 'bg-purple-100 text-purple-800' :
                  user?.accountType === 'SHOWROOM' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.accountType === 'TRANSPORT_OWNER' ? 'مالك نقل' :
                   user?.accountType === 'COMPANY' ? 'شركة' :
                   user?.accountType === 'SHOWROOM' ? 'معرض' : 'مستخدم عادي'}
                </div>
              </div>
            </div>
            
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                <div className="text-sm text-gray-600">المزادات النشطة</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                <div className="text-sm text-gray-600">المزادات المكتملة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات شخصية محسنة */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-gray-900">
          <div className="rounded-xl bg-gray-100 p-2">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </div>
          المعلومات الشخصية
        </h3>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <UserIcon className="h-4 w-4" />
              الاسم الكامل
            </label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => updateSettings('profile', 'name', e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 px-4 py-3 text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          <div className="space-y-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <PhotoIcon className="h-4 w-4" />
              رقم الهاتف
            </label>
            <PhoneInputField
              value={settings.profile.phone}
              onChange={(v: string) => updateSettings('profile', 'phone', v)}
              onCountryChange={(c: Country) => setProfileCountryCode(c.code)}
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <PhotoIcon className="h-4 w-4" />
              المدينة
            </label>
            <SelectField
              value={settings.profile.city}
              onChange={(city) => updateSettings('profile', 'city', city)}
              placeholder="اختر المدينة"
              options={libyanCities.map((city) => city.name)}
              className="w-full"
              searchable
              clearable
            />
          </div>
        </div>
      </div>

      {/* النبذة الشخصية */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-gray-900">
          <div className="rounded-xl bg-gray-100 p-2">
            <PencilIcon className="h-6 w-6 text-gray-600" />
          </div>
          النبذة الشخصية
        </h3>
        
        <div className="space-y-4">
          <textarea
            rows={4}
            value={settings.profile.bio}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                updateSettings('profile', 'bio', e.target.value);
              }
            }}
            placeholder="اكتب نبذة مختصرة عن نفسك واهتماماتك..."
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              settings.profile.bio.length > 450 ? 'text-red-500' :
              settings.profile.bio.length > 400 ? 'text-yellow-500' : 'text-gray-500'
            }`}>
              {settings.profile.bio.length}/500 حرف
            </p>
            
            {settings.profile.bio.length > 450 && (
              <div className="flex items-center gap-1 text-red-500">
                <PhotoIcon className="h-4 w-4" />
                <span className="text-sm">اقترب من الحد الأقصى</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
