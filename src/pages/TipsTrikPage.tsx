import { useNavigate } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { useArticles } from '../contexts/ArticleContext';

export function TipsTrikPage() {
  const navigate = useNavigate();
  const { publishedArticles } = useArticles();

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <HomePage 
      onArticleClick={handleArticleClick}
      onTagClick={handleTagClick}
      selectedTag="Tips & Trik"
      searchQuery=""
      pageTitle="Tips & Trik"
      pageDescription="Kumpulan tips dan trik untuk mahasiswa"
      publishedArticles={publishedArticles}
    />
  );
}