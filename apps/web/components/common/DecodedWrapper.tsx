/**
 * 🔄 مكون التفاف عالمي لفك التشفير التلقائي
 * يلف أي مكون ويضمن فك تشفير جميع البيانات
 */

import React from 'react';
import { useDecodedData } from '../../lib/universal-name-decoder';

interface DecodedWrapperProps {
  children: React.ReactNode;
  data?: any;
}

/**
 * مكون التفاف يفك تشفير البيانات تلقائياً
 */
export const DecodedWrapper: React.FC<DecodedWrapperProps> = ({ children, data }) => {
  const decodedData = useDecodedData(data);
  
  // إذا تم تمرير data، نمررها مفكوكة التشفير للأطفال
  if (data && React.isValidElement(children)) {
    return React.cloneElement(children, { ...children.props, data: decodedData });
  }
  
  return <>{children}</>;
};

/**
 * Hook مخصص لفك التشفير في أي مكون
 */
export const useAutoDecoding = <T,>(data: T): T => {
  return useDecodedData(data);
};

/**
 * مكون عرض اسم آمن
 */
interface SafeNameProps {
  name: string | null | undefined;
  fallback?: string;
  className?: string;
}

export const SafeName: React.FC<SafeNameProps> = ({ 
  name, 
  fallback = 'مستخدم', 
  className = '' 
}) => {
  const decodedName = useDecodedData(name);
  
  return (
    <span className={className}>
      {decodedName || fallback}
    </span>
  );
};

export default DecodedWrapper;
