import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = { hasError: false, error: Error };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Todo: add a toast notification, use this.state.error.message
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
