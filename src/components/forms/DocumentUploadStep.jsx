import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDocuments } from '../../hooks/useDocuments';

export default function DocumentUploadStep({
  user,
  candidateProfile,
  application,
  updateProgress,
}) {
  const navigate = useNavigate();

  const {
    documentTypes,
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    uploading,
    deleting,
  } = useDocuments(application.id);

  const fileInputRefs = useRef({});

  const [identityType, setIdentityType] =
    useState('nin');

  const [activeUpload, setActiveUpload] =
    useState('');

  const [openMenu, setOpenMenu] =
    useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState('');

  function getUploadedDocument(documentTypeId) {
    return documents.find((document) => {
      return (
        document.document_type_id ===
        documentTypeId
      );
    });
  }

  async function handleUpload(documentType, file) {
    if (!file) {
      setMessage(
        `Select a file for ${documentType.name}.`
      );
      setMessageType('error');
      return;
    }

    try {
      setActiveUpload(documentType.id);
      setMessage('');
      setMessageType('');

      await uploadDocument({
        userId: user.id,
        applicationId: application.id,
        documentType,
        documentSubtype:
          documentType.code ===
          'identity_document'
            ? identityType
            : null,
        file,
      });

      setMessage(
        `${documentType.name} uploaded successfully.`
      );
      setMessageType('success');
    } catch (uploadError) {
      setMessage(uploadError.message);
      setMessageType('error');
    } finally {
      setActiveUpload('');

      const input =
        fileInputRefs.current[documentType.id];

      if (input) {
        input.value = '';
      }
    }
  }

  async function handleFileChange(
    documentType,
    file
  ) {
    if (!file) return;

    setOpenMenu('');
    await handleUpload(documentType, file);
  }

  function openFilePicker(documentTypeId) {
    if (
      uploading ||
      deleting ||
      application.status !== 'draft'
    ) {
      return;
    }

    fileInputRefs.current[documentTypeId]?.click();
  }

  async function handleDelete(document) {
    const confirmed = window.confirm(
      `Delete ${document.original_filename}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage('');
      setMessageType('');

      await deleteDocument(document);

      setOpenMenu('');

      setMessage('Document deleted successfully.');
      setMessageType('success');
    } catch (deleteError) {
      setMessage(deleteError.message);
      setMessageType('error');
    }
  }

  function validateRequiredDocuments() {
    const identityDocument =
      documents.find((document) => {
        return (
          document.document_types?.code ===
          'identity_document'
        );
      });

    if (!identityDocument) {
      return 'Upload either your NIN document or international passport.';
    }

    const isReturnedMissionary =
      candidateProfile.missionary_status ===
      'returned_missionary';

    if (isReturnedMissionary) {
      const missionCertificate =
        documents.find((document) => {
          return (
            document.document_types?.code ===
            'mission_certificate'
          );
        });

      if (!missionCertificate) {
        return 'Returned missionaries must upload a mission certificate.';
      }
    }

    return '';
  }

  async function handleContinue() {
    const validationError =
      validateRequiredDocuments();

    if (validationError) {
      setMessage(validationError);
      setMessageType('error');
      return;
    }

    try {
      await updateProgress({
        applicationId: application.id,
        currentStep: 7,
        completionPercentage: 90,
      });

      navigate('/candidate/dashboard');
    } catch (progressError) {
      setMessage(progressError.message);
      setMessageType('error');
    }
  }

  if (loading) {
    return (
      <PageMessage message="Loading document requirements..." />
    );
  }

  if (error) {
    return (
      <PageMessage
        error
        message={error.message}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() =>
            navigate('/candidate/dashboard')
          }
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">
              Step 6 of 7
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Document Upload
            </h1>

            <p className="mt-2 text-slate-600">
              Upload PDF, JPG or PNG files. Each file must
              be 5 MB or smaller.
            </p>
          </header>

          {message && (
            <div
              className={
                messageType === 'success'
                  ? 'mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700'
                  : 'mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'
              }
            >
              {message}
            </div>
          )}

          <div className="mt-7 space-y-5">
            {documentTypes.map((documentType) => {
              const uploaded =
                getUploadedDocument(
                  documentType.id
                );

              const isUploadingThis =
                uploading &&
                activeUpload === documentType.id;

              return (
                <article
                  key={documentType.id}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h2 className="font-bold text-blue-900">
                        {documentType.name}

                        {documentType.is_required && (
                          <span className="ml-1 text-red-600">
                            *
                          </span>
                        )}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
                        {documentType.description}
                      </p>
                    </div>

                    {uploaded && (
                      <span className="h-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                        Uploaded
                      </span>
                    )}
                  </div>

                  {documentType.code ===
                    'identity_document' && (
                    <div className="mt-5">
                      <label
                        htmlFor="identity-type"
                        className="mb-2 block text-sm font-medium"
                      >
                        Identity document type
                      </label>

                      <select
                        id="identity-type"
                        value={identityType}
                        onChange={(event) =>
                          setIdentityType(
                            event.target.value
                          )
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 md:max-w-md"
                      >
                        <option value="nin">
                          NIN
                        </option>

                        <option value="international_passport">
                          International Passport
                        </option>
                      </select>
                    </div>
                  )}

                  <input
                    ref={(element) => {
                      fileInputRefs.current[
                        documentType.id
                      ] = element;
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) =>
                      handleFileChange(
                        documentType,
                        event.target.files?.[0] || null
                      )
                    }
                    className="sr-only"
                    disabled={
                      isUploadingThis ||
                      deleting ||
                      application.status !== 'draft'
                    }
                  />

                  {uploaded ? (
                    <div className="relative mt-5">
                      <button
                        type="button"
                        onClick={() =>
                          openFilePicker(documentType.id)
                        }
                        disabled={
                          isUploadingThis ||
                          deleting ||
                          application.status !== 'draft'
                        }
                        aria-label={`Change ${documentType.name}`}
                        className="group flex w-full items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 pr-14 text-left transition hover:border-blue-300 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
                          {uploaded.original_filename
                            ?.toLowerCase()
                            .endsWith('.pdf')
                            ? 'PDF'
                            : 'IMG'}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-800">
                            {uploaded.original_filename}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {isUploadingThis
                              ? 'Uploading new document...'
                              : `Status: ${formatStatus(
                                  uploaded.verification_status
                                )}`}
                          </span>

                          <span className="mt-1 block text-xs font-semibold text-blue-800 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                            Click to change document
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        aria-label={`More options for ${documentType.name}`}
                        aria-expanded={
                          openMenu === documentType.id
                        }
                        onClick={() =>
                          setOpenMenu((current) =>
                            current === documentType.id
                              ? ''
                              : documentType.id
                          )
                        }
                        disabled={
                          isUploadingThis ||
                          deleting ||
                          application.status !== 'draft'
                        }
                        className="absolute right-3 top-3 rounded-md px-3 py-2 text-xl font-bold leading-none text-slate-500 hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50"
                      >
                        ⋮
                      </button>

                      {openMenu === documentType.id && (
                        <div className="absolute right-3 top-12 z-10 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(uploaded)
                            }
                            disabled={deleting}
                            className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting
                              ? 'Deleting...'
                              : 'Delete document'}
                          </button>
                        </div>
                      )}

                      {uploaded.rejection_reason && (
                        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                          {uploaded.rejection_reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openFilePicker(documentType.id)
                      }
                      disabled={
                        isUploadingThis ||
                        deleting ||
                        application.status !== 'draft'
                      }
                      className="mt-5 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="text-sm font-semibold text-blue-900">
                        {isUploadingThis
                          ? 'Uploading document...'
                          : 'Choose a document'}
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        PDF, JPG or PNG · Maximum 5 MB
                      </span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate('/candidate/dashboard')
              }
              className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700"
            >
              Save and Exit
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={uploading || deleting}
              className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue to Review
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatStatus(status) {
  return status
    .split('_')
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(' ');
}

function PageMessage({
  message,
  error = false,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        className={
          error
            ? 'rounded-lg bg-red-50 p-5 text-red-700'
            : 'rounded-lg bg-white p-5 text-slate-600 shadow'
        }
      >
        {message}
      </div>
    </main>
  );
}
