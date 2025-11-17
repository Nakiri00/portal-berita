import { Link, useLocation, useSearchParams, useParams } from 'react-router-dom';
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import { useEffect } from 'react';

export function Breadcrumb() {
  const location = useLocation();
  const params = useParams();
  const { dynamicCrumbs, clearDynamicCrumbs } = useBreadcrumb();

  useEffect(() => {
    if (!location.pathname.startsWith('/articles/')) {
      clearDynamicCrumbs();
    }
  }, [location, clearDynamicCrumbs]);

  if (location.pathname.startsWith('/articles/')) {
    return (
      <div className="bg-gray-100">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <ShadcnBreadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Beranda</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/articles">Artikel</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {dynamicCrumbs.length > 0 ? (
                dynamicCrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbSeparator />
                    {index === dynamicCrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        {crumb.path ? (
                          <Link to={crumb.path}>{crumb.label}</Link>
                        ) : (
                          <span>{crumb.label}</span> 
                        )}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))
              ) : (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Memuat...</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </ShadcnBreadcrumb>
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith('/articles')) {
    // 3. Ambil 'kategori' dari 'params'
    const { kategori } = params as { kategori?: string }; 

    return (
      <div className="bg-gray-100">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <ShadcnBreadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Beranda</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />

              {kategori ? (
                // Jika path-nya /artikel/tips-trik
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/articles">Artikel</Link></BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{kategori}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                // Jika path-nya /artikel
                <BreadcrumbItem>
                  <BreadcrumbPage>Artikel</BreadcrumbPage>
                </BreadcrumbItem>
              )}
              
            </BreadcrumbList>
          </ShadcnBreadcrumb>
        </div>
      </div>
    );
  }

  // Jangan tampilkan breadcrumb di halaman utama
  const pathnames = location.pathname.split('/').filter((x) => x);
  if (pathnames.length === 0) {
    return null;
  }

  // Fallback untuk halaman lain 
  // return (
  //   <div className="bg-gray-100">
       
  //   </div>
  // );
}