export default function OurStoryPage() {
  return (
    <main className="page container">
      <section className="surface p-6">
        <h1 className="h1">Our Story</h1>
        <p className="mt-2">
          A short note about how we met, the adventures we’ve shared, and the reasons we can’t wait to
          celebrate with you. (Replace this text with your story!)
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">How we met</h2>
            <p className="mt-1">Write a few lines here.</p>
          </div>
          <div className="surface p-4" style={{ background: "var(--c-cream)" }}>
            <h2 className="h2">The proposal</h2>
            <p className="mt-1">Write a few lines here.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
