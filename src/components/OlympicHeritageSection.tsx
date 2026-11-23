import { MapPin } from 'lucide-react';
import { HERITAGE_MILESTONES, LOCAL_LANDMARKS } from '../data/property';

export function OlympicHeritageSection() {
  return (
    <section id="heritage" className="scroll-mt-20 bg-[#0E1C2F] py-16 text-slate-100 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top Provenance Band */}
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800 pb-14 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-xs font-medium tracking-wide text-amber-400">
              <span>02. London 2012 Olympic Legacy</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="font-mono tabular-nums text-slate-300">
                50°33&apos;N · 02°27&apos;W
              </span>
            </div>

            <h2 className="mt-3 font-editorial text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl text-balance">
              Born as an Olympic sailing base on the Jurassic Coast.
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              When Dorset hosted the London 2012 Olympic and Paralympic sailing events, Officer&apos;s
              Field was purpose-built above Portland Harbour as the athletes&apos; village. Today,
              Kite House carries that maritime clarity forward as a welcoming coastal retreat.
            </p>

            {/* Subtle architectural regatta / 2012 geometric crest */}
            <div className="mt-8 inline-flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
              <svg
                width="44"
                height="32"
                viewBox="0 0 44 32"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M6 25L18 4L25 25H6Z"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 25L30 9L38 25H21Z"
                  stroke="#93C5FD"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <line x1="2" y1="28.5" x2="42" y2="28.5" stroke="#475569" strokeWidth="1.5" />
              </svg>
              <div>
                <div className="font-mono text-xs font-medium text-amber-300 tabular-nums">
                  LONDON 2012 · WEYMOUTH &amp; PORTLAND
                </div>
                <div className="text-xs text-slate-300">
                  Official Olympic &amp; Paralympic Sailing Village Architecture
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-800 border-t border-slate-800 lg:col-span-7 lg:border-t-0">
            {HERITAGE_MILESTONES.map((milestone) => (
              <div key={milestone.index} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm font-medium text-amber-400 tabular-nums">
                    {milestone.index}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {milestone.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Walkable Portland & Dorset Highlights */}
        <div id="portland" className="scroll-mt-20 pt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-medium text-blue-300">
                Isle of Portland · Dorset
              </p>
              <h3 className="mt-1 font-editorial text-2xl font-medium text-white sm:text-3xl">
                Walk to Chesil Beach, the Harbour and the Coast Path
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span>Officer&apos;s Field, Fortuneswell, Portland DT5</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOCAL_LANDMARKS.map((place) => (
              <div
                key={place.name}
                className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-5"
              >
                <div>
                  <div className="font-mono text-xs font-medium text-amber-400 tabular-nums">
                    {place.distance}
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-white">{place.name}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {place.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
