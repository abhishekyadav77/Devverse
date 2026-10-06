import { useParams } from 'react-router-dom';
import TaxonomyListing from '../../components/blog/TaxonomyListing.jsx';
import { getCategory } from '../../services/taxonomyService.js';

export default function Category() {
  const { slug } = useParams();
  return <TaxonomyListing kind="category" slug={slug} fetchMeta={getCategory} filterKey="category" />;
}