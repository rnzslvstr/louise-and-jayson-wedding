import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <main className="page container">
      <div className="surface p-6 flex items-center gap-3">
        <Spinner size={22} />
        <div>Loading admin…</div>
      </div>
    </main>
  );
}
