import { useNavigate, useSearchParams } from 'react-router-dom';
import { HomePage as HomePageComponent } from '../components/HomePage';
import { useArticles } from '../contexts/ArticleContext';
import { useEffect } from 'react';

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { publishedArticles, fetchArticles } = useArticles();
  
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const tagQuery = selectedTag ? selectedTag.toLowerCase() : ''; 

    fetchArticles({ tag: tagQuery, search: searchQuery }); 
  }, [selectedTag, searchQuery, fetchArticles]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const handleTagClick = (tag: string) => {
    // Kirim tag mentah ke URL (untuk tampilan yang lebih baik)
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
