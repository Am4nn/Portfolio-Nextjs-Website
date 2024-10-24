"use client";
import React, { ComponentType } from "react";
import { useTheme } from "next-themes";

interface WithThemeRerenderProps {
  /**
   * Indicates whether the component should be aware of theme changes.
   * If true, the component will re-render when the theme changes.
   */
  themeAware?: boolean
};

/**
 * A higher-order component that re-renders the wrapped component when the theme changes.
 * @param WrappedComponent - The component to be wrapped.
 * @returns The wrapped component.
 */
const withThemeRerender = <T extends Object>(WrappedComponent: ComponentType<T>): React.FC<T & WithThemeRerenderProps> => {
  const ComponentWithTheme: React.FC<T & WithThemeRerenderProps> = (props) => {
    const { resolvedTheme } = useTheme();
    const { themeAware, ...rest } = props;

    // Use theme as the key if `themeAware` is enabled
    // so the component will re-render when the theme changes
    const key = themeAware ? resolvedTheme : undefined;

    return <WrappedComponent key={key} {...(rest as T)} />;
  };

  // Copy the display name for better debugging in React DevTools
  ComponentWithTheme.displayName = `WithThemeRerender(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return ComponentWithTheme;
}

export default withThemeRerender;
