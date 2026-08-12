export default function StatusPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-400">eCMR Cloud · v0.1</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">Trust infrastructure is live.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          The first deployed vertical slice can create a canonical e-CMR payload, calculate a SHA-256 document fingerprint and generate the first cryptographically linked audit event.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-sm text-zinc-500">Health</div>
            <code className="mt-2 block text-emerald-300">GET /api/v1/health</code>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-sm text-zinc-500">Create e-CMR</div>
            <code className="mt-2 block text-emerald-300">POST /api/v1/ecmrs</code>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-sm leading-7 text-zinc-400">
          <strong className="text-white">Integrity foundation:</strong> canonical sorted JSON → SHA-256 document hash → ECMR_CREATED event → SHA-256 event hash → previous-event pointer ready for the next ledger event.
        </div>
      </div>
    </main>
  );
}
