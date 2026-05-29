import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M5 11.5 9 15l10-10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-bold">Sure Hands</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Verified artisans and domestic workers, geolocated and ready. Launching in Enugu.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">For clients</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link href="/client/post-job" className="hover:text-brand-700">Post a job</Link></li>
            <li><Link href="/client/workers" className="hover:text-brand-700">Browse workers</Link></li>
            <li><Link href="/#trust" className="hover:text-brand-700">How we verify</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">For workers</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link href="/worker/profile" className="hover:text-brand-700">Build your profile</Link></li>
            <li><Link href="/worker/jobs" className="hover:text-brand-700">Find jobs nearby</Link></li>
            <li><Link href="/worker/interests" className="hover:text-brand-700">Track your proposals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li><Link href="/#how" className="hover:text-brand-700">How it works</Link></li>
            <li><Link href="/#trust" className="hover:text-brand-700">Trust &amp; safety</Link></li>
            <li><Link href="mailto:hello@surehands.ng" className="hover:text-brand-700">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-gray-500 md:px-8">
          <span>© {new Date().getFullYear()} Sure Hands. Built for Enugu first.</span>
          <span>NIN-verified · Geo-matched · Cash-on-delivery</span>
        </div>
      </div>
    </footer>
  );
}
