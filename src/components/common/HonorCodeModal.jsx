import { useEffect, useRef, useState } from "react";
import DressStandardsModal from "./DressStandardsModal";

const HONOR_STANDARDS = [
  [
    "1. Integrity",
    [
      "We do not lie, cheat, plagiarize, or steal, especially when no one is watching.",
      "We complete our own work and are evaluated based on that work.",
      "We encourage one another to uphold the same standards.",
    ],
  ],
  [
    "2. Chastity & Virtue",
    [
      "As unmarried students, we practice sexual abstinence.",
      "We avoid pornography and media that promote immorality, profanity, or violence.",
      "We refrain from excessive public displays of affection.",
    ],
  ],
  [
    "3. Obedience to the Law",
    [
      "We obey all local, state, and federal laws, as well as LTC policies.",
      "We honor our commitments and act as responsible members of our communities.",
    ],
  ],
  [
    "4. Self-Respect",
    [
      "We treat ourselves with dignity and respect.",
      "We abstain from alcohol, tobacco, and other harmful substances.",
      "We do not use illegal drugs and substances, abuse medications, or self-medicate without consent from the LTC clinic.",
    ],
  ],
  [
    "5. Respect for Others",
    [
      "We show respect for all individuals, their property, and for LTC facilities.",
      "We avoid behavior that disrupts the peace, safety, or unity of the community.",
      "We seek to be peacemakers, to uplift and support others.",
      "You will engage from time to time in outside community service projects.",
      "At all times, you will be an ambassador for the LTC and the Church, knowing that there are very few members of the Church surrounding the LTC.",
      "We look to you to be an example of Christ, positive and respectful at all times when engaging with these wonderful neighbors and friends.",
    ],
  ],
];

export default function HonorCodeModal({ open, onClose, onReviewed }) {
  const dialogRef = useRef(null);
  const [dressOpen, setDressOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return undefined;
    }

    if (!open) {
      setDressOpen(false);

      if (dialog.open) {
        dialog.close();
      }

      return undefined;
    }

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      document.body.style.overflow = previousOverflow;

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [open]);

  function confirmReview() {
    onReviewed?.();
    onClose();
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby="honor-code-title"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-xl bg-white p-0 text-slate-700 shadow-2xl backdrop:bg-slate-950/70"
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 md:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                LTC Nigeria
              </p>

              <h2
                id="honor-code-title"
                className="mt-1 text-2xl font-bold text-blue-900"
              >
                LTC Nigeria Student Honor Code
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Honor Code"
              className="rounded-md border border-slate-300 px-3 py-2 text-xl text-slate-700"
            >
              ×
            </button>
          </header>

          <div className="overflow-y-auto p-5 md:p-7">
            <p className="leading-7">
              Students of the Light Training Center (LTC) commit to living
              honest, chaste, and virtuous lives; obeying the law; and showing
              respect for themselves and others.
            </p>

            <p className="mt-4 leading-7">
              LTC is a faith-centered learning environment based upon the
              teachings of The Church of Jesus Christ of Latter-day Saints.
              Students are expected to conduct themselves in a manner
              consistent with those teachings and with the LTC core values of:
            </p>

            <ul className="mt-4 grid list-disc gap-2 pl-6 sm:grid-cols-2">
              {[
                "Service",
                "Discipleship",
                "Accountability",
                "Enthusiasm",
                "Excellence",
                "Humility",
                "Integrity",
              ].map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>

            <p className="mt-5 font-semibold leading-7">
              Students agree to abide by this Code for the entire duration of
              their enrollment at the LTC.
            </p>

            {HONOR_STANDARDS.map(([title, items]) => (
              <Standard key={title} title={title} items={items} />
            ))}

            <section className="mt-8 rounded-lg bg-blue-50 p-5">
              <h3 className="text-lg font-bold text-blue-900">
                DRESS AND GROOMING STANDARDS
              </h3>

              <p className="mt-2 leading-7">
                Students are expected to maintain a standard of dress and
                grooming that is:
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>Clean</li>
                <li>Modest</li>
                <li>Respectful</li>
                <li>Appropriate for the occasion</li>
              </ul>

              <p className="mt-4 text-sm leading-6">
                View the illustrated guide and detailed standards for Church,
                classes, campus activities, and work sites.
              </p>

              <button
                type="button"
                onClick={() => setDressOpen(true)}
                aria-haspopup="dialog"
                className="mt-3 rounded-md text-left font-semibold text-blue-900 underline underline-offset-4 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
              >
                View Dress and Grooming Standards
              </button>
            </section>

            {/* <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-blue-900">
                STUDENT PLEDGE
              </h3>

              <p className="mt-4 leading-7">
                I,{" "}
                <span className="inline-block min-w-56 border-b border-slate-400">
                  &nbsp;
                </span>
                , declare that I have read, understand, and agree to abide by
                the LTC – Nigeria Code of Honor and Dress and Grooming
                Standards.
              </p>

              <p className="mt-4 leading-7">
                I also authorize my ecclesiastical leader to provide relevant
                information regarding my personal conduct as part of the
                admissions process.
              </p>
            </section> */}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700"
            >
              Close
            </button>

            <button
              type="button"
              onClick={confirmReview}
              className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white"
            >
              I Have Reviewed the Standards
            </button>
          </footer>
        </div>
      </dialog>

      <DressStandardsModal
        open={dressOpen}
        onClose={() => setDressOpen(false)}
      />
    </>
  );
}

function Standard({ title, items }) {
  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold text-blue-900">{title}</h3>

      <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}