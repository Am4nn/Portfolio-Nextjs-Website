"use client"

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
    toast.error(this.state.error?.message || "Something went wrong");
    toast.error("An unexpected error occurred. Please try again.");
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
