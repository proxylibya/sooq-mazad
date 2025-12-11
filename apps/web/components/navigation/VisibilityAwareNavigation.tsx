import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { checkPageVisibility } from '../../lib/pageVisibility';

interface NavigationItem {
  path: string;
  title: string;
  icon?: React.ComponentType<any>;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  allowedRoles?: string[];
  isAdminRoute?: boolean;
}

interface VisibilityAwareNavigationProps {
  items: NavigationItem[];
  userRole?: string;
  isAuthenticated?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showIcons?: boolean;
  suppressErrors?: boolean;
}

const VisibilityAwareNavigation: React.FC<VisibilityAwareNavigationProps> = ({
  items,
  userRole,
  isAuthenticated = false,
  className = '',
  orientation = 'horizontal',
  showIcons = true,
  suppressErrors = true,
}) => {
  const router = useRouter();
  const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  useEffect(() => {
    async function filterVisibleItems() {
      setLoading(true);
      setNavigationError(null);

      try {
        const filteredItems: NavigationItem[] = [];

        for (const item of items) {
          try {
            // Special handling for admin routes
            if (item.isAdminRoute || item.path.includes('/admin')) {
              // For admin routes, only check authentication and role
              if (isAuthenticated && userRole && ['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
                filteredItems.push(item);
              }
              continue;
            }

            const visibility = await checkPageVisibility(item.path, userRole, isAuthenticated);

            if (visibility.isVisible && visibility.isAllowed) {
              // التحقق من العناصر الفرعية إذا وجدت
              if (item.children && item.children.length > 0) {
                const visibleChildren: NavigationItem[] = [];

                for (const child of item.children) {
                  try {
                    // Special handling for admin child routes
                    if (child.isAdminRoute || child.path.includes('/admin')) {
                      if (
                        isAuthenticated &&
                        userRole &&
                        ['ADMIN', 'SUPER_ADMIN'].includes(userRole)
                      ) {
                        visibleChildren.push(child);
                      }
                      continue;
                    }

                    const childVisibility = await checkPageVisibility(
                      child.path,
                      userRole,
                      isAuthenticated,
                    );
                    if (childVisibility.isVisible && childVisibility.isAllowed) {
                      visibleChildren.push(child);
                    }
                  } catch (childError) {
                    if (!suppressErrors) {
                      console.warn(
                        `Navigation child visibility check failed for ${child.path}:`,
                        childError,
                      );
                    }
                  }
                }

                // إضافة العنصر الرئيسي فقط إذا كان له عناصر فرعية مرئية أو كان مرئياً بذاته
                if (visibleChildren.length > 0 || !item.children) {
                  filteredItems.push({
                    ...item,
                    children: visibleChildren,
                  });
                }
              } else {
                filteredItems.push(item);
              }
            }
          } catch (itemError) {
            if (!suppressErrors) {
              console.warn(`Navigation visibility check failed for ${item.path}:`, itemError);
            }
            // في حالة الخطأ، نعرض العنصر إذا كان لا يحتاج اعتماد
            if (!item.requiresAuth) {
              filteredItems.push(item);
            }
          }
        }

        setVisibleItems(filteredItems);
      } catch (error) {
        setNavigationError('خطأ في تحميل عناصر التنقل');
        if (!suppressErrors) {
          console.error('Navigation filtering error:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    filterVisibleItems();
  }, [items, userRole, isAuthenticated, suppressErrors]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'space-x-4'}`}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-6 rounded bg-gray-200 ${orientation === 'vertical' ? 'w-full' : 'w-20'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (navigationError && !suppressErrors) {
    return <div className={`text-sm text-red-600 ${className}`}>{navigationError}</div>;
  }

  const isActivePath = (path: string) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  const renderNavigationItem = (item: NavigationItem, isChild: boolean = false) => {
    const isActive = isActivePath(item.path);
    const hasChildren = item.children && item.children.length > 0;

    const baseClasses = `
      transition-colors duration-200 rounded-lg
      ${isChild ? 'text-sm py-1 px-2' : 'py-2 px-3'}
      ${
        isActive
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }
    `;

    const content = (
      <div className="flex items-center gap-2">
        {showIcons && item.icon && <item.icon className={`${isChild ? 'h-4 w-4' : 'h-5 w-5'}`} />}
        <span>{item.title}</span>
        {hasChildren && (
          <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    );

    if (hasChildren) {
      return (
        <div key={item.path} className="group relative">
          <div className={baseClasses}>{content}</div>
          <div
            className={` ${
              orientation === 'vertical'
                ? 'ml-4 mt-1 space-y-1'
                : 'invisible absolute left-0 top-full z-50 mt-1 min-w-48 rounded-lg border bg-white py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100'
            } `}
          >
            {item.children!.map((child) => renderNavigationItem(child, true))}
          </div>
        </div>
      );
    }

    return (
      <Link key={item.path} href={item.path} className={baseClasses}>
        {content}
      </Link>
    );
  };

  return (
    <nav className={className}>
      <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-1' : 'space-x-1'} `}>
        {visibleItems.map((item) => renderNavigationItem(item))}
      </div>
    </nav>
  );
};

export default VisibilityAwareNavigation;

// مكون مبسط للتنقل الأساسي
export const SimpleVisibilityAwareNav: React.FC<{
  links: { path: string; title: string }[];
  userRole?: string;
  isAuthenticated?: boolean;
  className?: string;
}> = ({ links, userRole, isAuthenticated, className = '' }) => {
  const [visibleLinks, setVisibleLinks] = useState<{ path: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function filterLinks() {
      setLoading(true);
      const filtered = [];

      for (const link of links) {
        const visibility = await checkPageVisibility(link.path, userRole, isAuthenticated);
        if (visibility.isVisible && visibility.isAllowed) {
          filtered.push(link);
        }
      }

      setVisibleLinks(filtered);
      setLoading(false);
    }

    filterLinks();
  }, [links, userRole, isAuthenticated]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className={className}>
      <div className="flex space-x-4">
        {visibleLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className="text-gray-700 transition-colors hover:text-blue-600"
          >
            {link.title}
          </Link>
        ))}
      </div>
    </nav>
  );
};
