import { Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export default function ShareButton({ title }) {
  const toast = useToast();

  const onClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // the person closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy the link. Copy it from the address bar.');
    }
  };

  return (
    <button type="button" className="btn-ghost" onClick={onClick} aria-label="Share this article">
      <Share2 size={18} /> Share
    </button>
  );
}