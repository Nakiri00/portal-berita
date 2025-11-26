import { Link, useLocation } from 'react-router-dom';
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
  const { dynamicCrumbs, clearDynamicCrumbs } = useBreadcrumb();

  // Bersihkan breadcrumb jika kita keluar dari halaman-halaman artikel
  useEffect(() => {
    // Jika URL BUKAN berawalan /article (baik list maupun detail)
    if (!location.pathname.startsWith('/article')) {
      clearDynamicCrumbs();
    }
  }, [location.pathname, clearDynamicCrumbs]);

  // Jika ada dynamic crumbs (dari ArticleList atau ArticlePage), tampilkan
  if (dynamicCrumbs.length > 0) {
    return (
      <div className="bg-gray-100">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <ShadcnBreadcrumb>
            <BreadcrumbList>
              {/* Selalu mulai dengan Beranda */}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Beranda</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {/* Render sisa breadcrumb dari context */}
              {dynamicCrumbs.map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbSeparator />
                  {/* Jika ini item terakhir ATAU path-nya kosong, render sebagai Teks (Page) */}
                  {index === dynamicCrumbs.length - 1 || !crumb.path ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </ShadcnBreadcrumb>
        </div>
      </div>
    );
  }

  return null;
}