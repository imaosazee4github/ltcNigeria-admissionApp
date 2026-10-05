
import { useEffect, useRef, useState } from 'react';

export default function DressStandardsModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);
  const posterUrl = `${import.meta.env.BASE_URL}ltc-dress-standards.png`;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!open) {
      if (dialog.open) dialog.close();
      return undefined;
    }
    setImageFailed(false);
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);
  return (
    <dialog ref={dialogRef} aria-labelledby="dress-standards-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-6xl rounded-xl bg-white p-0 text-slate-700 shadow-2xl backdrop:bg-slate-950/70">
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 md:p-6">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-amber-600">LTC Nigeria</p><h2 id="dress-standards-title" className="mt-1 text-2xl font-bold text-blue-900">Dress and Grooming Standards</h2></div>
          <button type="button" onClick={onClose} aria-label="Close Dress and Grooming Standards" className="rounded-md border border-slate-300 px-3 py-2 text-xl">×</button>
        </header>
        <div className="overflow-y-auto p-5 md:p-7">
          <p>All clothing should be modest, neat, clean, and appropriate for a learning and spiritual environment.</p>
          <figure className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            {!imageFailed ? <img src={posterUrl} alt="LTC student dress standards poster showing examples of Church, classroom, sports, cultural, casual campus and construction attire." className="h-auto w-full" onError={() => setImageFailed(true)} /> : <p role="status" className="p-5">The illustrated guide could not load. Please close this window and try again.</p>}
            <figcaption className="border-t border-slate-200 p-3 text-sm text-slate-600">Illustrated LTC student dress standards. <a href={posterUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 underline">Open full-size image (new tab)</a></figcaption>
          </figure>
          <div className="mt-7 rounded-lg bg-blue-50 p-5"><h3 className="font-bold text-blue-900">Important Reminders</h3><ul className="mt-2 list-disc space-y-2 pl-6"><li>Dress standards reflect the values of the Light Training Center (LTC).</li><li>We are here to learn, serve and prepare the next generation for future missionaries.</li><li>When in doubt, choose what is modest and respectful.</li><li>Cleanliness reflects your respect for yourself and others.</li><li>The LTC community is a place of growth, learning, and mutual respect.</li></ul></div>
        </div>
        <footer className="flex justify-end border-t border-slate-200 p-5"><button type="button" onClick={onClose} className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white">Close</button></footer>
      </div>
    </dialog>
  );
}

