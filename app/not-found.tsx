import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center md:px-8">
      <div className="card w-full">
        <p className="text-6xl">🔧</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">We couldn&apos;t find that page.</h1>
        <p className="mt-2 text-gray-600">
          The page may have moved, or the link is stale. Try one of these instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/client" className="btn-secondary">Client portal</Link>
          <Link href="/worker" className="btn-secondary">Worker portal</Link>
        </div>
      </div>
    </div>
  );
}
