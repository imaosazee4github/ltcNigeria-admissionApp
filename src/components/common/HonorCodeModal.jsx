import { useEffect } from 'react';

export default function HonorCodeModal({
  open,
  onClose,
  onReviewed,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  function confirmReview() {
    onReviewed?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="honor-code-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 md:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">LTC Nigeria</p>
            <h2 id="honor-code-title" className="mt-1 text-2xl font-bold text-blue-900">
              Student Honor Code and Dress and Grooming Standards
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Honor Code"
            className="rounded-md border border-slate-300 px-3 py-2 text-xl text-slate-700">×</button>
        </header>

        <div className="overflow-y-auto p-5 text-slate-700 md:p-7">
          <p>
            Students of the Light Training Center (LTC) commit to living honest, chaste,
            and virtuous lives; obeying the law; and showing respect for themselves and others.
          </p>
          <p className="mt-3">
            Conduct must be consistent with the standards of The Church of Jesus Christ of
            Latter-day Saints and reflect the LTC core values of:
          </p>
          <ul className="mt-3 grid list-disc gap-1 pl-6 sm:grid-cols-2">
            {['Service', 'Discipleship', 'Accountability', 'Enthusiasm', 'Excellence', 'Humility', 'Integrity']
              .map((value) => <li key={value}>{value}</li>)}
          </ul>
          <p className="mt-4 font-semibold">
            Students agree to abide by this Code for the entire duration of their enrollment at LTC.
          </p>

          <Standard title="1. Integrity" items={[
            'We do not lie, cheat, plagiarize, or steal, especially when no one is watching.',
            'We complete our own work and are evaluated based on that work.',
            'We encourage one another to uphold the same standards.',
          ]} />
          <Standard title="2. Chastity and Virtue" items={[
            'As unmarried students, we practice sexual abstinence.',
            'We avoid pornography and media that promote immorality, profanity, or violence.',
            'We refrain from excessive public displays of affection.',
          ]} />
          <Standard title="3. Obedience to the Law" items={[
            'We obey all local, state, and federal laws, as well as LTC policies.',
            'We honor our commitments and act as responsible members of our communities.',
          ]} />
          <Standard title="4. Self-Respect" items={[
            'We treat ourselves with dignity and respect.',
            'We abstain from alcohol, tobacco, and other harmful substances.',
            'We do not use illegal drugs, abuse medications, or self-medicate without consent from the LTC clinic.',
          ]} />
          <Standard title="5. Respect for Others" items={[
            'We show respect for all individuals, their property, and LTC facilities.',
            'We avoid behavior that disrupts the peace, safety, or unity of the community.',
            'We seek to be peacemakers and to uplift and support others.',
          ]} />

          <div className="mt-7 rounded-lg bg-blue-50 p-5">
            <h3 className="text-lg font-bold text-blue-900">Dress and Grooming Standards</h3>
            <p className="mt-2">Students are expected to maintain dress and grooming that is:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Clean</li><li>Modest</li><li>Respectful</li><li>Appropriate for the occasion</li>
            </ul>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose}
            className="rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700">Close</button>
          <button type="button" onClick={confirmReview}
            className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white">
            I Have Reviewed the Standards
          </button>
        </footer>
      </section>
    </div>
  );
}

function Standard({ title, items }) {
  return (
    <section className="mt-7">
      <h3 className="text-lg font-bold text-blue-900">{title}</h3>
      <ul className="mt-2 list-disc space-y-2 pl-6">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
