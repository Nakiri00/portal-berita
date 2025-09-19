import { useNavigate } from 'react-router-dom';
import { WriterPage as WriterPageComponent } from '../components/WriterPage';
import { useArticles } from '../contexts/ArticleContext';

export function WriterPage() {
  const navigate = useNavigate();
  const { publishArticle } = useArticles();

  const handleBackClick = () => {
    navigate('/');
  };

  const handlePublish = (article: any) => {
    publishArticle(article);
    navigate('/'); // Redirect to home after publishing
  };

  return (
    <WriterPageComponent 
      onBackClick={handleBackClick}
      onPublish={handlePublish}
    />
  );
}