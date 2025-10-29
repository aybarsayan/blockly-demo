import CustomDragDrop from "@/components/CustomDragDrop";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎨 Özel Sürükle-Bırak Demo
              </h1>
              <p className="text-gray-600 mt-2">
                HTML5 Drag & Drop API ile Sıfırdan Oluşturulmuş Sistem
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                ← Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Özellikler
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>HTML5 Drag and Drop API kullanılarak sıfırdan geliştirildi</li>
              <li>Blokları araç kutusundan canvas'a sürükleyip bırakın</li>
              <li>Canvas üzerinde blokları serbestçe hareket ettirin</li>
              <li>Her blok türü farklı renk ve özelliklere sahip</li>
              <li>Blokları silme ve canvas'ı temizleme özellikleri</li>
              <li>Blok akışından otomatik kod üretimi</li>
            </ul>
          </div>

          <CustomDragDrop />
        </div>

        {/* Teknik Bilgi */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Teknik Detaylar
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Kullanılan Teknolojiler:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>React 19 + TypeScript</li>
                <li>HTML5 Drag and Drop API</li>
                <li>React Hooks (useState, useRef, useEffect)</li>
                <li>Tailwind CSS</li>
                <li>shadcn/ui bileşenleri</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Temel Event'ler:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">onDragStart</code> - Sürükleme başlangıcı</li>
                <li><code className="bg-gray-100 px-1 rounded">onDragOver</code> - Sürükleme devam ediyor</li>
                <li><code className="bg-gray-100 px-1 rounded">onDrop</code> - Bırakma işlemi</li>
                <li><code className="bg-gray-100 px-1 rounded">onMouseDown/Move/Up</code> - Canvas içi hareket</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Bu sistem HTML5 Drag and Drop API kullanılarak sıfırdan geliştirilmiştir.
            <a 
              href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline ml-1"
            >
              MDN Dokümantasyonu
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

