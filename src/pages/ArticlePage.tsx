import { useParams, useNavigate } from 'react-router-dom';
import { ArticlePage as ArticlePageComponent } from '../components/ArticlePage';
import { useAuth } from '../contexts/AuthContext';

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, addToReadingHistory, saveArticle, isArticleSaved, unsaveArticle } = useAuth();

  const handleBackClick = () => {
    try {
      navigate(-1);
    } catch (error) {
      window.location.href = '/';
    }
  };

  const handleAuthorClick = (authorId: string) => {
    try {
      navigate(`/author/${authorId}`);
    } catch (error) {
      window.location.href = `/author/${authorId}`;
    }
  };

  if (!id) {
    navigate('/');
    return null;
  }

  return (
    <ArticlePageComponent 
      articleId={id}
      onBackClick={handleBackClick}
      onAuthorClick={handleAuthorClick}
      isLoggedIn={isLoggedIn}
      onAddToHistory={addToReadingHistory}
      onSaveArticle={saveArticle}
      onUnsaveArticle={unsaveArticle}
      isArticleSaved={isArticleSaved}
    />
  );
}