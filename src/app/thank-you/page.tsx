export default function ThankYouPage() {
  return (
    <main className="page container">
      <section className="surface p-6">
        <h1 className="h1">Thank you! 🎉</h1>
        <p className="mt-2">
          Your RSVP has been received. We’re excited to celebrate with you!
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">What’s next</h2>
            <ul className="mt-2 list-disc pl-5">
              <li>Save the date: February 2026</li>
              <li>We’ll share final schedule and details closer to the day</li>
            </ul>
          </div>
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">Change of plans?</h2>
            <p className="mt-1">
              If you need to update your response, revisit the RSVP page and
              submit again. Changes may be locked as we get closer to the event.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a href="/" className="btn btn-neutral">Home</a>
          <a href="/rsvp" className="btn btn-primary">RSVP again</a>
        </div>
      </section>
    </main>
  );
}
