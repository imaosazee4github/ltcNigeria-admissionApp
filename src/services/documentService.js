import { supabase } from '../utils/supabase';

export const MAX_FILE_SIZE =
  5 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export async function getActiveDocumentTypes() {
  const { data, error } = await supabase
    .from('document_types')
    .select(`
      id,
      code,
      name,
      description,
      accepted_mime_types,
      maximum_size_bytes,
      is_required
    `)
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getApplicationDocuments(
  applicationId
) {
  const { data, error } = await supabase
    .from('application_documents')
    .select(`
      id,
      application_id,
      document_type_id,
      document_subtype,
      storage_path,
      original_filename,
      file_size,
      mime_type,
      verification_status,
      rejection_reason,
      uploaded_at,
      updated_at,
      document_types (
        code,
        name
      )
    `)
    .eq('application_id', applicationId)
    .order('uploaded_at');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function validateDocument(file) {
  if (!file) {
    throw new Error('Select a document to upload.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      'The document must be 5 MB or smaller.'
    );
  }

  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    throw new Error(
      'Only PDF, JPG and PNG files are allowed.'
    );
  }
}

function getFileExtension(file) {
  const extensionFromName =
    file.name.split('.').pop()?.toLowerCase();

  if (
    extensionFromName &&
    ['pdf', 'jpg', 'jpeg', 'png'].includes(
      extensionFromName
    )
  ) {
    return extensionFromName;
  }

  const extensions = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };

  return extensions[file.type];
}

export async function uploadApplicationDocument({
  userId,
  applicationId,
  documentType,
  documentSubtype,
  file,
}) {
  validateDocument(file);

  if (
    documentType.code === 'identity_document' &&
    !documentSubtype
  ) {
    throw new Error(
      'Select NIN or International Passport.'
    );
  }

  const extension = getFileExtension(file);

  const uniqueFileName =
    `${documentType.code}-${crypto.randomUUID()}.${extension}`;

  const storagePath =
    `${userId}/${applicationId}/${uniqueFileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from('candidate-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: existingDocument,
    error: existingDocumentError,
  } = await supabase
    .from('application_documents')
    .select(`
      id,
      storage_path
    `)
    .eq('application_id', applicationId)
    .eq('document_type_id', documentType.id)
    .maybeSingle();

  if (existingDocumentError) {
    await removeStorageFile(storagePath);
    throw new Error(existingDocumentError.message);
  }

  const documentData = {
    storage_path: storagePath,
    original_filename: file.name,
    file_size: file.size,
    mime_type: file.type,

    document_subtype:
      documentType.code === 'identity_document'
        ? documentSubtype
        : null,
  };

  let savedDocument;
  let databaseError;

  if (existingDocument) {
    const result = await supabase
      .from('application_documents')
      .update(documentData)
      .eq('id', existingDocument.id)
      .select()
      .single();

    savedDocument = result.data;
    databaseError = result.error;
  } else {
    const result = await supabase
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_type_id: documentType.id,
        ...documentData,
      })
      .select()
      .single();

    savedDocument = result.data;
    databaseError = result.error;
  }

  if (databaseError) {
    await removeStorageFile(storagePath);
    throw new Error(databaseError.message);
  }

  if (
    existingDocument?.storage_path &&
    existingDocument.storage_path !== storagePath
  ) {
    await removeStorageFile(
      existingDocument.storage_path
    );
  }

  return savedDocument;
}

export async function deleteApplicationDocument(
  document
) {
  const { error: storageError } =
    await supabase.storage
      .from('candidate-documents')
      .remove([document.storage_path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: databaseError } =
    await supabase
      .from('application_documents')
      .delete()
      .eq('id', document.id);

  if (databaseError) {
    throw new Error(databaseError.message);
  }
}

async function removeStorageFile(storagePath) {
  const { error } = await supabase.storage
    .from('candidate-documents')
    .remove([storagePath]);

  if (error) {
    console.error(
      'Unable to remove Storage file:',
      error.message
    );
  }
}