import { APP_TITLE } from "@/const";
import MathBlocklyWorkspace from "@/components/MathBlocklyWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🧮 Matematik Blok Editörü
            </h1>
            <p className="text-gray-600 mt-2">
              İlkokul, Ortaokul ve Lise Matematik Müfredatı ile Blok Tabanlı Programlama
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Matematik Seviyeleri Bilgi Kartları */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* İlkokul */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">🏫 İlkokul (1-4. Sınıf)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Temel sayı işlemleri</li>
                <li>• Geometrik şekiller</li>
                <li>• Alan ve çevre hesaplama</li>
                <li>• Ölçme birimleri</li>
                <li>• Basit problemler</li>
              </ul>
            </CardContent>
          </Card>

          {/* Ortaokul */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">🎓 Ortaokul (5-8. Sınıf)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Kesirler ve ondalık sayılar</li>
                <li>• Yüzde hesaplamaları</li>
                <li>• Basit denklemler</li>
                <li>• Koordinat sistemi</li>
                <li>• Olasılık ve istatistik</li>
              </ul>
            </CardContent>
          </Card>

          {/* Lise */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">🎯 Lise (9-12. Sınıf)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Polinomlar ve logaritma</li>
                <li>• Trigonometri</li>
                <li>• Türev ve integral</li>
                <li>• Matris işlemleri</li>
                <li>• Analitik geometri</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Ana Matematik Workspace */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Nasıl Kullanılır?
              </h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Yukarıdaki seviye seçiciden matematik seviyenizi belirleyin (İlkokul, Ortaokul, Lise)</li>
                <li>Sol taraftaki araç kutusundan matematik bloklarını sürükleyin</li>
                <li>Blokları birbirine bağlayarak matematik problemlerini çözün</li>
                <li>"▶️ Çalıştır" butonuna tıklayarak sonuçları görün</li>
                <li>"🗑️ Temizle" ile çalışma alanını sıfırlayabilirsiniz</li>
              </ul>
            </div>

            <MathBlocklyWorkspace />
          </div>
        </div>

        {/* Matematik Örnekleri */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* İlkokul Örnekleri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-800">🏫 İlkokul Örnekleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <strong>Toplama Problemi:</strong>
                  <p>5 + 3 = ?</p>
                  <p className="text-xs text-gray-600">Toplama bloğunu kullanarak çözün</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <strong>Alan Hesaplama:</strong>
                  <p>Kenarları 4 ve 6 olan dikdörtgenin alanı?</p>
                  <p className="text-xs text-gray-600">Alan hesaplama bloğunu kullanın</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ortaokul Örnekleri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-800">🎓 Ortaokul Örnekleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Yüzde Problemi:</strong>
                  <p>200'ün %15'i kaçtır?</p>
                  <p className="text-xs text-gray-600">Yüzde hesaplama bloğunu kullanın</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Denklem Çözme:</strong>
                  <p>2x + 5 = 13 denklemini çözün</p>
                  <p className="text-xs text-gray-600">Denklem çözme bloğunu kullanın</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lise Örnekleri */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-purple-800">🎯 Lise Örnekleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <strong>Trigonometri:</strong>
                  <p>30° açısının sinüsünü hesaplayın</p>
                  <p className="text-xs text-gray-600">Sinüs bloğunu kullanın</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <strong>Logaritma:</strong>
                  <p>log₁₀(100) = ?</p>
                  <p className="text-xs text-gray-600">Logaritma bloğunu kullanın</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Eğitim Faydaları */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🎓 Matematik Blok Editörünün Eğitim Faydaları
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Öğrenci Faydaları:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Matematiksel kavramları görsel olarak öğrenme</li>
                <li>Algoritmik düşünme becerisi geliştirme</li>
                <li>Problem çözme stratejileri öğrenme</li>
                <li>Kod yazma becerilerini geliştirme</li>
                <li>Matematik ve programlama arasındaki bağlantıyı görme</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Öğretmen Faydaları:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Etkileşimli matematik dersleri hazırlama</li>
                <li>Öğrenci ilerlemesini takip etme</li>
                <li>Farklı öğrenme stillerine uyum sağlama</li>
                <li>Teknoloji destekli eğitim verme</li>
                <li>Matematiksel kavramları somutlaştırma</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer - Telif Hakkı */}
        <div className="mt-12 bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            {/* Başlık */}
            <div className="text-center">
              <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                🔒 Telif Hakkı ve Orijinallik
              </h3>
            </div>

            {/* Ana Metin */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <p className="text-center text-lg font-medium mb-4">
                Bu platformdaki matematik blok editörü tamamen orijinal olarak <strong>Kariyer Koleji</strong> için geliştirilmiştir.
              </p>
              <p className="text-center">
                Tüm bloklar, kodlar ve içerikler sıfırdan tasarlanmış ve kodlanmıştır.
              </p>
            </div>

            {/* Uyarı */}
            <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-6">
              <h4 className="text-xl font-bold flex items-center gap-2 mb-3">
                ⚠️ Telif Hakkı Uyarısı
              </h4>
              <ul className="space-y-2">
                <li>• Platform içeriğinin kopyalanması, değiştirilmesi veya ticari amaçlı kullanımı kesinlikle <strong>yasaktır</strong>.</li>
                <li>• İzinsiz kullanım <strong>yasal yaptırımlara</strong> tabidir.</li>
              </ul>
            </div>

            {/* Alt Bilgi */}
            <div className="text-center border-t border-white/20 pt-6">
              <p className="text-lg font-semibold mb-2">
                © 2025 Kariyer Koleji - İlköğretim Kampüsü
              </p>
              <p className="text-sm opacity-90">
                Tüm Hakları Saklıdır. All Rights Reserved.
              </p>
              <p className="text-xs opacity-75 mt-2">
                matematik.aibteacher.com
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
