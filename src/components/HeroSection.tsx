import { ArrowDownRight, Compass } from 'lucide-react';
import { useState } from 'react';
import { PROPERTY_IMAGES, PROPERTY_SPECS } from '../data/property';

export function HeroSection() {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          {/* Left editorial column */}
          <div className="flex flex-col justify-between lg:col-span-5 py-1">
            <div>
              <p className="text-xs font-medium tracking-wide text-amber-800">
                <span>Officer&apos;s Field, Portland</span>
                <span aria-hidden="true" className="mx-2 text-slate-400">
                  ·
                </span>
                <span>2012 Olympic Sailing Village</span>
              </p>

              <h1 className="mt-4 font-editorial text-[clamp(2.25rem,3.8vw,3.5rem)] leading-[1.06] font-semibold tracking-tight text-slate-900 text-balance">
                Modern coastal living on the Isle of Portland.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Built in 2012 to house Olympic and Paralympic sailing teams competing in Weymouth
                and Portland Harbour, Kite House is a bright three-storey limestone townhouse steps
                from Chesil Beach, the Sailing Academy, and the South West Coast Path.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#availability"
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Check Availability &amp; Enquire
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="#spaces"
                className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900 hover:decoration-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              >
                Explore the house
              </a>
            </div>
          </div>

          {/* Right architectural image column */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-200 lg:aspect-auto lg:h-full lg:min-h-[380px]">
              {!imgError ? (
                <img
                  src={PROPERTY_IMAGES.heroExterior}
                  alt="Kite House modern three-storey Portland limestone townhouse in Officer's Field, Isle of Portland"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50 p-8 text-center">
                  <Compass className="h-10 w-10 text-slate-500" aria-hidden="true" />
                  <p className="mt-3 font-editorial text-lg font-medium text-slate-800">
                    Kite House · Officer&apos;s Field
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Three-storey 2012 Olympic sailing townhouse, Isle of Portland
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width 4-column property specification strip */}
      <div className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {PROPERTY_SPECS.map((spec) => (
            <div key={spec.label} className="px-6 py-5">
              <div className="text-xs font-medium text-slate-500">{spec.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
