"use client"

import ErrorToast from '@/components/ui/Toasts/ErrorToast';
import React, { Component, ReactNode } from 'react';
import { toast } from "react-hot-toast";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error:', error, errorInfo);

    // Show a toast notification for the error
    toast.custom(t => (
      <ErrorToast
        id={t.id}
        primaryMessage={this.state.error?.message || "Something went wrong"}
        secondaryMessage="Refresh the page or try again later."
      />
    ));
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Can render custom fallback UI component
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
