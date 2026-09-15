import { Component, type ReactNode } from 'react';

interface SceneBoundaryProps {
  readonly children: ReactNode;
  readonly onUseTextView: () => void;
}

interface SceneBoundaryState {
  readonly failed: boolean;
}

export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (this.state.failed) return <div className="scene-loading"><p>The harbor drawing is unavailable in this browser.</p><button type="button" onClick={this.props.onUseTextView}>Use text view</button></div>;
    return this.props.children;
  }
}
