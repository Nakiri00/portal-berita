import { useParams, useNavigate } from 'react-router-dom';
import { AuthorProfile } from '../components/AuthorProfile';

export function AuthorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Always go to homepage for reliable navigation
    try {
      navigate('/');
    } catch (error) {
      window.location.href = '/';
    }
  };

  const handleArticleClick = (articleId: string) => {
    try {
      navigate(`/article/${articleId}`);
    } catch (error) {
      window.location.href = `/article/${articleId}`;
    }
  };

  if (!id) {
    navigate('/');
    return null;
  }

  return (
    <AuthorProfile 
      authorId={id}
      onBackClick={handleBackClick}
      onArticleClick={handleArticleClick}
    />
  );
}