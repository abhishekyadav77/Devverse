import BlogEditor from '../../components/editor/BlogEditor.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function Write() {
  useDocumentTitle('Write | DevVerse');
  return <BlogEditor />;
}