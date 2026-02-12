import Link from "next/link";

export default function About() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: 'var(--space-3xl)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--line-constellation)',
        padding: 'var(--space-md) var(--space-lg)',
        position: 'sticky',
        top: 0,
        background: 'rgba(6, 10, 18, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '1.5rem' }}>💫</span>
            <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>Pulsar</span>
          </Link>
          <a href="https://novabot.sh" target="_blank" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🧭</span> Nova
          </a>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        position: 'relative',
        padding: 'var(--space-3xl) var(--space-lg)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 400,
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-md)',
          }}>
            Documentation
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Generate royalty-free instrumental music via API. Pay per generation with USDC on Base.
          </p>
        </div>
      </section>

      {/* Agent Discovery */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-glow) 0%, transparent 100%)',
          border: '1px solid rgba(212, 168, 67, 0.25)',
          padding: 'var(--space-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <h2 style={{ margin: 0 }}>For AI Agents</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
            Pulsar speaks <strong style={{ color: 'var(--text-primary)' }}>x402</strong> — the HTTP payment protocol.
            Send a POST request with your payment header, get music back.
          </p>
          <pre style={{ marginBottom: 'var(--space-md)' }}>
            <span style={{ color: 'var(--text-muted)' }}># Discovery endpoint (JSON)</span>{'\n'}
            <span style={{ color: 'var(--status-free)' }}>GET</span> https://pulsar.novabot.sh/api/discovery{'\n\n'}
            <span style={{ color: 'var(--text-muted)' }}># Generate music (requires x402 payment)</span>{'\n'}
            <span style={{ color: '#60a5fa' }}>POST</span> https://pulsar.novabot.sh/api/generate
          </pre>
          <a href="/api/discovery" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View machine-readable discovery →
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="section-divider">
          <h2>How It Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
          {[
            { step: '1', title: 'Request', desc: 'POST to /api/generate with a title and style description.' },
            { step: '2', title: 'Pay', desc: 'Include an X-PAYMENT header with $0.20 USDC on Base.' },
            { step: '3', title: 'Receive', desc: 'Get a job ID, poll for status, download your tracks.' },
          ].map((item) => (
            <div key={item.step} className="card">
              <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)', color: 'var(--accent-gold)' }}>
                {item.step}
              </div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Reference */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="section-divider">
          <h2>API Reference</h2>
        </div>

        {/* Generate */}
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span className="method method-post">POST</span>
              <code style={{ background: 'none', padding: 0, color: 'var(--text-primary)' }}>/api/generate</code>
            </div>
            <span className="tag tag-paid">$0.20 USDC</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
            Generate 2 unique instrumental tracks. Returns immediately with a job ID.
          </p>
          <pre>
            <span style={{ color: 'var(--text-muted)' }}>// Request body</span>{'\n'}
{`{
  "title": "Sunset Vibes",
  "style": "lo-fi, hip-hop, jazzy, chill"
}`}
          </pre>
        </div>

        {/* Status */}
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span className="method method-get">GET</span>
              <code style={{ background: 'none', padding: 0, color: 'var(--text-primary)' }}>/api/status/:jobId</code>
            </div>
            <span className="tag tag-free">Free</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Poll for job status. Returns download URLs when generation is complete.
          </p>
        </div>

        {/* Health */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span className="method method-get">GET</span>
              <code style={{ background: 'none', padding: 0, color: 'var(--text-primary)' }}>/api/health</code>
            </div>
            <span className="tag tag-free">Free</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Health check endpoint.
          </p>
        </div>
      </section>

      {/* Style Guide */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="section-divider">
          <h2>Style Ideas</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
          {[
            { name: 'Lo-fi', desc: 'lo-fi, hip-hop, jazzy, vinyl crackle, mellow' },
            { name: 'Ambient', desc: 'ambient, electronic, soft synth, atmospheric' },
            { name: 'Chiptune', desc: 'chiptune, 8-bit, energetic, playful, retro game' },
            { name: 'Cinematic', desc: 'orchestral, dramatic, brass, strings, epic' },
            { name: 'Electronic', desc: 'techno, house, synth, bass, driving beat' },
            { name: 'Acoustic', desc: 'acoustic guitar, warm, folk, fingerpicking' },
          ].map((style) => (
            <div key={style.name} className="card">
              <h3 style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-xs)' }}>{style.name}</h3>
              <code style={{ fontSize: '0.75rem' }}>{style.desc}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line-constellation)',
        padding: 'var(--space-xl) var(--space-lg)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: '1.5rem' }}>💫</span>
            <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>Pulsar</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>
            Powered by x402 · Payment on Base
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', fontSize: '0.8rem' }}>
            <a href="https://novabot.sh" style={{ color: 'var(--text-muted)' }}>🧭 Nova</a>
            <a href="/api/discovery" style={{ color: 'var(--text-muted)' }}>📡 Discovery</a>
            <a href="https://x402.org" target="_blank" style={{ color: 'var(--text-muted)' }}>x402.org</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
