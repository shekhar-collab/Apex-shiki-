export default function PlaceholderPage({ title, description }) {
  return (
    <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', color: 'var(--ivory)' }}>
      <div className="card" style={{ maxWidth: 640, width: '100%', padding: 36 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: 12 }}>{title}</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{description}</p>
      </div>
    </section>
  );
}
