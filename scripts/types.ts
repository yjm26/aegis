export interface FileMetadata {
  id: string;
  ownerAddress: string;
  /** Aptos account that registered the blob on Shelby (service wallet) */
  storageAccount: string;
  blobName: string;
  /** alias of blobName */
  shelbyHash: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  encryptedKey: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ShareLink {
  token: string;
  fileId: string;
  createdAt: string;
  expiresAt?: string;
  downloadCount: number;
}

export interface UploadProgress {
  phase: 'encrypting' | 'uploading' | 'finalizing';
  percent: number;
  bytesUploaded: number;
  totalBytes: number;
}

export interface DownloadState {
  storageAccount: string;
  blobName: string;
  decryptionKey: string;
  fileName: string;
  mimeType: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface WalletAccount {
  address: string;
  publicKey: string;
}
