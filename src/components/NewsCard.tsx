import { Badge } from './ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000' ;

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishDate: string;
  tag: string;
  readCount: number;
  isHeadline?: boolean;
  isNew?: boolean;
  forceStandard?: boolean;
  onClick: () => void;
}

export function NewsCard({ 
  title, 
  excerpt, 
  imageUrl, 
  author, 
  publishDate, 
  tag, 
  readCount,
  isHeadline = false,
  isNew = false,
  forceStandard = false, 
  onClick 
}: NewsCardProps) {
  
  const showHeadlineLayout = isHeadline && !forceStandard;

  return (
    <article 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
        showHeadlineLayout ? 'lg:col-span-3' : '' 
      }`}
      onClick={onClick}
    >
      <div className={`${showHeadlineLayout ? 'lg:flex lg:h-80' : ''}`}>
        <div className={`${showHeadlineLayout ? 'lg:w-1/2' : ''}`}>
          <img 
            src={`${API_BASE_URL}${imageUrl}`} 
            alt={title}
            className={`w-full object-cover ${
              showHeadlineLayout ? 'h-48 sm:h-56 lg:h-full' : 'h-36 sm:h-48'
            }`}
          />
        </div>
        
        <div className={`p-4 sm:p-6 ${showHeadlineLayout ? 'lg:w-1/2 lg:flex lg:flex-col lg:justify-between' : ''}`}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={tag === 'Tips & Trik' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {tag}
                </Badge>
                {isNew && (
                  <Badge variant="destructive" className="text-xs">
                    TERBARU
                  </Badge>
                )}
              </div>
              {isHeadline && (
                <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-600">
                  HEADLINE
                </Badge>
              )}
            </div>
            
            <h3 className={`mb-2 sm:mb-3 text-gray-900 hover:text-blue-600 font-semibold leading-tight line-clamp-2 ${
              showHeadlineLayout ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg'
            }`}>
              {title}
            </h3>
            
            <p className={`text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed ${
              showHeadlineLayout ? 'text-sm sm:text-base' : 'text-sm'
            }`}>
              {excerpt}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs text-gray-500">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="truncate">{author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{publishDate}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{(readCount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
