import { useNavigate } from 'react-router-dom';
import { MyAccount } from '../components/MyAccount';
import { WriterAccount } from '../components/WriterAccount';

interface MyAccountPageProps {
  userProfile: {
    name: string;
    email: string;
    avatar: string;
  };
  onUpdateProfile: (profile: any) => void;
  isWriter: boolean;
}

export function MyAccountPage({ userProfile, onUpdateProfile, isWriter }: MyAccountPageProps) {
  const navigate = useNavigate();

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  return isWriter ? (
    <WriterAccount 
      userProfile={userProfile}
      onUpdateProfile={onUpdateProfile}
      onArticleClick={handleArticleClick}
    />
  ) : (
    <MyAccount 
      userProfile={userProfile}
      onUpdateProfile={onUpdateProfile}
      onArticleClick={handleArticleClick}
    />
  );
}