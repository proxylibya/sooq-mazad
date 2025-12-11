/**
 * مكون شامل لعرض أسماء المستخدمين مفكوكة التشفير
 * يستخدم هذا المكون في أي مكان يتم عرض اسم المستخدم
 */

import React from 'react';
import { quickDecodeName } from '../utils/universalNameDecoder';

interface UserDisplayProps {
  name?: string | null;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * مكون عرض اسم المستخدم مع فك التشفير التلقائي
 */
export const UserNameDisplay: React.FC<UserDisplayProps> = ({ 
  name, 
  fallback = 'مستخدم',
  className = '',
  style = {},
  ...props 
}) => {
  const decodedName = quickDecodeName(name) || fallback;
  
  return (
    <span className={className} style={style} {...props}>
      {decodedName}
    </span>
  );
};

interface UserInfoDisplayProps {
  user?: any;
  showPhone?: boolean;
  showAccountType?: boolean;
  className?: string;
  nameClassName?: string;
  phoneClassName?: string;
  accountTypeClassName?: string;
}

/**
 * مكون عرض معلومات المستخدم الكاملة مع فك التشفير
 */
export const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({
  user,
  showPhone = false,
  showAccountType = false,
  className = '',
  nameClassName = '',
  phoneClassName = '',
  accountTypeClassName = ''
}) => {
  if (!user) {
    return <span className={className}>مستخدم</span>;
  }

  const decodedName = quickDecodeName(user.name || user.firstName || user.displayName);
  
  return (
    <div className={className}>
      <span className={nameClassName}>
        {decodedName || 'مستخدم'}
      </span>
      
      {showPhone && user.phone && (
        <span className={phoneClassName} dir="ltr">
          {user.phone}
        </span>
      )}
      
      {showAccountType && user.accountType && (
        <span className={accountTypeClassName}>
          {user.accountType}
        </span>
      )}
    </div>
  );
};

/**
 * Hook لفك تشفير بيانات المستخدم
 */
export function useDecodedUserName(name?: string | null): string {
  return quickDecodeName(name) || 'مستخدم';
}

/**
 * دالة مساعدة لفك تشفير أسماء متعددة
 */
export function decodeMultipleNames(names: (string | null | undefined)[]): string[] {
  return names.map(name => quickDecodeName(name) || 'مستخدم');
}

export default UserNameDisplay;
