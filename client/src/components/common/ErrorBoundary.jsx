import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold">Something broke on this page</h1>
        <p className="max-w-md text-ink-500">Reloading usually fixes it. If it keeps happening, try again in a few minutes.</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }
}
