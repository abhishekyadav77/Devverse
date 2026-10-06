import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExt from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { CalendarClock, ExternalLink, Eye, Loader2, Pencil } from 'lucide-react';
import EditorToolbar from './EditorToolbar.jsx';
import TagInput from './TagInput.jsx';
import BlogPreview from '../blog/BlogPreview.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import FormField from '../common/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { createBlog, publishBlog, unpublishBlog, updateBlog } from '../../services/blogService.js';
import { getCategories, getTags } from '../../services/taxonomyService.js';
import { emptyForm, formFromBlog, getProblems, hasContent, toPayload } from '../../utils/editor.js';
import { formatDate, isFuture } from '../../utils/format.js';
import CoverImageField from './CoverImageField.jsx';
import { useImageUpload } from '../../hooks/useImageUpload.js';

const AUTOSAVE_DELAY = 3000;

const SAVE_LABELS = {
  idle: '',
  dirty: 'Unsaved changes',
  saving: 'Saving...',
  saved: 'All changes saved',
  error: 'Save failed. We will retry on your next edit.',
};

export default function BlogEditor({ initialBlog = null }) {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => (initialBlog ? formFromBlog(initialBlog) : emptyForm));
  const [blogId, setBlogId] = useState(initialBlog?._id || null);
  const [slug, setSlug] = useState(initialBlog?.slug || '');
  const [status, setStatus] = useState(initialBlog?.status || 'draft');
  const [publishedAt, setPublishedAt] = useState(initialBlog?.publishedAt || null);
  const [saveState, setSaveState] = useState(initialBlog ? 'saved' : 'idle');
  const [version, setVersion] = useState(0);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState('');
  const [tried, setTried] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);

  const formRef = useRef(form);
  const idRef = useRef(blogId);
  const statusRef = useRef(status);
  const versionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const queueRef = useRef(Promise.resolve());

  const isPublished = status === 'published';
  const isScheduled = isPublished && isFuture(publishedAt);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => toast.error('Could not load categories'));
    getTags().then((tags) => setTagSuggestions(tags.map((t) => t.name))).catch(() => {});
  }, [toast]);

  // Stable updater: safe to call from the editor's onUpdate callback
  const update = useCallback((patch) => {
    formRef.current = { ...formRef.current, ...patch };
    setForm(formRef.current);
    versionRef.current += 1;
    setVersion(versionRef.current);
    setSaveState('dirty');
  }, []);

    const { upload: uploadImage, uploading: uploadingImage } = useImageUpload();
  const insertImageRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Tell your story. Type ## for a heading or ``` for a code block.' }),
      CharacterCount,
    ],
    content: form.content,
        editorProps: {
      attributes: { class: 'article min-h-[420px] px-5 py-5 focus:outline-none', 'aria-label': 'Article content' },
      // Pasting or dropping an image uploads it and inserts it at the cursor
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.files || []).find((f) => f.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        insertImageRef.current?.(file);
        return true;
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false;
        const file = Array.from(event.dataTransfer?.files || []).find((f) => f.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        insertImageRef.current?.(file);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => update({ content: ed.isEmpty ? '' : ed.getHTML() }),
  });
    insertImageRef.current = async (file) => {
    const result = await uploadImage(file, 'content');
    if (result && editor) editor.chain().focus().setImage({ src: result.url }).run();
  };

  // Saves run one at a time, always sending the latest form state
  const doSave = useCallback(async () => {
    const snapshot = versionRef.current;
    const data = formRef.current;
    if (!idRef.current && !hasContent(data)) return null;

    setSaveState('saving');
    try {
      const payload = toPayload(data);
      let blog;
      if (idRef.current) {
        blog = await updateBlog(idRef.current, payload);
      } else {
        blog = await createBlog(payload);
        idRef.current = blog._id;
        setBlogId(blog._id);
        // Update the address bar without remounting the editor (keeps cursor + undo history)
        window.history.replaceState(window.history.state, '', `/dashboard/posts/${blog._id}/edit`);
      }
      setSlug(blog.slug);
      savedVersionRef.current = snapshot;
      setSaveState(versionRef.current === snapshot ? 'saved' : 'dirty');
      return blog;
    } catch (err) {
      setSaveState('error');
      throw err;
    }
  }, []);

  const save = useCallback(() => {
    const run = queueRef.current.catch(() => {}).then(doSave);
    queueRef.current = run;
    return run;
  }, [doSave]);

  // Autosave drafts only. Live posts use the explicit "Save changes" button.
  useEffect(() => {
    if (version === 0 || status === 'published') return undefined;
    const timer = setTimeout(() => save().catch(() => {}), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [version, status, save]);

  // Save pending draft changes when navigating away inside the app
  useEffect(
    () => () => {
      if (versionRef.current > savedVersionRef.current && statusRef.current !== 'published') {
        save().catch(() => {});
      }
    },
    [save]
  );

  // Warn before closing the tab with unsaved work
  useEffect(() => {
    if (saveState === 'saved' || saveState === 'idle') return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveState]);

  

  const handleSaveDraft = async () => {
    setBusy('save');
    try {
      const blog = await save();
      if (!blog) return toast.error('Add a title or some text first');
      toast.success(isPublished ? 'Changes saved' : 'Draft saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  };

  const handlePublish = async () => {
    setTried(true);
    if (getProblems(formRef.current).length) return toast.error('Fix the highlighted items before publishing');

    let publishAt;
    if (schedule) {
      const when = new Date(scheduleAt);
      if (!scheduleAt || Number.isNaN(when.getTime()) || when <= new Date()) {
        return toast.error('Pick a future date and time');
      }
      publishAt = when.toISOString();
    }

    setBusy('publish');
    try {
      await save();
      const blog = await publishBlog(idRef.current, publishAt ? { publishAt } : {});
      setStatus('published');
      setPublishedAt(blog.publishedAt);
      toast.success(publishAt ? 'Scheduled' : 'Published');
      navigate(publishAt ? '/dashboard/posts' : `/blog/${blog.slug}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  };

  const handleUnpublish = async () => {
    setBusy('unpublish');
    try {
      await save();
      await unpublishBlog(idRef.current);
      setStatus('draft');
      setPublishedAt(null);
      setConfirmUnpublish(false);
      toast.success('Unpublished. The post is now a draft.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  };

  const problems = tried ? getProblems(form) : [];
  const words = editor?.storage.characterCount.words() ?? 0;
  const characters = editor?.storage.characterCount.characters() ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isScheduled ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            : isPublished ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'
            : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200'}`}>
            {isScheduled ? 'Scheduled' : isPublished ? 'Published' : 'Draft'}
          </span>
          <span className="text-sm text-ink-500" aria-live="polite">
            {isPublished && saveState === 'dirty' ? 'Changes are not live until you save' : SAVE_LABELS[saveState]}
          </span>
        </div>
        <button type="button" className="btn-secondary" onClick={() => setPreview((p) => !p)}>
          {preview ? <><Pencil size={16} /> Back to editing</> : <><Eye size={16} /> Preview</>}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {/* Kept mounted while previewing so nothing is lost */}
          <div className={preview ? 'hidden' : ''}>
            <label htmlFor="title" className="sr-only">Title</label>
            <textarea
              id="title"
              rows={2}
              maxLength={150}
              value={form.title}
              onChange={(e) => update({ title: e.target.value.replace(/\n/g, ' ') })}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              placeholder="Title"
              className="w-full resize-none bg-transparent font-display text-3xl font-extrabold leading-tight text-ink-900 placeholder:text-ink-300 focus:outline-none sm:text-4xl dark:text-white dark:placeholder:text-ink-600"
            />
            <label htmlFor="subtitle" className="sr-only">Subtitle</label>
            <textarea
              id="subtitle"
              rows={2}
              maxLength={300}
              value={form.subtitle}
              onChange={(e) => update({ subtitle: e.target.value.replace(/\n/g, ' ') })}
              placeholder="Add a short subtitle. It also appears on article cards."
              className="mt-1 w-full resize-none bg-transparent text-lg text-ink-600 placeholder:text-ink-300 focus:outline-none dark:text-ink-300 dark:placeholder:text-ink-600"
            />
            <div className="card mt-4">
           <EditorToolbar editor={editor} onUploadImage={(file) => insertImageRef.current?.(file)} uploading={uploadingImage} />
              <EditorContent editor={editor} />
            </div>
            <p className="mt-3 text-xs text-ink-500">
              {words} words &middot; {characters} characters &middot; {minutes} min read
            </p>
          </div>
          {preview && <BlogPreview form={form} categories={categories} />}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="card space-y-3 p-5" aria-label="Publish">
            {isScheduled && (
              <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                <CalendarClock size={16} className="mt-0.5 shrink-0" /> Goes live {formatDate(publishedAt)} at{' '}
                {new Date(publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            {!isPublished && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} className="h-4 w-4 accent-brand-600" />
                  Schedule for later
                </label>
                {schedule && (
                  <input
                    type="datetime-local"
                    className="input"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    aria-label="Publish date and time"
                  />
                )}
              </>
            )}

            {problems.length > 0 && (
              <ul className="list-disc space-y-1 rounded-xl bg-red-50 py-3 pl-8 pr-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {problems.map((p) => <li key={p}>{p}</li>)}
              </ul>
            )}

            {isPublished ? (
              <>
                <button className="btn-primary w-full" onClick={handleSaveDraft} disabled={!!busy}>
                  {busy === 'save' && <Loader2 size={16} className="animate-spin" />} Save changes
                </button>
                <button className="btn-secondary w-full" onClick={() => setConfirmUnpublish(true)} disabled={!!busy}>Unpublish</button>
                <Link to={`/blog/${slug}`} className="btn-ghost w-full"><ExternalLink size={16} /> View post</Link>
              </>
            ) : (
              <>
                <button className="btn-primary w-full" onClick={handlePublish} disabled={!!busy}>
                  {busy === 'publish' && <Loader2 size={16} className="animate-spin" />} {schedule ? 'Schedule' : 'Publish'}
                </button>
                <button className="btn-secondary w-full" onClick={handleSaveDraft} disabled={!!busy}>
                  {busy === 'save' && <Loader2 size={16} className="animate-spin" />} Save draft
                </button>
                <p className="text-xs text-ink-400">Drafts autosave a few seconds after you stop typing.</p>
              </>
            )}
          </section>

                    <section className="card p-5" aria-label="Cover image">
            <CoverImageField value={form.coverImage} onChange={(url) => update({ coverImage: url })} />
          </section>

          <section className="card space-y-4 p-5" aria-label="Category and tags">
            <FormField label="Category" htmlFor="category">
              <select id="category" className="input" value={form.category} onChange={(e) => update({ category: e.target.value })}>
                <option value="">Choose a category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Tags" htmlFor="tags" hint="Up to 5">
              <TagInput value={form.tags} onChange={(tags) => update({ tags })} suggestions={tagSuggestions} />
            </FormField>
          </section>

          <section className="card space-y-4 p-5" aria-label="SEO settings">
            <FormField label="SEO title" htmlFor="seoTitle" hint={`${form.seoTitle.length}/70. Defaults to your title.`}>
              <input id="seoTitle" className="input" maxLength={70} value={form.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} />
            </FormField>
            <FormField label="Meta description" htmlFor="seoDescription" hint={`${form.seoDescription.length}/160. Defaults to your subtitle.`}>
              <textarea id="seoDescription" rows={3} className="input" maxLength={160} value={form.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} />
            </FormField>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmUnpublish}
        title="Unpublish this post?"
        message="It will disappear from DevVerse and go back to drafts. You can publish it again any time."
        confirmLabel="Unpublish"
        danger={false}
        loading={busy === 'unpublish'}
        onConfirm={handleUnpublish}
        onCancel={() => setConfirmUnpublish(false)}
      />
    </div>
  );
}