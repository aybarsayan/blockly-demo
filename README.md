# 🧮 Matematik Blok Editörü - Eğitim Odaklı Blok Programlama

Google Blockly kullanılarak oluşturulmuş, **MEB müfredatına uygun** matematik eğitimi platformu. İlkokul, ortaokul ve lise seviyelerinde matematik öğretimi için görsel blok tabanlı programlama aracı.

## ✨ Özellikler

### 1. 🧮 Matematik Blok Editörü (Ana Sayfa)

#### 📚 Seviye Bazlı İçerik:

**🏫 İlkokul (1-4. Sınıf)**
- ✅ Temel sayı işlemleri (toplama, çıkarma, çarpma, bölme)
- ✅ Geometrik şekiller (kare, dikdörtgen, üçgen, daire)
- ✅ Alan ve çevre hesaplama
- ✅ Ölçme birimleri ve dönüşümler
- ✅ Basamak değeri ve çift-tek sayı kontrolü
- ✅ Çarpım tablosu

**🎓 Ortaokul (5-8. Sınıf)**
- ✅ Kesirler ve ondalık sayılar
- ✅ Yüzde hesaplamaları
- ✅ Basit denklemler ve oran-orantı
- ✅ Koordinat sistemi
- ✅ Olasılık ve istatistik
- ✅ Kümeler ve mantık işlemleri

**🎯 Lise (9-12. Sınıf)**
- ✅ Polinomlar ve logaritma
- ✅ Trigonometri (sin, cos, tan)
- ✅ Türev ve integral
- ✅ Matris işlemleri (toplama, çarpma, determinant)
- ✅ Analitik geometri
- ✅ Kompleks sayılar

#### 🎯 Diğer Özellikler:
- ✅ Matematik görselleştirme (geometrik şekiller, grafikler, fonksiyonlar)
- ✅ Etkileşimli matematik problemleri
- ✅ İpucu sistemi ve başarı takibi
- ✅ Workspace kaydetme/yükleme (XML formatı)
- ✅ JavaScript kod üretimi ve güvenli çalıştırma
- ✅ Türkçe dil desteği

### 2. 🎨 Özel Sürükle-Bırak Demo (/custom)
- ✅ HTML5 Drag & Drop API ile sıfırdan geliştirilmiş
- ✅ Canvas üzerinde blokları serbestçe hareket ettirme
- ✅ Farklı blok tipleri (Başla, İşlem, Koşul, Döngü, Bitir)
- ✅ Otomatik kod üretimi
- ✅ Demo amaçlı görsel programlama örneği

## Kurulum

### Gereksinimler
- Node.js 18+
- pnpm (veya npm/yarn)

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
pnpm install
```

2. Geliştirme sunucusunu başlatın:
```bash
pnpm dev
```

3. Tarayıcınızda açın:
```
http://localhost:3000
```

## Proje Yapısı

```
blockly-demo/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BlocklyWorkspace.tsx    # Blockly entegrasyonu
│   │   │   ├── CustomDragDrop.tsx      # Özel drag-drop sistemi
│   │   │   └── ui/                      # shadcn/ui bileşenleri
│   │   ├── pages/
│   │   │   ├── Home.tsx                 # Ana sayfa (Blockly)
│   │   │   └── CustomDemo.tsx           # Özel sistem sayfası
│   │   ├── App.tsx                      # Router yapılandırması
│   │   └── index.css                    # Global stiller
│   └── public/                          # Statik dosyalar
├── package.json
└── vite.config.ts
```

## 📖 Kullanım

### 🧮 Matematik Blok Editörü (Ana Sayfa)

#### Blok Editörü Sekmesi:
1. **Seviye Seçimi**: Üst kısımdaki dropdown'dan matematik seviyenizi seçin (İlkokul, Ortaokul, Lise)
2. **Blok Sürükleme**: Sol taraftaki araç kutusundan matematik bloklarını sürükleyin
3. **Problem Oluşturma**: Blokları birbirine bağlayarak matematik problemlerini çözün
4. **Kod Üretme**: "Kod Üret" butonuna tıklayarak JavaScript kodunu görün
5. **Çalıştırma**: "Çalıştır" butonuna tıklayarak sonuçları test edin
6. **Kaydetme/Yükleme**: Çalışmanızı XML formatında kaydedin veya yükleyin

#### Etkileşimli Problemler Sekmesi:
1. **Seviye Seçimi**: İlkokul, Ortaokul veya Lise seviyesini seçin
2. **Problem Seçme**: Listeden bir problem seçip "Başla" butonuna tıklayın
3. **Cevaplama**: Cevabınızı girin ve "Kontrol Et" butonuna tıklayın
4. **İpucu**: Zorlanırsanız "İpucu Göster" butonunu kullanın
5. **İlerleme**: Skorunuzu ve başarı oranınızı takip edin

### 🎨 Özel Sürükle-Bırak Demo (/custom)

1. Sol taraftaki blokları canvas'a sürükleyin
2. Canvas üzerinde blokları hareket ettirin
3. "Kod Üret" ile JavaScript kodu oluşturun
4. Blok istatistiklerini görüntüleyin
5. "Temizle" ile canvas'ı sıfırlayın

## Teknolojiler

- **React 19** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Blockly 12.3.1** - Blok tabanlı programlama kütüphanesi
- **Tailwind CSS 4** - Stil framework'ü
- **shadcn/ui** - UI bileşenleri
- **Vite** - Build tool
- **Wouter** - Routing

## 🎯 Eğitim Hedefleri

Bu platform şu becerilerin geliştirilmesini hedefler:

### Öğrenciler için:
- ✅ Matematiksel kavramları görsel olarak öğrenme
- ✅ Algoritmik düşünme becerisi geliştirme
- ✅ Problem çözme stratejileri öğrenme
- ✅ Soyut matematiksel kavramları somutlaştırma
- ✅ Matematik ve teknoloji arasındaki bağlantıyı keşfetme

### Öğretmenler için:
- ✅ Etkileşimli matematik dersleri hazırlama
- ✅ Öğrenci ilerlemesini takip etme
- ✅ Farklı öğrenme stillerine uyum sağlama
- ✅ Teknoloji destekli eğitim verme
- ✅ MEB müfredatına uygun içerik kullanma

## 🔧 Geliştirme

### Yeni Matematik Bloğu Ekleme

`client/src/components/MathBlocklyWorkspace.tsx` dosyasında yeni matematik blokları ekleyebilirsiniz:

```typescript
// Örnek: Üslü sayı bloğu
const liseBlocks = {
  'uslu_sayi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("BASE")
          .setCheck("Number")
          .appendField("Üslü sayı:");
      this.appendValueInput("EXPONENT")
          .setCheck("Number")
          .appendField("üssü:");
      this.setOutput(true, "Number");
      this.setColour(260);
      this.setTooltip("Bir sayının üssünü hesaplar");
    }
  }
};

// Kod üretici
javascriptGenerator.forBlock['uslu_sayi'] = function(block, generator) {
  const base = generator.valueToCode(block, 'BASE', 0) || '0';
  const exponent = generator.valueToCode(block, 'EXPONENT', 0) || '0';
  return [`Math.pow(${base}, ${exponent})`, 0];
};
```

### Yeni Matematik Problemi Ekleme

`client/src/components/InteractiveMathProblems.tsx` dosyasında `mathProblems` array'ine yeni problemler ekleyin:

```typescript
{
  id: 'ilkokul-4',
  level: 'ilkokul',
  category: 'Bölme',
  question: '24 elmayı 6 kişiye eşit bölerseniz her kişiye kaç elma düşer?',
  answer: 4,
  explanation: '24 ÷ 6 = 4 elma',
  hints: ['Bölme işlemi yapmanız gerekiyor', '24 ÷ 6 = ?']
}
```

## Kaynaklar

- [Google Blockly Dokümantasyonu](https://developers.google.com/blockly)
- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [React Dokümantasyonu](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📝 Lisans

Bu proje eğitim amaçlı oluşturulmuştur.

## 👥 Katkıda Bulunma

Projeye katkıda bulunmak isterseniz:
1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 🙏 Teşekkürler

- [Google Blockly](https://developers.google.com/blockly) - Blok programlama altyapısı
- [shadcn/ui](https://ui.shadcn.com/) - UI bileşenleri
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

