import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload.js';

export default function CoverImageField({ value, onChange }) {
  const inputRef = useRef(null);
  const { upload, uploading, progress } = useImageUpload();
  const [broken, setBroken] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => setBroken(false), [value]);

  const handleFile = async (file) => {
    const result = await upload(file, 'cover');
    if (result) onChange(result.url);
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be chosen again
    if (file) handleFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const hasImage = value && !broken;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-200">Cover image</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose a cover image"
        onChange={onPick}
      />

      {hasImage ? (
        <div>
          <img src={value} alt="Cover preview" className="aspect-[16/9] w-full rounded-xl object-cover" onError={() => setBroken(true)} />
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-secondary flex-1 !py-2" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {uploading ? `${progress}%` : 'Replace'}
            </button>
            <button type="button" className="btn-ghost !py-2 hover:!text-red-600" onClick={() => onChange('')} disabled={uploading}>
              <Trash2 size={15} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={`flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
            dragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-ink-300 hover:border-brand-500 dark:border-ink-700'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin text-brand-600" />
              <span>Uploading {progress}%</span>
            </>
          ) : (
            <>
              <ImagePlus size={22} className="text-ink-400" />
              <span className="font-medium text-ink-700 dark:text-ink-200">Upload a cover image</span>
              <span className="text-xs text-ink-500">Drop a file or click. JPG, PNG, WebP or GIF, up to 5 MB.</span>
            </>
          )}
        </button>
      )}

      {broken && <p className="mt-2 text-xs text-red-600" role="alert">That image could not be loaded. Upload another or check the link.</p>}

      <label htmlFor="coverImage" className="mt-4 block text-xs font-medium text-ink-500">Or paste an image link</label>
      <input
        id="coverImage"
        className="input mt-1"
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}