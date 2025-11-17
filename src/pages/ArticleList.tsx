import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { getAllArticles, Article } from '../services/articleService';
import { NewsCard } from '../components/NewsCard'; 
import { LoadingSpinner } from '../components/LoadingSpinner'; 
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination"; 

const formatTanggal = (tanggal: string | null) => {
  if (!tanggal) return 'Baru saja';
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export function ArticleList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(1);
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { kategori } = useParams<{ kategori: string }>();
  const selectedTag = kategori || '';

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await getAllArticles({ 
          page: currentPage, 
          limit: 15,
          status: 'published',
          tag: selectedTag  
        });
        
        if (response.success && response.data) {
          setArticles(response.data.articles);
          setPagination(response.data.pagination.pages);
        } else {
          setArticles([]);
          setPagination(1);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, selectedTag]); 

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {selectedTag ? ` Artikel ${selectedTag}` : 'Semua Artikel'}
      </h1>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard
                  key={article._id}
                  id={article._id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  imageUrl={article.featuredImage}
                  author={article.authorName}
                  publishDate={formatTanggal(article.publishedAt)}
                  tag={article.category}
                  readCount={article.views}
                  isHeadline={article.isFeatured}
                  onClick={() => handleArticleClick(article._id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              {selectedTag 
                ? `Tidak ada artikel ditemukan untuk kategori "${selectedTag}".`
                : 'Tidak ada artikel untuk ditampilkan.'
              }
            </p>
          )}

          {pagination > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination }, (_, i) => i + 1).map(pageNumber => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNumber);
                        }}
                        isActive={pageNumber === currentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === pagination ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}