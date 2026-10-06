import { useParams } from 'react-router-dom';
import TaxonomyListing from '../../components/blog/TaxonomyListing.jsx';
import { getTag } from '../../services/taxonomyService.js';

export default function Tag() {
  const { slug } = useParams();
  return <TaxonomyListing kind="tag" slug={slug} fetchMeta={getTag} filterKey="tag" />;
}