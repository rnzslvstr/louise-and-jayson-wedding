export default function HomePage() {
  return (
    <main className="page container">
      <section className="surface p-6">
        <h1 className="h1">We’re getting married!</h1>
        <p className="mt-2">
          Welcome to our wedding website. Here you’ll find our story, venue details, and everything you
          need to know for the big day. When you’re ready, please head to the RSVP page.
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">Date</h2>
            <p className="mt-1">February 2026</p>
          </div>
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">Ceremony</h2>
            <p className="mt-1">Details to follow</p>
          </div>
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">Reception</h2>
            <p className="mt-1">Details to follow</p>
          </div>
        </div>

        <a href="/rsvp" className="btn btn-primary mt-6 inline-block">RSVP</a>
      </section>
    </main>
  );
}
