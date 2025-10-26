export default function VenuePage() {
  return (
    <main className="page container">
      <section className="surface p-6">
        <h1 className="h1">Venue</h1>
        <p className="mt-2">
          Share address, map link, parking, dress code, and timing. You can also embed a map later.
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">Ceremony</h2>
            <p className="mt-1">Location & time</p>
          </div>
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">Reception</h2>
            <p className="mt-1">Location & time</p>
          </div>
        </div>

        <a href="/rsvp" className="btn btn-primary mt-6 inline-block">RSVP</a>
      </section>
    </main>
  );
}
