import { Check, Home } from 'lucide-react';
import { useState } from 'react';
import { SPACE_TABS } from '../data/property';

export function SpacesShowcase() {
  const [activeId, setActiveId] = useState<string>(SPACE_TABS[0].id);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeSpace = SPACE_TABS.find((tab) => tab.id === activeId) ?? SPACE_TABS[0];
  const gallery = activeSpace.gallery;
  const activePhoto =
    gallery && gallery[activePhotoIndex]
      ? gallery[activePhotoIndex]
      : { src: activeSpace.image, alt: activeSpace.imageAlt, label: activeSpace.floor };

  const currentImgKey = `${activeSpace.id}-${activePhotoIndex}`;

  return (
    <section id="spaces" className="scroll-mt-20 bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-medium text-amber-800">
              01. Architecture &amp; Rooms
            </p>
            <h2 className="mt-2 font-editorial text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl text-balance">
              Three bright storeys designed for crews, families and sea air
            </h2>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Thoughtful separation between open-plan social space on the ground floor and quiet
            harbour-facing bedrooms above.
          </p>
        </div>

        {/* Interactive floor / space selector */}
        <div
          role="tablist"
          aria-label="House spaces"
          className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3"
        >
          {SPACE_TABS.map((tab) => {
            const isSelected = tab.id === activeSpace.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setActiveId(tab.id);
                  setActivePhotoIndex(0);
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  isSelected
                    ? 'bg-[#0E1C2F] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active space detail split */}
        <div
          role="tabpanel"
          className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10"
        >
          <div className="flex flex-col gap-3 lg:col-span-7">
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
              {!failedImages[currentImgKey] ? (
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [currentImgKey]: true }))
                  }
                  className="aspect-[4/3] w-full object-cover lg:h-full"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-slate-100 p-8 text-center lg:h-full">
                  <Home className="h-9 w-9 text-slate-500" aria-hidden="true" />
                  <p className="mt-3 font-editorial text-lg text-slate-800">{activeSpace.title}</p>
                </div>
              )}
            </div>

            {gallery && gallery.length > 1 && (
              <div
                className={`grid gap-3 ${
                  gallery.length >= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'
                }`}
              >
                {gallery.map((item, idx) => {
                  const isActiveThumb = idx === activePhotoIndex;
                  const thumbKey = `${activeSpace.id}-thumb-${idx}`;
                  return (
                    <button
                      key={item.src}
                      type="button"
                      aria-pressed={isActiveThumb}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`group flex items-center gap-3 overflow-hidden rounded-lg border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                        isActiveThumb
                          ? 'border-blue-700 bg-white ring-1 ring-blue-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
                        {!failedImages[thumbKey] ? (
                          <img
                            src={item.src}
                            alt=""
                            aria-hidden="true"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [thumbKey]: true }))
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100">
                            <Home className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isActiveThumb ? 'text-blue-800' : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-7 sm:p-8 lg:col-span-5">
            <div>
              <div className="text-xs font-medium text-blue-700">{activeSpace.floor}</div>
              <h3 className="mt-2 font-editorial text-2xl font-medium leading-snug text-slate-900">
                {activeSpace.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {activeSpace.summary}
              </p>
            </div>

            <ul className="mt-8 divide-y divide-slate-100 border-t border-slate-200 pt-2">
              {activeSpace.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 py-3 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
