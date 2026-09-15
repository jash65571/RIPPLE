import { PRODUCT, UI_COPY } from '../config/product';

interface HomeScreenProps {
  readonly onStart: () => void;
  readonly onChapters: () => void;
}

export function HomeScreen({ onStart, onChapters }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <nav className="site-nav" aria-label="Main navigation">
        <strong>{PRODUCT.name}</strong>
        <button type="button" onClick={onChapters}>{UI_COPY.chapters}</button>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A cause-and-effect puzzle in a tiny harbor</p>
          <h1>Watch the delay.<br />Change the plan.</h1>
          <p>Follow each vehicle through the morning. Rewind the events, adjust one starting rule, and test whether the whole harbor still arrives on time.</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onStart}>{UI_COPY.start}</button>
            <button type="button" onClick={onChapters}>Browse all ten puzzles</button>
          </div>
        </div>
        <div className="hero-scene" aria-label="A miniature harbor with a bus, robot, market, and waterfront">
          <div className="sun" />
          <div className="water-lines" />
          <div className="hero-road" />
          <div className="hero-market"><span /><span /><span /><span /></div>
          <div className="css-bus"><i /><i /></div>
          <div className="css-robot"><i /><b /></div>
          <div className="hero-tree tree-one" />
          <div className="hero-tree tree-two" />
        </div>
      </section>
      <section className="how-strip" aria-label="How to play">
        <article><span>1</span><h2>Watch</h2><p>See where the original plan creates a queue.</p></article>
        <article><span>2</span><h2>Change</h2><p>Choose a route or departure time within the budget.</p></article>
        <article><span>3</span><h2>Test</h2><p>Run the plan across every known version of the day.</p></article>
      </section>
    </main>
  );
}
