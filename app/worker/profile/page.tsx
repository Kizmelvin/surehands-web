"use client";

import { useState } from "react";
import { CATEGORIES, ENUGU_NEIGHBOURHOODS } from "@/lib/fixtures";

export default function WorkerProfilePage() {
  const [available, setAvailable] = useState(true);
  const [ninSubmitted, setNinSubmitted] = useState(true);
  const [videoUploaded, setVideoUploaded] = useState(true);

  const completion =
    25 + (ninSubmitted ? 25 : 0) + (videoUploaded ? 25 : 0) + 25;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <header>
        <p className="text-sm font-medium text-brand-700">Worker portal</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your profile</h1>
        <p className="mt-1 text-gray-600">A complete profile is the difference between getting hired and getting skipped.</p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card">
            <h2 className="text-base font-semibold text-gray-900">Identity &amp; verification</h2>
            <p className="text-sm text-gray-600">
              Workers verified with NIN + a 15-second skill video appear higher in search.
            </p>

            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="font-medium text-gray-900">National ID (NIN)</p>
                  <p className="text-xs text-gray-500">Required before your profile goes live.</p>
                </div>
                {ninSubmitted ? (
                  <span className="chip-brand">✓ Verified</span>
                ) : (
                  <button onClick={() => setNinSubmitted(true)} className="btn-primary !py-2 !text-xs">
                    Verify NIN
                  </button>
                )}
              </li>
              <li className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="font-medium text-gray-900">15-second skill video</p>
                  <p className="text-xs text-gray-500">Show clients you actually do the work.</p>
                </div>
                {videoUploaded ? (
                  <span className="chip-brand">📹 Uploaded</span>
                ) : (
                  <button onClick={() => setVideoUploaded(true)} className="btn-primary !py-2 !text-xs">
                    Record / upload
                  </button>
                )}
              </li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-gray-900">Basic details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" defaultValue="Chibuzo Okafor" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" defaultValue="+234 803 555 0142" />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" defaultValue="Plumbing">
                  {CATEGORIES.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Base neighbourhood</label>
                <select className="input" defaultValue="Independence Layout">
                  {ENUGU_NEIGHBOURHOODS.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">About you</label>
                <textarea
                  rows={4}
                  className="input resize-y"
                  defaultValue="Licensed plumber with 12 years experience. Specializes in fixing leaks, installing tanks, and pressure-pump diagnostics."
                />
              </div>
              <div>
                <label className="label">Hourly rate (₦)</label>
                <input type="number" className="input" defaultValue={3500} />
              </div>
              <div>
                <label className="label">Travel radius</label>
                <select className="input" defaultValue="5 km">
                  <option>1 km</option>
                  <option>2 km</option>
                  <option>3 km</option>
                  <option>5 km</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-ghost">Cancel</button>
              <button className="btn-primary">Save changes</button>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">Profile completion</h2>
            <p className="mt-1 text-2xl font-bold text-brand-700">{completion}%</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-brand-600" style={{ width: `${completion}%` }} />
            </div>
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              <li>✓ Basic details</li>
              <li>{ninSubmitted ? "✓" : "○"} NIN verified</li>
              <li>{videoUploaded ? "✓" : "○"} Skill video</li>
              <li>✓ Bio &amp; skills</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900">Availability</h2>
            <p className="mt-1 text-xs text-gray-600">
              Toggle off when you&apos;re on a job so clients don&apos;t book you twice.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-sm font-medium ${available ? "text-brand-700" : "text-gray-500"}`}>
                {available ? "Available now" : "Offline"}
              </span>
              <button
                onClick={() => setAvailable((s) => !s)}
                className={`relative h-7 w-14 rounded-full transition ${
                  available ? "bg-brand-600" : "bg-gray-300"
                }`}
                aria-pressed={available}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${
                    available ? "left-7" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
