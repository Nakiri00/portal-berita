import { useNavigate, useSearchParams } from 'react-router-dom';
import { HomePage as HomePageComponent } from '../components/HomePage';
import { useArticles } from '../contexts/ArticleContext';
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { publishedArticles } = useArticles();
  
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const handleTagClick = (tag: string) => {
    if (tag) {
      navigate(`/?tag=${encodeURIComponent(tag)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <HomePageComponent 
      onArticleClick={handleArticleClick}
      onTagClick={handleTagClick}
      selectedTag={selectedTag}
      searchQuery={searchQuery}
      publishedArticles={publishedArticles}
    />
  );
}