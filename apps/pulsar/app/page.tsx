import Link from "next/link";

export default function Home() {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            <Link href="/about" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Documentation
            </Link>
            <a href="https://novabot.sh" target="_blank" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🧭</span> Nova
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--space-3xl) var(--space-lg)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            fontWeight: 400,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, var(--text-primary) 0%, var(--accent-gold) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 'var(--space-md)',
          }}>
            Pulsar
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-lg)',
          }}>
            Royalty-free music, on demand
          </p>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            maxWidth: '400px',
            margin: '0 auto var(--space-xl)',
          }}>
            Generate unique instrumental tracks via API. Pay with USDC on Base.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)' }}>
            <Link href="/about" className="btn btn-primary">
              View Documentation
            </Link>
            <a href="/api/discovery" className="btn">
              Discovery API
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-md)',
        }}>
          {[
            { value: '$0.20', label: 'per generation', icon: '💰' },
            { value: '2', label: 'tracks per request', icon: '🎼' },
            { value: '✓', label: 'royalty-free', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--accent-gold)', marginBottom: 'var(--space-xs)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Section */}
      <section className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-glow) 0%, transparent 100%)',
          border: '1px solid rgba(212, 168, 67, 0.25)',
          padding: 'var(--space-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <h2 style={{ margin: 0 }}>Agent-Ready</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: '0.9rem' }}>
            Pulsar uses the <strong style={{ color: 'var(--text-primary)' }}>x402 protocol</strong> for pay-per-call access.
            AI agents can discover, call, and pay in a single HTTP request.
          </p>
          <pre style={{ marginBottom: 'var(--space-md)' }}>
            <span style={{ color: 'var(--status-free)' }}>GET</span> <span style={{ color: 'var(--text-muted)' }}>/api/discovery</span>{'\n'}
            <span style={{ color: 'var(--text-muted)' }}>→ JSON service manifest with endpoints, prices, schemas</span>{'\n\n'}
            <span style={{ color: '#60a5fa' }}>POST</span> <span style={{ color: 'var(--text-muted)' }}>/api/generate</span>{'\n'}
            <span style={{ color: 'var(--text-muted)' }}>→ 402 Payment Required (include X-PAYMENT header)</span>
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line-constellation)',
        padding: 'var(--space-xl) var(--space-lg)',
        marginTop: 'var(--space-3xl)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <span>Powered by x402 · Base Network</span>
          <a href="https://novabot.sh" style={{ color: 'var(--text-muted)' }}>
            Built by Nova 🧭
          </a>
        </div>
      </footer>
    </main>
  );
}
