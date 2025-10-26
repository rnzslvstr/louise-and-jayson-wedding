// src/app/rsvp/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = { id: string; first_name: string; last_name: string; email: string | null };
type Household = { id: string; label: string | null; search_key: string | null };

export default function RSVPPage() {
  const router = useRouter();

  // step state: 1=name, 2=decisions, 3=email
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // step 1
  const [fullName, setFullName] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  // loaded after step 1
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, string>>({});
  const [foundMemberId, setFoundMemberId] = useState<string | undefined>(undefined);

  // step 2
  const [decisions, setDecisions] = useState<Record<string, "accept" | "decline">>({});

  // step 3
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function doLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    setHousehold(null);
    setMembers([]);
    setRsvps({});
    setFoundMemberId(undefined);

    const res = await fetch("/api/rsvp/find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName }),
    });
    const j = await res.json();
    if (!res.ok || !j.ok) {
      setLookupError(j?.error || "We couldn't find your name. Please try again.");
      return;
    }
    setHousehold(j.household);
    setMembers(j.members || []);
    setRsvps(j.rsvps || {});
    setFoundMemberId(j.found_member_id);

    // prefill decisions with previous rsvp values if exist
    const prefills: Record<string, "accept" | "decline"> = {};
    for (const m of j.members || []) {
      const existing = j.rsvps?.[m.id];
      if (existing === "accept" || existing === "decline") {
        prefills[m.id] = existing;
      }
    }
    setDecisions(prefills);
    setStep(2);
  }

  function setChoice(member_id: string, status: "accept" | "decline") {
    setDecisions((prev) => ({ ...prev, [member_id]: status }));
  }

  async function doSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!household) return;
    setSubmitError(null);
    setSubmitting(true);

    const payload = {
      household_id: household.id,
      decisions: Object.entries(decisions).map(([member_id, status]) => ({ member_id, status })),
      submitter_email: email || null,
      found_member_id: foundMemberId,
    };

    if (payload.decisions.length === 0) {
      setSubmitError("Please choose Accept or Decline for at least one person.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/rsvp/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    setSubmitting(false);

    if (!res.ok || !j.ok) {
      setSubmitError(j?.error || "Something went wrong. Please try again.");
      return;
    }

    router.push("/thank-you");
  }

  return (
    <main className="page container">
      <h1 className="h1">RSVP</h1>
      <p className="muted mt-1">Please complete the steps below.</p>

      {/* Stepper indicator */}
      <div className="mt-4 flex items-center gap-2">
        <StepDot active={step >= 1} label="Your Name" />
        <span className="muted">—</span>
        <StepDot active={step >= 2} label="Household" />
        <span className="muted">—</span>
        <StepDot active={step >= 3} label="Email" />
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="section surface p-4">
          <form onSubmit={doLookup} className="space-y-4">
            {lookupError && (
              <div className="p-3 rounded-lg" style={{ background: "#ffe8e8", color: "#8a1a1a" }}>
                {lookupError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Enter your full name</label>
              <input
                className="input mt-1"
                placeholder="e.g., Henry Silvestre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary">Find my household</button>
          </form>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && household && (
        <section className="section surface p-4">
          <div className="flex items-center justify-between">
            <h2 className="h2">
              {household.label ?? household.search_key ?? "Household"}
            </h2>
            <button className="btn btn-neutral" onClick={() => setStep(1)}>
              Change name
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Your Response</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.first_name} {m.last_name}
                    </td>
                    <td>
                      <div className="flex gap-3">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={`rsvp-${m.id}`}
                            checked={decisions[m.id] === "accept"}
                            onChange={() => setChoice(m.id, "accept")}
                          />
                          Accept
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name={`rsvp-${m.id}`}
                            checked={decisions[m.id] === "decline"}
                            onChange={() => setChoice(m.id, "decline")}
                          />
                          Decline
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={2} className="muted p-3">
                      No members in this household yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button className="btn btn-neutral" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && household && (
        <section className="section surface p-4">
          {submitError && (
            <div className="p-3 rounded-lg" style={{ background: "#ffe8e8", color: "#8a1a1a" }}>
              {submitError}
            </div>
          )}
          <form onSubmit={doSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Your email</label>
              <input
                className="input mt-1"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="muted text-xs mt-1">
                We’ll send a confirmation—RSVP is saved even if email delivery fails.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="btn btn-neutral"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit RSVP"}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          display: "inline-block",
          background: active ? "var(--c-rose)" : "var(--border)",
          border: "1px solid var(--border)",
        }}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
