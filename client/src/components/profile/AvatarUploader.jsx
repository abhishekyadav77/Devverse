import { useRef, useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useImageUpload } from '../../hooks/useImageUpload.js';
import { useToast } from '../../context/ToastContext.jsx';
import { removeAvatar } from '../../services/uploadService.js';

export default function AvatarUploader() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);
  const { upload, uploading, progress } = useImageUpload();
  const [removing, setRemoving] = useState(false);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = await upload(file, 'avatar');
    if (result) {
      updateUser(result.user);
      toast.success('Profile photo updated');
    }
  };

  const onRemove = async () => {
    setRemoving(true);
    try {
      updateUser(await removeAvatar());
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  };

  const busy = uploading || removing;

  return (
    <div className="mt-6 flex items-center gap-5">
      <Avatar src={user.avatar} name={user.name} size="lg" />
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a profile photo"
          onChange={onPick}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? `Uploading ${progress}%` : user.avatar ? 'Change photo' : 'Upload photo'}
          </button>
          {user.avatar && (
            <button type="button" className="btn-ghost hover:!text-red-600" onClick={onRemove} disabled={busy}>
              {removing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-500">JPG, PNG, WebP or GIF, up to 5 MB. It is cropped to a square.</p>
      </div>
    </div>
  );
}