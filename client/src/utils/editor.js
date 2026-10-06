export const emptyForm = {
  title: '', subtitle: '', content: '', coverImage: '',
  category: '', tags: [], seoTitle: '', seoDescription: '',
};

export const formFromBlog = (blog) => ({
  title: blog.title || '',
  subtitle: blog.subtitle || '',
  content: blog.content || '',
  coverImage: blog.coverImage || '',
  category: blog.category?._id || '',
  tags: (blog.tags || []).map((t) => t.name),
  seoTitle: blog.seo?.title || '',
  seoDescription: blog.seo?.description || '',
});

export const toPayload = (form) => ({ ...form, category: form.category || null });

export const textLength = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().length;

export const hasContent = (form) =>
  form.title.trim() !== '' || textLength(form.content) > 0 || /<(img|hr|table)/.test(form.content);

// Mirrors the server's publish rules so people see problems before clicking Publish
export const getProblems = (form) => {
  const problems = [];
  if (form.title.trim().length < 5) problems.push('Add a title (at least 5 characters)');
  if (textLength(form.content) < 50) problems.push('Write at least a few sentences of content');
  if (!form.category) problems.push('Choose a category');
  if (!form.coverImage.trim()) problems.push('Add a cover image');
  return problems;
};