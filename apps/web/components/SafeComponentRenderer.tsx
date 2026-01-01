import React, { ReactNode, isValidElement } from 'react';

interface SafeComponentRendererProps {
  children: any;
  fallback?: ReactNode;
  debugMode?: boolean;
}

/**
 * Safe component renderer that prevents "Objects are not valid as a React child" errors
 * This component safely renders any child, converting invalid React children to valid ones
 */
const SafeComponentRenderer: React.FC<SafeComponentRendererProps> = ({
  children,
  fallback = null,
  debugMode = process.env.NODE_ENV === 'development',
}) => {
  const renderSafely = (child: any): ReactNode => {
    // If it's already a valid React element, return it
    if (isValidElement(child)) {
      return child;
    }

    // If it's a string or number, return it (valid React children)
    if (typeof child === 'string' || typeof child === 'number') {
      return child;
    }

    // If it's null or undefined, return it (valid React children)
    if (child == null) {
      return child;
    }

    // If it's a boolean, return null (React ignores booleans)
    if (typeof child === 'boolean') {
      return null;
    }

    // If it's an array, recursively process each item
    if (Array.isArray(child)) {
      return child.map((item, index) => (
        <React.Fragment key={index}>{renderSafely(item)}</React.Fragment>
      ));
    }

    // If it's a function component, try to render it
    if (typeof child === 'function') {
      try {
        // Check if it's a React component function
        if (child.prototype && child.prototype.isReactComponent) {
          // It's a class component - render it
          const Component = child;
          return <Component />;
        } else {
          // It's a function component - render it as JSX
          const Component = child;
          return <Component />;
        }
      } catch (error) {
        if (debugMode) {
          console.warn('Error rendering function component:', error);
        }
        return fallback;
      }
    }

    // If it's an object with $$typeof (React component), handle it
    if (typeof child === 'object' && child.$$typeof) {
      if (debugMode) {
        console.warn(
          '🚨 Attempted to render a React component object directly. ' +
            'Components should be rendered as JSX: <Component /> not {Component}',
          child,
        );
      }

      // Try to extract the component and render it properly
      if (child.type) {
        try {
          const Component = child.type;
          const props = child.props || {};
          return <Component {...props} />;
        } catch (error) {
          if (debugMode) {
            console.warn('Error rendering component from object:', error);
          }
          return fallback;
        }
      }

      return fallback;
    }

    // If it's any other object, warn and return fallback
    if (typeof child === 'object') {
      if (debugMode) {
        console.warn(
          '🚨 Attempted to render an object as a React child. ' +
            'Objects are not valid React children.',
          child,
        );
      }
      return fallback;
    }

    // For any other type, return fallback
    if (debugMode) {
      console.warn('Invalid React child type:', typeof child, child);
    }
    return fallback;
  };

  return <>{renderSafely(children)}</>;
};

export default SafeComponentRenderer;
