export function TentangPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl mb-4 sm:mb-6">Tentang Kamus Mahasiswa</h1>
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Kamus Mahasiswa adalah portal berita yang didedikasikan untuk mahasiswa Indonesia. 
            Kami menyediakan informasi terkini, tips belajar, dan panduan kehidupan kampus.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Misi kami adalah mendukung perjalanan akademik mahasiswa dengan konten yang berkualitas dan relevan.
          </p>
          
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl mb-4">Visi & Misi</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg mb-2">Visi</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  Menjadi platform informasi terdepan yang mendukung kesuksesan akademik dan personal mahasiswa Indonesia.
                </p>
              </div>
              <div>
                <h3 className="text-lg mb-2">Misi</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                  <li>• Menyediakan konten berkualitas dan terkini</li>
                  <li>• Membangun komunitas mahasiswa yang solid</li>
                  <li>• Mendukung pengembangan diri mahasiswa</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl mb-4">Tim Kami</h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Kamus Mahasiswa dikelola oleh tim yang terdiri dari mahasiswa, alumni, dan praktisi pendidikan 
              yang berpengalaman dalam dunia akademik dan jurnalistik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}