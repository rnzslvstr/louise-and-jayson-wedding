export default function NeedToKnowPage() {
  return (
    <main className="page container">
      <section className="surface p-6">
        <h1 className="h1">Need to know / FAQ</h1>
        <p className="mt-2">Helpful info for guests. Add or edit questions anytime.</p>

        <div className="mt-6 space-y-3">
          <details className="surface p-4">
            <summary className="font-semibold">What should I wear?</summary>
            <p className="mt-2">Suggested attire here.</p>
          </details>
          <details className="surface p-4">
            <summary className="font-semibold">Can I bring a guest?</summary>
            <p className="mt-2">RSVP will list who is invited in your household.</p>
          </details>
          <details className="surface p-4">
            <summary className="font-semibold">Is there parking?</summary>
            <p className="mt-2">Parking and transport info here.</p>
          </details>
        </div>

        <a href="/rsvp" className="btn btn-primary mt-6 inline-block">RSVP</a>
      </section>
    </main>
  );
}
