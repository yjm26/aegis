import React from 'react';

export type DriveDropzoneProps = {
  compact: boolean;
  dragging: boolean;
  hint: string;
  onBrowse: () => void;
  onDrag: (active: boolean) => void;
  onDropFiles: (files: FileList) => void;
};

export default function DriveDropzone({
  compact,
  dragging,
  hint,
  onBrowse,
  onDrag,
  onDropFiles,
}: DriveDropzoneProps) {
  return (
    <div
      className={`app-drop ${compact ? 'app-drop-compact' : ''} ${dragging ? 'is-drag' : ''}`}
      tabIndex={0}
      role="button"
      aria-label="Drop files to upload"
      onClick={onBrowse}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBrowse();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDrag(true);
      }}
      onDragLeave={() => onDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        onDrag(false);
        if (e.dataTransfer.files?.length) onDropFiles(e.dataTransfer.files);
      }}
    >
      <span className="app-drop-title">Drop files here</span>
      <span className="app-drop-hint">{hint}</span>
    </div>
  );
}
