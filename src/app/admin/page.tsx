"use client";

import { useEffect, useMemo, useState } from "react";

type Household = {
  id: string;
  label: string | null;
  search_key: string | null;
  created_at: string;
};

type Member = {
  id: string;
  household_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  created_at: string;
};

type Totals = { total: number; accept: number; decline: number; pending: number };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [households, setHouseholds] = useState<Household[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);

  const [hLabel, setHLabel] = useState("");
  const [hKey, setHKey] = useState("");

  const [mFirst, setMFirst] = useState("");
  const [mLast, setMLast] = useState("");
  const [mEmail, setMEmail] = useState("");

  const [globalTotals, setGlobalTotals] = useState<Totals>({ total: 0, accept: 0, decline: 0, pending: 0 });
  const [householdTotals, setHouseholdTotals] = useState<Totals>({ total: 0, accept: 0, decline: 0, pending: 0 });

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/households", { method: "GET" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        setError("Server error while checking auth");
        setAuthed(false);
        return;
      }
      const json = await res.json();
      setHouseholds(json.households ?? []);
      setAuthed(true);
      await refreshGlobalTotals();
    } catch (e: any) {
      setError(String(e));
      setAuthed(false);
    }
  }

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshGlobalTotals() {
    const res = await fetch("/api/admin/summary");
    const j = await res.json();
    if (res.ok && j.ok) {
      setGlobalTotals(j.totals as Totals);
    }
  }

  async function refreshHouseholdTotals(household_id?: string) {
    const id = household_id ?? selectedHouseholdId;
    if (!id) {
      setHouseholdTotals({ total: 0, accept: 0, decline: 0, pending: 0 });
      return;
    }
    const res = await fetch(`/api/admin/summary?household_id=${id}`);
    const j = await res.json();
    if (res.ok && j.ok) {
      setHouseholdTotals(j.totals as Totals);
    }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error ?? "Login failed");
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setLoginPassword("");
    await refreshHouseholds();
    await refreshGlobalTotals();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setHouseholds([]);
    setMembers([]);
    setSelectedHouseholdId(null);
    setGlobalTotals({ total: 0, accept: 0, decline: 0, pending: 0 });
    setHouseholdTotals({ total: 0, accept: 0, decline: 0, pending: 0 });
  }

  async function refreshHouseholds() {
    const res = await fetch("/api/admin/households");
    const j = await res.json();
    if (res.ok) {
      setHouseholds(j.households ?? []);
    } else {
      setError(j?.error ?? "Failed to load households");
    }
  }

  async function refreshMembers(household_id?: string) {
    const id = household_id ?? selectedHouseholdId;
    if (!id) return;
    const res = await fetch(`/api/admin/members?household_id=${id}`);
    const j = await res.json();
    if (res.ok) {
      setMembers(j.members ?? []);
    } else {
      setError(j?.error ?? "Failed to load members");
    }
  }

  async function createHousehold(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/households", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: hLabel, search_key: hKey }),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error ?? "Failed to create household");
      return;
    }
    setHLabel("");
    setHKey("");
    await refreshHouseholds();
    await refreshGlobalTotals();
  }

  async function deleteHousehold(id: string) {
    if (!confirm("Delete this household? This also deletes its members and RSVPs.")) return;
    const res = await fetch(`/api/admin/households?id=${id}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error ?? "Failed to delete household");
      return;
    }
    if (selectedHouseholdId === id) {
      setSelectedHouseholdId(null);
      setMembers([]);
      setHouseholdTotals({ total: 0, accept: 0, decline: 0, pending: 0 });
    }
    await refreshHouseholds();
    await refreshGlobalTotals();
  }

  async function createMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHouseholdId) {
      setError("Select a household first");
      return;
    }
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        household_id: selectedHouseholdId,
        first_name: mFirst,
        last_name: mLast,
        email: mEmail || null,
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error ?? "Failed to create member");
      return;
    }
    setMFirst("");
    setMLast("");
    setMEmail("");
    await refreshMembers();
    await refreshHouseholdTotals();
  }

  async function deleteMember(id: string) {
    const res = await fetch(`/api/admin/members?id=${id}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error ?? "Failed to delete member");
      return;
    }
    await refreshMembers();
    await refreshHouseholdTotals();
  }

  const selectedHousehold = useMemo(
    () => households.find((h) => h.id === selectedHouseholdId) || null,
    [households, selectedHouseholdId]
  );

  if (authed === null) {
    return (
      <main className="page container">
        <h1 className="h1">Admin</h1>
        <p className="muted mt-2">Loading…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="page container">
        <div className="max-w-xl">
          <h1 className="h1">Admin Login</h1>
          <p className="muted mt-1">Enter your email and the admin password.</p>

          {error && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: "#ffe8e8", color: "#8a1a1a" }}>
              {error}
            </div>
          )}

          <form onSubmit={login} className="mt-6 space-y-4 surface p-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="input mt-1"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                className="input mt-1"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">Sign in</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="page container">
      <div className="flex items-center justify-between">
        <h1 className="h1">Admin Dashboard</h1>
        <button onClick={logout} className="btn btn-neutral">Logout</button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg" style={{ background: "#ffe8e8", color: "#8a1a1a" }}>
          {error}
        </div>
      )}

      {/* Summary */}
      <section className="section">
        <h2 className="h2">Summary</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <div className="surface p-4">
            <h3 className="font-semibold">All Households</h3>
            <SummaryTable totals={globalTotals} />
          </div>
          <div className="surface p-4">
            <h3 className="font-semibold">
              {selectedHousehold ? `Selected — ${selectedHousehold.label ?? selectedHousehold.search_key ?? "Household"}` : "Selected Household"}
            </h3>
            <SummaryTable totals={householdTotals} />
          </div>
        </div>
      </section>

      {/* Households */}
      <section className="section">
        <h2 className="h2">Households</h2>
        <form onSubmit={createHousehold} className="mt-3 grid md:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Label (e.g., Santos Family)"
            value={hLabel}
            onChange={(e) => setHLabel(e.target.value)}
          />
          <input
            className="input"
            placeholder="Search Key / Code (e.g., santos-bgc)"
            value={hKey}
            onChange={(e) => setHKey(e.target.value)}
          />
          <button className="btn btn-primary">Add Household</button>
        </form>

        <div className="mt-4 surface overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Search Key</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {households.map((h) => (
                <tr
                  key={h.id}
                  style={{ background: selectedHouseholdId === h.id ? "#fff3e9" : undefined }}
                >
                  <td>{h.label ?? <span className="muted">—</span>}</td>
                  <td>{h.search_key ?? <span className="muted">—</span>}</td>
                  <td>{new Date(h.created_at).toLocaleString()}</td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-neutral"
                      onClick={async () => {
                        setSelectedHouseholdId(h.id);
                        await refreshMembers(h.id);
                        await refreshHouseholdTotals(h.id);
                      }}
                    >
                      Select
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteHousehold(h.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {households.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center muted p-3">
                    No households yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Members */}
      <section className="section">
        <div className="flex items-end justify-between">
          <h2 className="h2">
            Members {selectedHousehold ? `— ${selectedHousehold.label ?? selectedHousehold.search_key ?? "Selected Household"}` : ""}
          </h2>
          <div className="text-sm muted">
            {selectedHouseholdId ? "Editing selected household" : "Select a household"}
          </div>
        </div>

        <form onSubmit={createMember} className="mt-3 grid md:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="First name"
            value={mFirst}
            onChange={(e) => setMFirst(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Last name"
            value={mLast}
            onChange={(e) => setMLast(e.target.value)}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email (optional)"
            value={mEmail}
            onChange={(e) => setMEmail(e.target.value)}
          />
          <button className="btn btn-primary" disabled={!selectedHouseholdId}>
            Add Member
          </button>
        </form>

        <div className="mt-4 surface overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.first_name} {m.last_name}</td>
                  <td>{m.email ?? <span className="muted">—</span>}</td>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteMember(m.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center muted p-3">
                    {selectedHouseholdId ? "No members yet for this household." : "Select a household to view members."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function SummaryTable({ totals }: { totals: Totals }) {
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Status</th>
          <th>Count</th>
          <th>%</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Accepted</td>
          <td>{totals.accept}</td>
          <td>{pct(totals.accept, totals.total)}%</td>
        </tr>
        <tr>
          <td>Declined</td>
          <td>{totals.decline}</td>
          <td>{pct(totals.decline, totals.total)}%</td>
        </tr>
        <tr>
          <td>Pending</td>
          <td>{totals.pending}</td>
          <td>{pct(totals.pending, totals.total)}%</td>
        </tr>
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>{totals.total}</strong></td>
          <td>100%</td>
        </tr>
      </tbody>
    </table>
  );
}
