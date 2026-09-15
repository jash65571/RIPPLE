interface EndingScreenProps {
  readonly onChapters: () => void;
  readonly onReplay: () => void;
  readonly onShare: () => void;
}

export function EndingScreen({ onChapters, onReplay, onShare }: EndingScreenProps) {
  return <main className="ending-screen"><div className="ending-water"><span /><span /><span /></div><p className="eyebrow">First chapter complete</p><h1>The harbor found its rhythm</h1><p>Ten plans tested. Every bus, robot, and cart now has a route through each possible day.</p><div><button className="primary-button" type="button" onClick={onChapters}>Review chapters</button><button type="button" onClick={onReplay}>Replay Market Morning</button><button type="button" onClick={onShare}>Share the game</button></div><small>More puzzles may come later. No release date is promised.</small></main>;
}
