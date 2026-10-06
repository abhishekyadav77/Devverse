import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BlogEditor from '../../components/editor/BlogEditor.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { getBlogForEdit } from '../../services/blogService.js';

export default function EditPost() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, blog: null, error: '' });
  useDocumentTitle('Edit post | DevVerse');

  useEffect(() => {
    let active = true;
    setState({ loading: true, blog: null, error: '' });
    getBlogForEdit(id)
      .then((blog) => active && setState({ loading: false, blog, error: '' }))
      .catch((err) => active && setState({ loading: false, blog: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [id]);

  if (state.loading) return <Spinner />;
  if (state.error) {
    return (
      <EmptyState
        title="Could not open this post"
        text={state.error}
        action={<Link to="/dashboard/posts" className="btn-primary">Back to my posts</Link>}
      />
    );
  }
  return <BlogEditor key={state.blog._id} initialBlog={state.blog} />;
}