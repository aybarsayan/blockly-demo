import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import * as libraryBlocks from 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as Tr from 'blockly/msg/tr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MathVisualization from './MathVisualization';

// Türkçe dil desteğini ayarla
Blockly.setLocale(Tr as any);

// Matematik seviye seçimi
type MathLevel = 'ilkokul' | 'ortaokul' | 'lise';

// Ortak Hesaplama Blokları (Tüm Seviyeler)
const commonBlocks = {
  'hesapla_goster': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck(null)
          .appendField("🧮 Hesapla ve göster:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Değeri hesaplayıp sonucu gösterir");
      this.setHelpUrl("");
    }
  },
  'sonuc_goster': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck(null)
          .appendField("📊 Sonuç:");
      this.appendDummyInput()
          .appendField("= ?");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Hesaplama sonucunu ekranda gösterir");
      this.setHelpUrl("");
    }
  }
};

// İlkokul Matematik Blokları (MEB Müfredatına Göre)
const ilkokulBlocks = {
  'sayi_okuma': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Sayıyı oku:")
          .appendField(new Blockly.FieldNumber(0), "NUMBER");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Sayıyı kelimelerle okur");
    }
  },
  'basamak_deger': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Basamak değeri bul:");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Birler", "1"],
            ["Onlar", "10"],
            ["Yüzler", "100"],
            ["Binler", "1000"]
          ]), "PLACE");
      this.setOutput(true, "Number");
      this.setColour(200);
      this.setTooltip("Sayının basamak değerini bulur");
    }
  },
  'cift_tek': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Çift mi Tek mi:");
      this.setOutput(true, "String");
      this.setColour(200);
      this.setTooltip("Sayının çift veya tek olduğunu söyler");
    }
  },
  'buyuk_kucuk': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Büyüklük karşılaştır:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("ile");
      this.setOutput(true, "String");
      this.setColour(200);
      this.setTooltip("İki sayıyı karşılaştırır");
    }
  },
  'carpim_tablosu': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Çarpım tablosu:")
          .appendField(new Blockly.FieldNumber(2, 1, 10), "NUMBER");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Çarpım tablosunu gösterir");
    }
  },
  'uzunluk_donusum': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck("Number")
          .appendField("Uzunluk dönüştür:");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Metre → Santimetre", "m_cm"],
            ["Metre → Kilometre", "m_km"],
            ["Santimetre → Metre", "cm_m"],
            ["Kilometre → Metre", "km_m"]
          ]), "CONVERSION");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Uzunluk birimlerini dönüştürür");
    }
  },
  'zaman_donusum': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck("Number")
          .appendField("Zaman dönüştür:");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Saat → Dakika", "h_m"],
            ["Dakika → Saniye", "m_s"],
            ["Saat → Saniye", "h_s"],
            ["Gün → Saat", "d_h"]
          ]), "CONVERSION");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Zaman birimlerini dönüştürür");
    }
  },
  'cevre_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Çevre hesapla:")
          .appendField(new Blockly.FieldDropdown([
            ["Kare", "kare"],
            ["Dikdörtgen", "dikdortgen"]
          ]), "SHAPE");
      this.appendValueInput("SIDE1")
          .setCheck("Number")
          .appendField("Kenar 1:");
      this.appendValueInput("SIDE2")
          .setCheck("Number")
          .appendField("Kenar 2:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Şeklin çevresini hesaplar");
    }
  },
  'para_hesap': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("AMOUNT")
          .setCheck("Number")
          .appendField("Para hesabı:");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["TL", "TL"],
            ["Kuruş", "Kurus"],
            ["TL → Kuruş", "TL_Kurus"],
            ["Kuruş → TL", "Kurus_TL"]
          ]), "OPERATION");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Para işlemleri yapar");
    }
  },
  'toplama': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Toplama:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("+");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("İki sayıyı toplar");
    }
  },
  'cikarma': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Çıkarma:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("-");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("İki sayıyı çıkarır");
    }
  },
  'carpma': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Çarpma:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("×");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("İki sayıyı çarpar");
    }
  },
  'bolme': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Bölme:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("÷");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("İki sayıyı böler");
    }
  },
  'kare_alan': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("KENAR")
          .setCheck("Number")
          .appendField("🟦 Kare alanı - Kenar:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Kare alanı = Kenar × Kenar");
    }
  },
  'dikdortgen_alan': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("GENISLIK")
          .setCheck("Number")
          .appendField("🟩 Dikdörtgen alanı - Genişlik:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Dikdörtgen alanı = Genişlik × Yükseklik");
    }
  },
  'ucgen_alan': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("TABAN")
          .setCheck("Number")
          .appendField("🔺 Üçgen alanı - Taban:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Üçgen alanı = (Taban × Yükseklik) / 2");
    }
  },
  'daire_alan': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🔵 Daire alanı - Yarıçap (r):");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Daire alanı = π × r²");
    }
  },
  'daire_cevre': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🔵 Daire çevresi - Yarıçap (r):");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Daire çevresi = 2 × π × r");
    }
  },
  'daire_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🎨 Daire ÇİZ ve HESAPLA - Yarıçap:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Daireyi çizer, alan ve çevre hesaplar");
    }
  },
  'dikdortgen_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("GENISLIK")
          .setCheck("Number")
          .appendField("🎨 Dikdörtgen ÇİZ ve HESAPLA - Genişlik:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Dikdörtgeni çizer, alan ve çevre hesaplar");
    }
  },
  'kare_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("KENAR")
          .setCheck("Number")
          .appendField("🎨 Kare ÇİZ ve HESAPLA - Kenar:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Kareyi çizer, alan ve çevre hesaplar");
    }
  },
  'ucgen_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("TABAN")
          .setCheck("Number")
          .appendField("🎨 Üçgen ÇİZ ve HESAPLA - Taban:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Üçgeni çizer, alan hesaplar");
    }
  },
  'kare_ciz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("KENAR")
          .setCheck("Number")
          .appendField("🟦 Kare çiz - Kenar:");
      this.appendValueInput("X")
          .setCheck("Number")
          .appendField("X:");
      this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Belirtilen konumda kare çizer");
    }
  },
  'dikdortgen_ciz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("GENISLIK")
          .setCheck("Number")
          .appendField("🟩 Dikdörtgen çiz - Genişlik:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.appendValueInput("X")
          .setCheck("Number")
          .appendField("X:");
      this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Belirtilen konumda dikdörtgen çizer");
    }
  },
  'ucgen_ciz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("TABAN")
          .setCheck("Number")
          .appendField("🔺 Üçgen çiz - Taban:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.appendValueInput("X")
          .setCheck("Number")
          .appendField("X:");
      this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Belirtilen konumda üçgen çizer");
    }
  },
  'daire_ciz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🔵 Daire çiz - Yarıçap (r):");
      this.appendValueInput("X")
          .setCheck("Number")
          .appendField("Merkez X:");
      this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Merkez Y:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Belirtilen merkezde daire çizer");
    }
  },
  // Sıvı Ölçüleri
  'sivi_donusum': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck("Number")
          .appendField("Sıvı dönüştür:");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Litre → Mililitre", "l_ml"],
            ["Mililitre → Litre", "ml_l"]
          ]), "CONVERSION");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Sıvı ölçü birimlerini dönüştürür");
    }
  },
  // Ağırlık Ölçüleri
  'agirlik_donusum': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck("Number")
          .appendField("Ağırlık dönüştür:");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["Kilogram → Gram", "kg_g"],
            ["Gram → Kilogram", "g_kg"],
            ["Ton → Kilogram", "t_kg"],
            ["Kilogram → Ton", "kg_t"]
          ]), "CONVERSION");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Ağırlık birimlerini dönüştürür");
    }
  },
  // Açı Ölçme
  'aci_olc': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Açı ölç:")
          .appendField(new Blockly.FieldNumber(90, 0, 360), "DEGREE")
          .appendField("derece");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Açı ölçer");
    }
  },
  'aci_turu': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("Açı türü:");
      this.setOutput(true, "String");
      this.setColour(120);
      this.setTooltip("Açının türünü bulur (dar, dik, geniş)");
    }
  },
  // Simetri
  'simetri_eksen': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Simetri ekseni çiz:")
          .appendField(new Blockly.FieldDropdown([
            ["Dikey", "vertical"],
            ["Yatay", "horizontal"],
            ["Çapraz", "diagonal"]
          ]), "AXIS");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Simetri ekseni çizer");
    }
  },
  // Veri ve Grafik
  'veri_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Veri topla:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip("Veri toplar");
    }
  },
  'sutun_grafik': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Sütun grafiği çiz:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip("Sütun grafiği çizer");
    }
  },
};

// Ortaokul Matematik Blokları (MEB Müfredatına Göre - 5-8. Sınıf)
const ortaokulBlocks = {
  'ebob_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("EBOB hesapla:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("ve");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("İki sayının En Büyük Ortak Bölenini bulur");
    }
  },
  'ekok_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("EKOK hesapla:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("ve");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("İki sayının En Küçük Ortak Katını bulur");
    }
  },
  'uslu_sayi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("BASE")
          .setCheck("Number")
          .appendField("Üslü sayı:");
      this.appendValueInput("EXPONENT")
          .setCheck("Number")
          .appendField("^");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Üslü sayı hesaplar (taban^üs)");
    }
  },
  'karekök': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("√ Karekök:");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Karekök hesaplar");
    }
  },
  'kupkok': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("∛ Küpkök:");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Küpkök hesaplar");
    }
  },
  'mutlak_deger': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("|x| Mutlak Değer:");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Mutlak değer hesaplar");
    }
  },
  'asal_mi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Asal mı:");
      this.setOutput(true, "Boolean");
      this.setColour(200);
      this.setTooltip("Sayının asal olup olmadığını kontrol eder");
    }
  },
  'carpanlara_ayir': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Çarpanlarına ayır:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Sayıyı asal çarpanlarına ayırır");
    }
  },
  'kesir_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Kesir toplama:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("+");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("İki kesri toplar");
    }
  },
  'kesir_olustur': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("PAY")
          .setCheck("Number")
          .appendField("Kesir oluştur - Pay:");
      this.appendValueInput("PAYDA")
          .setCheck("Number")
          .appendField("Payda:");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("Kesir oluşturur (pay/payda)");
    }
  },
  'kesir_sadeles': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("PAY")
          .setCheck("Number")
          .appendField("Kesri sadeleştir - Pay:");
      this.appendValueInput("PAYDA")
          .setCheck("Number")
          .appendField("Payda:");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("Kesri sadeleştirir");
    }
  },
  'ondalik_cevir': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FRACTION")
          .setCheck("Number")
          .appendField("Kesri ondalığa çevir:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Kesri ondalık sayıya çevirir");
    }
  },
  'yuzde_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Yüzde hesapla:");
      this.appendValueInput("PERCENT")
          .setCheck("Number")
          .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Bir sayının yüzdesini hesaplar");
    }
  },
  'denklem_coz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Denklem çöz: ");
      this.appendDummyInput()
          .appendField("x +");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("=");
      this.appendValueInput("C")
          .setCheck("Number");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip("Basit denklem çözer");
    }
  },
  'koordinat_ciz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("X")
          .setCheck("Number")
          .appendField("Koordinat çiz:");
      this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Koordinat düzleminde nokta çizer");
    }
  },
  'olasilik_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FAVORABLE")
          .setCheck("Number")
          .appendField("Olasılık hesapla:");
      this.appendValueInput("TOTAL")
          .setCheck("Number")
          .appendField("/");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip("Olasılık hesaplar");
    }
  },
  'grafik_ciz': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Grafik çiz:")
          .appendField(new Blockly.FieldDropdown([
            ["Çubuk Grafik", "bar"],
            ["Pasta Grafik", "pie"],
            ["Çizgi Grafik", "line"]
          ]), "CHART_TYPE");
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Veri:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip("Veri grafiği çizer");
    }
  },
  // Cebirsel İfadeler
  'cebirsel_ifade': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("COEFFICIENT")
          .setCheck("Number")
          .appendField("Cebirsel ifade:");
      this.appendDummyInput()
          .appendField("x +");
      this.appendValueInput("CONSTANT")
          .setCheck("Number");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("Cebirsel ifade oluşturur (ax + b)");
    }
  },
  'cebirsel_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("EXPR1")
          .setCheck("String")
          .appendField("Cebirsel toplama:");
      this.appendValueInput("EXPR2")
          .setCheck("String")
          .appendField("+");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("İki cebirsel ifadeyi toplar");
    }
  },
  // Denklemler ve Eşitsizlikler
  'denklem_1_bilinmeyen': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Denklem çöz:");
      this.appendDummyInput()
          .appendField("x +");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("=");
      this.appendValueInput("C")
          .setCheck("Number");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Birinci derece denklem çözer: ax + b = c");
    }
  },
  'denklem_sistemi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A1")
          .setCheck("Number")
          .appendField("Denklem sistemi:");
      this.appendDummyInput()
          .appendField("x +");
      this.appendValueInput("B1")
          .setCheck("Number")
          .appendField("y =");
      this.appendValueInput("C1")
          .setCheck("Number");
      this.appendValueInput("A2")
          .setCheck("Number")
          .appendField("ve");
      this.appendDummyInput()
          .appendField("x +");
      this.appendValueInput("B2")
          .setCheck("Number")
          .appendField("y =");
      this.appendValueInput("C2")
          .setCheck("Number");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("İki bilinmeyenli denklem sistemi çözer");
    }
  },
  'esitsizlik': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Eşitsizlik çöz:");
      this.appendDummyInput()
          .appendField("x");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            [">", "greater"],
            ["<", "less"],
            ["≥", "greater_equal"],
            ["≤", "less_equal"]
          ]), "OPERATOR");
      this.appendValueInput("B")
          .setCheck("Number");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("Eşitsizlik çözer (ax > b, ax < b, vb.)");
    }
  },
  // Oran ve Orantı
  'oran_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Oran:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("/");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("İki sayının oranını hesaplar");
    }
  },
  'dogru_oranti': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Doğru orantı:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("/");
      this.appendValueInput("C")
          .setCheck("Number")
          .appendField("=");
      this.appendDummyInput()
          .appendField("/ x");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Doğru orantı ile x'i bulur");
    }
  },
  'ters_oranti': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Ters orantı:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("×");
      this.appendValueInput("C")
          .setCheck("Number")
          .appendField("=");
      this.appendDummyInput()
          .appendField("× x");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Ters orantı ile x'i bulur");
    }
  },
  'olcek_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ACTUAL")
          .setCheck("Number")
          .appendField("Ölçek hesapla - Gerçek:");
      this.appendValueInput("MAP")
          .setCheck("Number")
          .appendField("Harita:");
      this.setOutput(true, "String");
      this.setColour(230);
      this.setTooltip("Ölçek oranını hesaplar");
    }
  },
  // İndirim ve Artış
  'indirim_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("PRICE")
          .setCheck("Number")
          .appendField("İndirim hesapla - Fiyat:");
      this.appendValueInput("PERCENT")
          .setCheck("Number")
          .appendField("İndirim %");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("İndirimli fiyatı hesaplar");
    }
  },
  'artis_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VALUE")
          .setCheck("Number")
          .appendField("Artış hesapla - Değer:");
      this.appendValueInput("PERCENT")
          .setCheck("Number")
          .appendField("Artış %");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Artışlı değeri hesaplar");
    }
  },
  // İstatistik
  'ortalama': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Ortalama:");
      this.setOutput(true, "Number");
      this.setColour(330);
      this.setTooltip("Sayıların ortalamasını hesaplar");
    }
  },
  'mod': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Mod (tepe değer):");
      this.setOutput(true, "Number");
      this.setColour(330);
      this.setTooltip("En çok tekrar eden değeri bulur");
    }
  },
  'medyan': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Medyan (ortanca):");
      this.setOutput(true, "Number");
      this.setColour(330);
      this.setTooltip("Ortanca değeri bulur");
    }
  },
  'ranj': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("DATA")
          .setCheck("String")
          .appendField("Ranj (açıklık):");
      this.setOutput(true, "Number");
      this.setColour(330);
      this.setTooltip("En büyük ve en küçük değer farkını bulur");
    }
  },
  // Açılar
  'komsur_aci': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("Komşu açı:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Komşu açıyı bulur (180° - açı)");
    }
  },
  'tumler_aci': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("Tümler açı:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Tümler açıyı bulur (90° - açı)");
    }
  },
  'butunler_aci': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("Bütünler açı:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Bütünler açıyı bulur (180° - açı)");
    }
  },
  // Pisagor Teoremi
  'pisagor': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Pisagor - Dik kenar 1:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("Dik kenar 2:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Hipotenüsü hesaplar (c = √(a² + b²))");
    }
  },
  'pisagor_dik_kenar': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("C")
          .setCheck("Number")
          .appendField("Pisagor - Hipotenüs:");
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("Dik kenar:");
      this.setOutput(true, "Number");
      this.setColour(120);
      this.setTooltip("Diğer dik kenarı hesaplar");
    }
  }
};

// Lise Matematik Blokları (MEB Müfredatına Göre - 9-12. Sınıf)
const liseBlocks = {
  // Limit Blokları
  'limit_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FUNCTION")
          .setCheck("String")
          .appendField("Limit:");
      this.appendValueInput("POINT")
          .setCheck("Number")
          .appendField("x →");
      this.setOutput(true, "Number");
      this.setColour(60);
      this.setTooltip("Fonksiyonun belirli bir noktadaki limitini hesaplar");
    }
  },
  'limit_sonsuz': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FUNCTION")
          .setCheck("String")
          .appendField("Limit (x → ∞):");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Fonksiyonun sonsuzdaki limitini hesaplar");
    }
  },
  // Türev Blokları (MEB Müfredatı - 12. Sınıf)
  'turev_polinom': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("COEFFICIENT")
          .setCheck("Number")
          .appendField("Türev (x^n):");
      this.appendValueInput("POWER")
          .setCheck("Number")
          .appendField("^");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Polinom türevi: d/dx(ax^n) = nax^(n-1)");
    }
  },
  'turev_trigonometri': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Türev:")
          .appendField(new Blockly.FieldDropdown([
            ["sin(x)", "sin"],
            ["cos(x)", "cos"],
            ["tan(x)", "tan"],
            ["cot(x)", "cot"]
          ]), "FUNCTION");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Trigonometrik fonksiyonların türevini hesaplar");
    }
  },
  'turev_us': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("BASE")
          .setCheck("Number")
          .appendField("Türev (e^x veya a^x):");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Üstel fonksiyonun türevini hesaplar");
    }
  },
  'turev_logaritma': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Türev:")
          .appendField(new Blockly.FieldDropdown([
            ["ln(x)", "ln"],
            ["log(x)", "log"]
          ]), "TYPE");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Logaritmanın türevini hesaplar");
    }
  },
  // İntegral Blokları (MEB Müfredatı - 12. Sınıf)
  'integral_polinom': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("COEFFICIENT")
          .setCheck("Number")
          .appendField("İntegral (∫ x^n dx):");
      this.appendValueInput("POWER")
          .setCheck("Number")
          .appendField("^");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Polinom integrali: ∫(ax^n dx) = ax^(n+1)/(n+1) + C");
    }
  },
  'integral_trigonometri': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("İntegral:")
          .appendField(new Blockly.FieldDropdown([
            ["∫ sin(x) dx", "sin"],
            ["∫ cos(x) dx", "cos"],
            ["∫ tan(x) dx", "tan"]
          ]), "FUNCTION");
      this.setOutput(true, "String");
      this.setColour(60);
      this.setTooltip("Trigonometrik fonksiyonların integralini hesaplar");
    }
  },
  'integral_belirli': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FUNCTION")
          .setCheck("String")
          .appendField("Belirli İntegral:");
      this.appendValueInput("LOWER")
          .setCheck("Number")
          .appendField("Alt sınır:");
      this.appendValueInput("UPPER")
          .setCheck("Number")
          .appendField("Üst sınır:");
      this.setOutput(true, "Number");
      this.setColour(60);
      this.setTooltip("Belirli integral hesaplar");
    }
  },
  'polinom_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("POLY1")
          .setCheck("String")
          .appendField("Polinom toplama:");
      this.appendValueInput("POLY2")
          .setCheck("String")
          .appendField("+");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip("İki polinomu toplar");
    }
  },
  'polinom_kokler': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("2. Derece Denklem Kökleri:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("x² +");
      this.appendValueInput("C")
          .setCheck("Number")
          .appendField("x +");
      this.appendDummyInput()
          .appendField("= 0");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("İkinci derece denklemin köklerini bulur (ax²+bx+c=0)");
    }
  },
  'logaritma': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Logaritma:");
      this.appendValueInput("BASE")
          .setCheck("Number")
          .appendField("Taban:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip("Logaritma hesaplar");
    }
  },
  'logaritma_dogal': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Doğal Logaritma (ln):");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Doğal logaritma (e tabanında) hesaplar");
    }
  },
  'trigonometri_sin': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("Sinüs:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Açının sinüsünü hesaplar");
    }
  },
  'trigonometri_cos': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("Kosinüs:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Açının kosinüsünü hesaplar");
    }
  },
  'turev_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FUNCTION")
          .setCheck("String")
          .appendField("Türev hesapla:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip("Fonksiyonun türevini hesaplar");
    }
  },
  'integral_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FUNCTION")
          .setCheck("String")
          .appendField("İntegral hesapla:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip("Fonksiyonun integralini hesaplar");
    }
  },
  'matris_carp': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MATRIX1")
          .setCheck("String")
          .appendField("Matris çarpımı:");
      this.appendValueInput("MATRIX2")
          .setCheck("String")
          .appendField("×");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip("İki matrisi çarpar");
    }
  },
  'fonksiyon_grafik': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Fonksiyon grafiği çiz:")
          .appendField(new Blockly.FieldDropdown([
            ["y = x", "x"],
            ["y = x²", "x^2"],
            ["y = x³", "x^3"],
            ["y = sin(x)", "sin(x)"],
            ["y = cos(x)", "cos(x)"],
            ["y = 2x", "2x"]
          ]), "FUNCTION");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip("Fonksiyon grafiği çizer");
    }
  },
  // VEKTÖR İŞLEMLERİ (10. Sınıf MEB Müfredatı)
  'vektor_olustur': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("X")
          .setCheck("Number")
          .appendField("Vektör oluştur: (");
      this.appendValueInput("Y")
          .setCheck("Number")
          .appendField(",");
      this.appendDummyInput()
          .appendField(")");
      this.setOutput(true, "Array");
      this.setColour(290);
      this.setTooltip("İki boyutlu vektör oluşturur");
    }
  },
  'vektor_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VECTOR1")
          .setCheck("Array")
          .appendField("Vektör toplama:");
      this.appendValueInput("VECTOR2")
          .setCheck("Array")
          .appendField("+");
      this.setOutput(true, "Array");
      this.setColour(290);
      this.setTooltip("İki vektörü toplar");
    }
  },
  'vektor_skaler_carp': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("SCALAR")
          .setCheck("Number")
          .appendField("Skaler çarpım:");
      this.appendValueInput("VECTOR")
          .setCheck("Array")
          .appendField("×");
      this.setOutput(true, "Array");
      this.setColour(290);
      this.setTooltip("Vektörü skaler ile çarpar");
    }
  },
  'vektor_ic_carpim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VECTOR1")
          .setCheck("Array")
          .appendField("İç çarpım:");
      this.appendValueInput("VECTOR2")
          .setCheck("Array")
          .appendField("·");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("İki vektörün iç çarpımını hesaplar (a·b)");
    }
  },
  'vektor_uzunluk': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("VECTOR")
          .setCheck("Array")
          .appendField("Vektör uzunluğu |");
      this.appendDummyInput()
          .appendField("|");
      this.setOutput(true, "Number");
      this.setColour(290);
      this.setTooltip("Vektörün uzunluğunu (normunu) hesaplar");
    }
  },
  // MATRİS İŞLEMLERİ (10-11. Sınıf MEB Müfredatı)
  'matris_olustur_2x2': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("A11").setCheck("Number").appendField("2×2 Matris: [");
      this.appendValueInput("A12").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField("]");
      this.appendValueInput("A21").setCheck("Number").appendField("[");
      this.appendValueInput("A22").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField("]");
      this.setOutput(true, "Array");
      this.setColour(330);
      this.setTooltip("2×2 matris oluşturur");
    }
  },
  'matris_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MATRIX1")
          .setCheck("Array")
          .appendField("Matris toplama:");
      this.appendValueInput("MATRIX2")
          .setCheck("Array")
          .appendField("+");
      this.setOutput(true, "Array");
      this.setColour(330);
      this.setTooltip("İki matrisi toplar");
    }
  },
  'matris_cikar': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MATRIX1")
          .setCheck("Array")
          .appendField("Matris çıkarma:");
      this.appendValueInput("MATRIX2")
          .setCheck("Array")
          .appendField("-");
      this.setOutput(true, "Array");
      this.setColour(330);
      this.setTooltip("İki matrisi çıkarır");
    }
  },
  'matris_carp_complete': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MATRIX1")
          .setCheck("Array")
          .appendField("Matris çarpma:");
      this.appendValueInput("MATRIX2")
          .setCheck("Array")
          .appendField("×");
      this.setOutput(true, "Array");
      this.setColour(330);
      this.setTooltip("İki matrisi çarpar");
    }
  },
  'matris_determinant': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MATRIX")
          .setCheck("Array")
          .appendField("Determinant det(");
      this.appendDummyInput()
          .appendField(")");
      this.setOutput(true, "Number");
      this.setColour(330);
      this.setTooltip("Matrisin determinantını hesaplar");
    }
  },
  'matris_transpose': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MATRIX")
          .setCheck("Array")
          .appendField("Matris transpozu");
      this.appendDummyInput()
          .appendField("ᵀ");
      this.setOutput(true, "Array");
      this.setColour(330);
      this.setTooltip("Matrisin transpozunu alır");
    }
  },
  'matris_skaler_carp': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("SCALAR")
          .setCheck("Number")
          .appendField("Matris skaler çarpımı:");
      this.appendValueInput("MATRIX")
          .setCheck("Array")
          .appendField("×");
      this.setOutput(true, "Array");
      this.setColour(330);
      this.setTooltip("Matrisi skaler ile çarpar");
    }
  },
  // PERMÜTASYON VE KOMBİNASYON (11. Sınıf MEB Müfredatı)
  'permutasyon': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("Permütasyon P(");
      this.appendValueInput("R")
          .setCheck("Number")
          .appendField(",");
      this.appendDummyInput()
          .appendField(")");
      this.setOutput(true, "Number");
      this.setColour(165);
      this.setTooltip("Permütasyon hesaplar: P(n,r) = n!/(n-r)!");
    }
  },
  'kombinasyon': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("Kombinasyon C(");
      this.appendValueInput("R")
          .setCheck("Number")
          .appendField(",");
      this.appendDummyInput()
          .appendField(")");
      this.setOutput(true, "Number");
      this.setColour(165);
      this.setTooltip("Kombinasyon hesaplar: C(n,r) = n!/(r!(n-r)!)");
    }
  },
  'faktoriyel': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("Faktöriyel");
      this.appendDummyInput()
          .appendField("!");
      this.setOutput(true, "Number");
      this.setColour(165);
      this.setTooltip("Faktöriyel hesaplar: n!");
    }
  },
  // DİZİLER VE SERİLER (11. Sınıf MEB Müfredatı)
  'aritmetik_dizi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FIRST")
          .setCheck("Number")
          .appendField("Aritmetik dizi: İlk terim:");
      this.appendValueInput("DIFF")
          .setCheck("Number")
          .appendField("Fark:");
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("n. terim:");
      this.setOutput(true, "Number");
      this.setColour(200);
      this.setTooltip("Aritmetik dizinin n. terimini bulur: an = a1 + (n-1)d");
    }
  },
  'geometrik_dizi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FIRST")
          .setCheck("Number")
          .appendField("Geometrik dizi: İlk terim:");
      this.appendValueInput("RATIO")
          .setCheck("Number")
          .appendField("Oran:");
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("n. terim:");
      this.setOutput(true, "Number");
      this.setColour(200);
      this.setTooltip("Geometrik dizinin n. terimini bulur: an = a1 × r^(n-1)");
    }
  },
  'aritmetik_toplam': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FIRST")
          .setCheck("Number")
          .appendField("Aritmetik seri toplamı: a₁:");
      this.appendValueInput("LAST")
          .setCheck("Number")
          .appendField("aₙ:");
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("n:");
      this.setOutput(true, "Number");
      this.setColour(200);
      this.setTooltip("Aritmetik seri toplamı: Sn = n(a1+an)/2");
    }
  },
  'geometrik_toplam': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("FIRST")
          .setCheck("Number")
          .appendField("Geometrik seri toplamı: a₁:");
      this.appendValueInput("RATIO")
          .setCheck("Number")
          .appendField("r:");
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("n:");
      this.setOutput(true, "Number");
      this.setColour(200);
      this.setTooltip("Geometrik seri toplamı: Sn = a1(1-r^n)/(1-r)");
    }
  },
  'fibonacci_terim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("N")
          .setCheck("Number")
          .appendField("Fibonacci dizisi");
      this.appendDummyInput()
          .appendField(". terim");
      this.setOutput(true, "Number");
      this.setColour(200);
      this.setTooltip("Fibonacci dizisinin n. terimini bulur");
    }
  },
  // ANALİTİK GEOMETRİ (10-11. Sınıf MEB Müfredatı)
  'dogru_denklemi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("M")
          .setCheck("Number")
          .appendField("Doğru denklemi: Eğim (m):");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("y-kesişim (b):");
      this.setOutput(true, "String");
      this.setColour(260);
      this.setTooltip("y = mx + b doğru denklemi oluşturur");
    }
  },
  'iki_nokta_dogru': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("X1").setCheck("Number").appendField("İki noktadan doğru: (");
      this.appendValueInput("Y1").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(") ve (");
      this.appendValueInput("X2").setCheck("Number");
      this.appendValueInput("Y2").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.setOutput(true, "String");
      this.setColour(260);
      this.setTooltip("İki noktadan geçen doğrunun denklemini bulur");
    }
  },
  'nokta_arasi_mesafe': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("X1").setCheck("Number").appendField("İki nokta arası mesafe: (");
      this.appendValueInput("Y1").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(") ve (");
      this.appendValueInput("X2").setCheck("Number");
      this.appendValueInput("Y2").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.setOutput(true, "Number");
      this.setColour(260);
      this.setTooltip("İki nokta arasındaki mesafeyi hesaplar: d = √[(x2-x1)² + (y2-y1)²]");
    }
  },
  'orta_nokta': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("X1").setCheck("Number").appendField("Orta nokta: (");
      this.appendValueInput("Y1").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(") ve (");
      this.appendValueInput("X2").setCheck("Number");
      this.appendValueInput("Y2").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.setOutput(true, "Array");
      this.setColour(260);
      this.setTooltip("İki noktanın orta noktasını bulur: ((x1+x2)/2, (y1+y2)/2)");
    }
  },
  'cember_denklemi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("H").setCheck("Number").appendField("Çember denklemi: Merkez (");
      this.appendValueInput("K").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.appendValueInput("R")
          .setCheck("Number")
          .appendField("Yarıçap:");
      this.setOutput(true, "String");
      this.setColour(260);
      this.setTooltip("Çember denklemi: (x-h)² + (y-k)² = r²");
    }
  },
  'noktadan_dogruya_mesafe': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("X0").setCheck("Number").appendField("Noktadan doğruya mesafe: Nokta (");
      this.appendValueInput("Y0").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.appendValueInput("A").setCheck("Number").appendField("Doğru:");
      this.appendDummyInput().appendField("x +");
      this.appendValueInput("B").setCheck("Number");
      this.appendDummyInput().appendField("y +");
      this.appendValueInput("C").setCheck("Number");
      this.appendDummyInput().appendField("= 0");
      this.setOutput(true, "Number");
      this.setColour(260);
      this.setTooltip("Noktadan doğruya uzaklık: d = |ax0 + by0 + c| / √(a² + b²)");
    }
  },
  // KONİK KESİTLER (11. Sınıf MEB Müfredatı)
  'parabol_denklemi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("H").setCheck("Number").appendField("Parabol: Tepe (");
      this.appendValueInput("K").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.appendValueInput("P")
          .setCheck("Number")
          .appendField("p:");
      this.appendDummyInput()
          .appendField("Yön:")
          .appendField(new Blockly.FieldDropdown([
            ["Yukarı", "up"],
            ["Aşağı", "down"],
            ["Sağ", "right"],
            ["Sol", "left"]
          ]), "DIRECTION");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("Parabol denklemi oluşturur");
    }
  },
  'elips_denklemi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("H").setCheck("Number").appendField("Elips: Merkez (");
      this.appendValueInput("K").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("a (büyük yarı eksen):");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("b (küçük yarı eksen):");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("Elips denklemi: (x-h)²/a² + (y-k)²/b² = 1");
    }
  },
  'hiperbol_denklemi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("H").setCheck("Number").appendField("Hiperbol: Merkez (");
      this.appendValueInput("K").setCheck("Number").appendField(",");
      this.appendDummyInput().appendField(")");
      this.appendValueInput("A")
          .setCheck("Number")
          .appendField("a:");
      this.appendValueInput("B")
          .setCheck("Number")
          .appendField("b:");
      this.appendDummyInput()
          .appendField("Yön:")
          .appendField(new Blockly.FieldDropdown([
            ["Yatay", "horizontal"],
            ["Dikey", "vertical"]
          ]), "ORIENTATION");
      this.setOutput(true, "String");
      this.setColour(290);
      this.setTooltip("Hiperbol denklemi oluşturur");
    }
  },
  // KARMAŞIK SAYILAR (11. Sınıf MEB Müfredatı)
  'karmasik_sayi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("REAL")
          .setCheck("Number")
          .appendField("Karmaşık sayı:");
      this.appendValueInput("IMAG")
          .setCheck("Number")
          .appendField("+");
      this.appendDummyInput()
          .appendField("i");
      this.setOutput(true, "String");
      this.setColour(330);
      this.setTooltip("Karmaşık sayı oluşturur: a + bi");
    }
  },
  'karmasik_topla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("Z1")
          .setCheck("String")
          .appendField("Karmaşık toplama:");
      this.appendValueInput("Z2")
          .setCheck("String")
          .appendField("+");
      this.setOutput(true, "String");
      this.setColour(330);
      this.setTooltip("İki karmaşık sayıyı toplar");
    }
  },
  'karmasik_carp': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("Z1")
          .setCheck("String")
          .appendField("Karmaşık çarpma:");
      this.appendValueInput("Z2")
          .setCheck("String")
          .appendField("×");
      this.setOutput(true, "String");
      this.setColour(330);
      this.setTooltip("İki karmaşık sayıyı çarpar");
    }
  },
  'karmasik_eslenigi': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("Z")
          .setCheck("String")
          .appendField("Eşlenik:");
      this.appendDummyInput()
          .appendField("̄");
      this.setOutput(true, "String");
      this.setColour(330);
      this.setTooltip("Karmaşık sayının eşleniğini bulur (a + bi → a - bi)");
    }
  },
  'karmasik_modulus': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("Z")
          .setCheck("String")
          .appendField("Modül |");
      this.appendDummyInput()
          .appendField("|");
      this.setOutput(true, "Number");
      this.setColour(330);
      this.setTooltip("Karmaşık sayının modülünü hesaplar: |a+bi| = √(a²+b²)");
    }
  },
  // KATI CİSİMLER (9-10. Sınıf MEB Müfredatı)
  'kup_hacim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("EDGE")
          .setCheck("Number")
          .appendField("Küp hacmi: Kenar:");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Küp hacmi: V = a³");
    }
  },
  'dikdortgen_prizma_hacim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("LENGTH").setCheck("Number").appendField("Dikdörtgen prizma hacmi: Uzunluk:");
      this.appendValueInput("WIDTH").setCheck("Number").appendField("Genişlik:");
      this.appendValueInput("HEIGHT").setCheck("Number").appendField("Yükseklik:");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Dikdörtgen prizma hacmi: V = u × g × y");
    }
  },
  'silindir_hacim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("RADIUS").setCheck("Number").appendField("Silindir hacmi: Yarıçap:");
      this.appendValueInput("HEIGHT").setCheck("Number").appendField("Yükseklik:");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Silindir hacmi: V = πr²h");
    }
  },
  'koni_hacim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("RADIUS").setCheck("Number").appendField("Koni hacmi: Yarıçap:");
      this.appendValueInput("HEIGHT").setCheck("Number").appendField("Yükseklik:");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Koni hacmi: V = (1/3)πr²h");
    }
  },
  'kure_hacim': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("RADIUS")
          .setCheck("Number")
          .appendField("Küre hacmi: Yarıçap:");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Küre hacmi: V = (4/3)πr³");
    }
  },
  'kure_yuzey_alani': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("RADIUS")
          .setCheck("Number")
          .appendField("Küre yüzey alanı: Yarıçap:");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Küre yüzey alanı: A = 4πr²");
    }
  },
  // 3D ŞEKİLLER - ÇİZ ve HESAPLA Blokları
  'koni_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🎨 Koni ÇİZ ve HESAPLA - Yarıçap:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Koniyi çizer, hacim ve yüzey alanı hesaplar");
    }
  },
  'silindir_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🎨 Silindir ÇİZ ve HESAPLA - Yarıçap:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Silindiri çizer, hacim ve yüzey alanı hesaplar");
    }
  },
  'kure_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("YARICAP")
          .setCheck("Number")
          .appendField("🎨 Küre ÇİZ ve HESAPLA - Yarıçap:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Küreyi çizer, hacim ve yüzey alanı hesaplar");
    }
  },
  'kup_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("KENAR")
          .setCheck("Number")
          .appendField("🎨 Küp ÇİZ ve HESAPLA - Kenar:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Küpü çizer, hacim ve yüzey alanı hesaplar");
    }
  },
  'dikdortgen_prizma_ciz_hesapla': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("GENISLIK")
          .setCheck("Number")
          .appendField("🎨 Dikdörtgen Prizma ÇİZ ve HESAPLA - Genişlik:");
      this.appendValueInput("UZUNLUK")
          .setCheck("Number")
          .appendField("Uzunluk:");
      this.appendValueInput("YUKSEKLIK")
          .setCheck("Number")
          .appendField("Yükseklik:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Dikdörtgen prizmayı çizer, hacim ve yüzey alanı hesaplar");
    }
  }
};

// Toolbox yapılandırmaları
const toolboxConfigs = {
  ilkokul: {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '🧮 Hesapla',
        colour: '160',
        contents: [
          { kind: 'block', type: 'hesapla_goster' },
          { kind: 'block', type: 'sonuc_goster' }
        ]
      },
      {
        kind: 'category',
        name: 'Sayılar',
        colour: '200',
        contents: [
          { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
          { kind: 'block', type: 'math_arithmetic', fields: { OP: 'ADD' } },
          { kind: 'block', type: 'math_arithmetic', fields: { OP: 'MINUS' } },
          { kind: 'block', type: 'math_arithmetic', fields: { OP: 'MULTIPLY' } },
          { kind: 'block', type: 'math_arithmetic', fields: { OP: 'DIVIDE' } },
          { kind: 'block', type: 'sayi_okuma' },
          { kind: 'block', type: 'toplama' },
          { kind: 'block', type: 'cikarma' },
          { kind: 'block', type: 'carpma' },
          { kind: 'block', type: 'bolme' },
          { kind: 'block', type: 'math_single', fields: { OP: 'ROOT' } },
          { kind: 'block', type: 'math_single', fields: { OP: 'ABS' } },
          { kind: 'block', type: 'math_number_property' },
          { kind: 'block', type: 'math_round' },
          { kind: 'block', type: 'math_modulo' }
        ]
      },
      {
        kind: 'category',
        name: 'Metin',
        colour: '160',
        contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_print' },
          { kind: 'block', type: 'text_join' },
          { kind: 'block', type: 'text_length' }
        ]
      },
      {
        kind: 'category',
        name: 'Geometri',
        colour: '120',
        contents: [
          { kind: 'label', text: 'Alan Hesaplama' },
          { kind: 'block', type: 'kare_alan' },
          { kind: 'block', type: 'dikdortgen_alan' },
          { kind: 'block', type: 'ucgen_alan' },
          { kind: 'block', type: 'daire_alan' },
          { kind: 'block', type: 'daire_cevre' },
          { kind: 'label', text: '🎨 ÇİZ ve HESAPLA' },
          { kind: 'block', type: 'daire_ciz_hesapla' },
          { kind: 'block', type: 'kare_ciz_hesapla' },
          { kind: 'block', type: 'dikdortgen_ciz_hesapla' },
          { kind: 'block', type: 'ucgen_ciz_hesapla' },
          { kind: 'label', text: 'Şekil Çizme' },
          { kind: 'block', type: 'kare_ciz' },
          { kind: 'block', type: 'dikdortgen_ciz' },
          { kind: 'block', type: 'ucgen_ciz' },
          { kind: 'block', type: 'daire_ciz' },
          { kind: 'label', text: 'Açılar' },
          { kind: 'block', type: 'aci_olc' },
          { kind: 'block', type: 'aci_turu' },
          { kind: 'block', type: 'simetri_eksen' }
        ]
      },
      {
        kind: 'category',
        name: 'Ölçme',
        colour: '200',
        contents: [
          { kind: 'block', type: 'uzunluk_donusum' },
          { kind: 'block', type: 'sivi_donusum' },
          { kind: 'block', type: 'agirlik_donusum' }
        ]
      },
      {
        kind: 'category',
        name: 'Veri',
        colour: '260',
        contents: [
          { kind: 'block', type: 'veri_topla' },
          { kind: 'block', type: 'sutun_grafik' }
        ]
      },
      {
        kind: 'category',
        name: 'Mantık',
        colour: '210',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' },
          { kind: 'block', type: 'logic_boolean' }
        ]
      },
      {
        kind: 'category',
        name: 'Döngüler',
        colour: '120',
        contents: [
          { kind: 'block', type: 'controls_repeat_ext' },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' }
        ]
      },
      {
        kind: 'category',
        name: 'Değişkenler',
        colour: '330',
        custom: 'VARIABLE'
      }
    ]
  },
  ortaokul: {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '🧮 Hesapla',
        colour: '160',
        contents: [
          { kind: 'block', type: 'hesapla_goster' },
          { kind: 'block', type: 'sonuc_goster' }
        ]
      },
      {
        kind: 'category',
        name: 'Sayılar',
        colour: '230',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_single' },
          { kind: 'block', type: 'math_round' },
          { kind: 'block', type: 'math_modulo' },
          { kind: 'block', type: 'math_constrain' },
          { kind: 'block', type: 'math_random_int' },
          { kind: 'block', type: 'math_random_float' },
          { kind: 'block', type: 'kesir_topla' },
          { kind: 'block', type: 'ondalik_cevir' },
          { kind: 'block', type: 'yuzde_hesapla' },
          { kind: 'block', type: 'ebob_hesapla' },
          { kind: 'block', type: 'ekok_hesapla' },
          { kind: 'block', type: 'uslu_sayi' },
          { kind: 'block', type: 'karekok' },
          { kind: 'block', type: 'kupkok' },
          { kind: 'block', type: 'mutlak_deger' }
        ]
      },
      {
        kind: 'category',
        name: 'Metin',
        colour: '160',
        contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_print' },
          { kind: 'block', type: 'text_join' },
          { kind: 'block', type: 'text_append' },
          { kind: 'block', type: 'text_length' },
          { kind: 'block', type: 'text_isEmpty' }
        ]
      },
      {
        kind: 'category',
        name: 'Cebir',
        colour: '290',
        contents: [
          { kind: 'block', type: 'denklem_coz' },
          { kind: 'block', type: 'cebirsel_ifade' },
          { kind: 'block', type: 'cebirsel_topla' },
          { kind: 'block', type: 'denklem_1_bilinmeyen' },
          { kind: 'block', type: 'denklem_sistemi' },
          { kind: 'block', type: 'esitsizlik' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_single', fields: { OP: 'POW10' } }
        ]
      },
      {
        kind: 'category',
        name: 'Oran-Orantı',
        colour: '180',
        contents: [
          { kind: 'block', type: 'oran_hesapla' },
          { kind: 'block', type: 'dogru_oranti' },
          { kind: 'block', type: 'ters_oranti' },
          { kind: 'block', type: 'olcek_hesapla' },
          { kind: 'block', type: 'indirim_hesapla' },
          { kind: 'block', type: 'artis_hesapla' }
        ]
      },
      {
        kind: 'category',
        name: 'Geometri',
        colour: '120',
        contents: [
          { kind: 'block', type: 'koordinat_ciz' },
          { kind: 'block', type: 'geometri_sekil' },
          { kind: 'block', type: 'alan_hesapla' },
          { kind: 'block', type: 'komsur_aci' },
          { kind: 'block', type: 'tumler_aci' },
          { kind: 'block', type: 'butunler_aci' },
          { kind: 'block', type: 'pisagor' },
          { kind: 'block', type: 'pisagor_dik_kenar' }
        ]
      },
      {
        kind: 'category',
        name: 'İstatistik',
        colour: '330',
        contents: [
          { kind: 'block', type: 'olasilik_hesapla' },
          { kind: 'block', type: 'grafik_ciz' },
          { kind: 'block', type: 'ortalama' },
          { kind: 'block', type: 'mod' },
          { kind: 'block', type: 'medyan' },
          { kind: 'block', type: 'ranj' },
          { kind: 'block', type: 'math_random_int' },
          { kind: 'block', type: 'math_random_float' }
        ]
      },
      {
        kind: 'category',
        name: 'Mantık',
        colour: '210',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' },
          { kind: 'block', type: 'logic_boolean' }
        ]
      },
      {
        kind: 'category',
        name: 'Döngüler',
        colour: '120',
        contents: [
          { kind: 'block', type: 'controls_repeat_ext' },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' },
          { kind: 'block', type: 'controls_forEach' }
        ]
      },
      {
        kind: 'category',
        name: 'Listeler',
        colour: '260',
        contents: [
          { kind: 'block', type: 'lists_create_with' },
          { kind: 'block', type: 'lists_create_empty' },
          { kind: 'block', type: 'lists_length' },
          { kind: 'block', type: 'lists_isEmpty' }
        ]
      },
      {
        kind: 'category',
        name: 'Değişkenler',
        colour: '330',
        custom: 'VARIABLE'
      }
    ]
  },
  lise: {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '🧮 Hesapla',
        colour: '160',
        contents: [
          { kind: 'block', type: 'hesapla_goster' },
          { kind: 'block', type: 'sonuc_goster' }
        ]
      },
      {
        kind: 'category',
        name: 'Sayılar',
        colour: '230',
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_single' },
          { kind: 'block', type: 'math_trig' },
          { kind: 'block', type: 'math_constant' },
          { kind: 'block', type: 'math_round' },
          { kind: 'block', type: 'math_modulo' },
          { kind: 'block', type: 'math_constrain' },
          { kind: 'block', type: 'math_random_int' },
          { kind: 'block', type: 'math_random_float' },
          { kind: 'block', type: 'math_on_list' }
        ]
      },
      {
        kind: 'category',
        name: 'Metin',
        colour: '160',
        contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_print' },
          { kind: 'block', type: 'text_join' },
          { kind: 'block', type: 'text_append' },
          { kind: 'block', type: 'text_length' },
          { kind: 'block', type: 'text_isEmpty' },
          { kind: 'block', type: 'text_indexOf' },
          { kind: 'block', type: 'text_charAt' }
        ]
      },
      {
        kind: 'category',
        name: 'Cebir',
        colour: '290',
        contents: [
          { kind: 'block', type: 'polinom_topla' },
          { kind: 'block', type: 'polinom_kokler' },
          { kind: 'block', type: 'logaritma' },
          { kind: 'block', type: 'logaritma_dogal' },
          { kind: 'block', type: 'math_single', fields: { OP: 'POW10' } },
          { kind: 'block', type: 'math_single', fields: { OP: 'LN' } },
          { kind: 'block', type: 'math_single', fields: { OP: 'EXP' } },
          { kind: 'block', type: 'math_arithmetic', fields: { OP: 'POWER' } }
        ]
      },
      {
        kind: 'category',
        name: 'Trigonometri',
        colour: '120',
        contents: [
          { kind: 'block', type: 'trigonometri_sin' },
          { kind: 'block', type: 'trigonometri_cos' },
          { kind: 'block', type: 'math_trig', fields: { OP: 'SIN' } },
          { kind: 'block', type: 'math_trig', fields: { OP: 'COS' } },
          { kind: 'block', type: 'math_trig', fields: { OP: 'TAN' } },
          { kind: 'block', type: 'math_trig', fields: { OP: 'ASIN' } },
          { kind: 'block', type: 'math_trig', fields: { OP: 'ACOS' } },
          { kind: 'block', type: 'math_trig', fields: { OP: 'ATAN' } }
        ]
      },
      {
        kind: 'category',
        name: 'Analiz',
        colour: '60',
        contents: [
          { kind: 'block', type: 'limit_hesapla' },
          { kind: 'block', type: 'limit_sonsuz' },
          { kind: 'block', type: 'turev_hesapla' },
          { kind: 'block', type: 'turev_polinom' },
          { kind: 'block', type: 'turev_trigonometri' },
          { kind: 'block', type: 'turev_us' },
          { kind: 'block', type: 'turev_logaritma' },
          { kind: 'block', type: 'integral_hesapla' },
          { kind: 'block', type: 'integral_polinom' },
          { kind: 'block', type: 'integral_trigonometri' },
          { kind: 'block', type: 'integral_belirli' },
          { kind: 'block', type: 'fonksiyon_grafik' },
          { kind: 'block', type: 'math_constant', fields: { CONSTANT: 'E' } },
          { kind: 'block', type: 'math_constant', fields: { CONSTANT: 'PI' } }
        ]
      },
      {
        kind: 'category',
        name: 'Vektörler',
        colour: '290',
        contents: [
          { kind: 'block', type: 'vektor_olustur' },
          { kind: 'block', type: 'vektor_topla' },
          { kind: 'block', type: 'vektor_skaler_carp' },
          { kind: 'block', type: 'vektor_ic_carpim' },
          { kind: 'block', type: 'vektor_uzunluk' }
        ]
      },
      {
        kind: 'category',
        name: 'Matrisler',
        colour: '330',
        contents: [
          { kind: 'block', type: 'matris_olustur_2x2' },
          { kind: 'block', type: 'matris_topla' },
          { kind: 'block', type: 'matris_cikar' },
          { kind: 'block', type: 'matris_carp' },
          { kind: 'block', type: 'matris_carp_complete' },
          { kind: 'block', type: 'matris_determinant' },
          { kind: 'block', type: 'matris_transpose' },
          { kind: 'block', type: 'matris_skaler_carp' }
        ]
      },
      {
        kind: 'category',
        name: 'Permütasyon & Kombinasyon',
        colour: '165',
        contents: [
          { kind: 'block', type: 'permutasyon' },
          { kind: 'block', type: 'kombinasyon' },
          { kind: 'block', type: 'faktoriyel' }
        ]
      },
      {
        kind: 'category',
        name: 'Diziler & Seriler',
        colour: '200',
        contents: [
          { kind: 'block', type: 'aritmetik_dizi' },
          { kind: 'block', type: 'geometrik_dizi' },
          { kind: 'block', type: 'aritmetik_toplam' },
          { kind: 'block', type: 'geometrik_toplam' },
          { kind: 'block', type: 'fibonacci_terim' }
        ]
      },
      {
        kind: 'category',
        name: 'Analitik Geometri',
        colour: '260',
        contents: [
          { kind: 'block', type: 'dogru_denklemi' },
          { kind: 'block', type: 'iki_nokta_dogru' },
          { kind: 'block', type: 'nokta_arasi_mesafe' },
          { kind: 'block', type: 'orta_nokta' },
          { kind: 'block', type: 'cember_denklemi' },
          { kind: 'block', type: 'noktadan_dogruya_mesafe' }
        ]
      },
      {
        kind: 'category',
        name: 'Konik Kesitler',
        colour: '290',
        contents: [
          { kind: 'block', type: 'parabol_denklemi' },
          { kind: 'block', type: 'elips_denklemi' },
          { kind: 'block', type: 'hiperbol_denklemi' }
        ]
      },
      {
        kind: 'category',
        name: 'Karmaşık Sayılar',
        colour: '330',
        contents: [
          { kind: 'block', type: 'karmasik_sayi' },
          { kind: 'block', type: 'karmasik_topla' },
          { kind: 'block', type: 'karmasik_carp' },
          { kind: 'block', type: 'karmasik_eslenigi' },
          { kind: 'block', type: 'karmasik_modulus' }
        ]
      },
      {
        kind: 'category',
        name: 'Katı Cisimler',
        colour: '160',
        contents: [
          { kind: 'label', text: '🎨 ÇİZ ve HESAPLA' },
          { kind: 'block', type: 'kup_ciz_hesapla' },
          { kind: 'block', type: 'dikdortgen_prizma_ciz_hesapla' },
          { kind: 'block', type: 'silindir_ciz_hesapla' },
          { kind: 'block', type: 'koni_ciz_hesapla' },
          { kind: 'block', type: 'kure_ciz_hesapla' },
          { kind: 'label', text: 'Hacim Hesaplama' },
          { kind: 'block', type: 'kup_hacim' },
          { kind: 'block', type: 'dikdortgen_prizma_hacim' },
          { kind: 'block', type: 'silindir_hacim' },
          { kind: 'block', type: 'koni_hacim' },
          { kind: 'block', type: 'kure_hacim' },
          { kind: 'block', type: 'kure_yuzey_alani' }
        ]
      },
      {
        kind: 'category',
        name: 'Mantık',
        colour: '210',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'controls_ifelse' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' },
          { kind: 'block', type: 'logic_boolean' },
          { kind: 'block', type: 'logic_null' },
          { kind: 'block', type: 'logic_ternary' }
        ]
      },
      {
        kind: 'category',
        name: 'Döngüler',
        colour: '120',
        contents: [
          { kind: 'block', type: 'controls_repeat_ext' },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' },
          { kind: 'block', type: 'controls_forEach' },
          { kind: 'block', type: 'controls_flow_statements' }
        ]
      },
      {
        kind: 'category',
        name: 'Listeler',
        colour: '260',
        contents: [
          { kind: 'block', type: 'lists_create_with' },
          { kind: 'block', type: 'lists_create_empty' },
          { kind: 'block', type: 'lists_repeat' },
          { kind: 'block', type: 'lists_length' },
          { kind: 'block', type: 'lists_isEmpty' },
          { kind: 'block', type: 'lists_indexOf' },
          { kind: 'block', type: 'lists_getIndex' },
          { kind: 'block', type: 'lists_setIndex' }
        ]
      },
      {
        kind: 'category',
        name: 'Fonksiyonlar',
        colour: '290',
        custom: 'PROCEDURE'
      },
      {
        kind: 'category',
        name: 'Değişkenler',
        colour: '330',
        custom: 'VARIABLE'
      }
    ]
  }
};

export default function MathBlocklyWorkspace() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<MathLevel>('ilkokul');
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [visualizationType, setVisualizationType] = useState<'graph' | 'geometry' | 'chart' | 'function' | '2d-shape' | '3d-shape'>('graph');

  // Blokları kaydet
  const registerBlocks = (blocks: any) => {
    Object.keys(blocks).forEach(blockName => {
      if (!Blockly.Blocks[blockName]) {
        Blockly.Blocks[blockName] = blocks[blockName];
      }
    });
  };

  // Kod üreticileri
  const registerGenerators = (level: MathLevel) => {
    // Ortak bloklar için kod üreticileri (tüm seviyeler)
    javascriptGenerator.forBlock['hesapla_goster'] = function(block, generator) {
      const value = generator.valueToCode(block, 'VALUE', 0) || '0';
      return 'console.log("🧮 Hesaplama Sonucu:", ' + value + ');\n';
    };

    javascriptGenerator.forBlock['sonuc_goster'] = function(block, generator) {
      const value = generator.valueToCode(block, 'VALUE', 0) || '0';
      return 'console.log("📊 Sonuç =", ' + value + ');\n';
    };

    if (level === 'ilkokul') {
      javascriptGenerator.forBlock['sayi_okuma'] = function(block) {
        const number = block.getFieldValue('NUMBER');
        return 'console.log("' + number + ' sayısını okuyorum");\n';
      };

      javascriptGenerator.forBlock['toplama'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return 'console.log("Toplama: " + ' + a + ' + " + " + ' + b + ' + " =", ' + a + ' + ' + b + ');\n';
      };

      javascriptGenerator.forBlock['cikarma'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return 'console.log("Çıkarma: " + ' + a + ' + " - " + ' + b + ' + " =", ' + a + ' - ' + b + ');\n';
      };

      javascriptGenerator.forBlock['carpma'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return 'console.log("Çarpma: " + ' + a + ' + " × " + ' + b + ' + " =", ' + a + ' * ' + b + ');\n';
      };

      javascriptGenerator.forBlock['bolme'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return 'console.log("Bölme: " + ' + a + ' + " ÷ " + ' + b + ' + " =", ' + a + ' / ' + b + ');\n';
      };
      
      javascriptGenerator.forBlock['kare_alan'] = function(block, generator) {
        const kenar = generator.valueToCode(block, 'KENAR', 0) || '0';
        return [`(${kenar} * ${kenar})`, 0];
      };

      javascriptGenerator.forBlock['dikdortgen_alan'] = function(block, generator) {
        const genislik = generator.valueToCode(block, 'GENISLIK', 0) || '0';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '0';
        return [`(${genislik} * ${yukseklik})`, 0];
      };

      javascriptGenerator.forBlock['ucgen_alan'] = function(block, generator) {
        const taban = generator.valueToCode(block, 'TABAN', 0) || '0';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '0';
        return [`((${taban} * ${yukseklik}) / 2)`, 0];
      };

      javascriptGenerator.forBlock['daire_alan'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '0';
        return [`(Math.PI * ${yaricap} * ${yaricap})`, 0];
      };

      javascriptGenerator.forBlock['daire_cevre'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '0';
        return [`(2 * Math.PI * ${yaricap})`, 0];
      };
      
      javascriptGenerator.forBlock['kare_ciz'] = function(block, generator) {
        const kenar = generator.valueToCode(block, 'KENAR', 0) || '10';
        const x = generator.valueToCode(block, 'X', 0) || '0';
        const y = generator.valueToCode(block, 'Y', 0) || '0';
        return 'console.log("🟦 Kare çiziliyor - Kenar:", ' + kenar + ', "Konum: (", ' + x + ', ",", ' + y + ', ")");\n';
      };

      javascriptGenerator.forBlock['dikdortgen_ciz'] = function(block, generator) {
        const genislik = generator.valueToCode(block, 'GENISLIK', 0) || '10';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '10';
        const x = generator.valueToCode(block, 'X', 0) || '0';
        const y = generator.valueToCode(block, 'Y', 0) || '0';
        return 'console.log("🟩 Dikdörtgen çiziliyor - Genişlik:", ' + genislik + ', "Yükseklik:", ' + yukseklik + ', "Konum: (", ' + x + ', ",", ' + y + ', ")");\n';
      };

      javascriptGenerator.forBlock['ucgen_ciz'] = function(block, generator) {
        const taban = generator.valueToCode(block, 'TABAN', 0) || '10';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '10';
        const x = generator.valueToCode(block, 'X', 0) || '0';
        const y = generator.valueToCode(block, 'Y', 0) || '0';
        return 'console.log("🔺 Üçgen çiziliyor - Taban:", ' + taban + ', "Yükseklik:", ' + yukseklik + ', "Konum: (", ' + x + ', ",", ' + y + ', ")");\n';
      };

      javascriptGenerator.forBlock['daire_ciz'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '5';
        const x = generator.valueToCode(block, 'X', 0) || '0';
        const y = generator.valueToCode(block, 'Y', 0) || '0';
        return 'console.log("🔵 Daire çiziliyor - Yarıçap:", ' + yaricap + ', "Merkez: (", ' + x + ', ",", ' + y + ', ")");\n';
      };

      // 2D ŞEKİLLER - ÇİZ ve HESAPLA Jeneratörleri
      javascriptGenerator.forBlock['daire_ciz_hesapla'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '50';
        return 'drawShape("2d-shape", {\n' +
          '  shape: "daire",\n' +
          '  yaricap: ' + yaricap + ',\n' +
          '  label: "Daire (r=" + ' + yaricap + ' + ")",\n' +
          '  calculation: {\n' +
          '    alan: Math.PI * ' + yaricap + ' * ' + yaricap + ',\n' +
          '    cevre: 2 * Math.PI * ' + yaricap + '\n' +
          '  }\n' +
          '});\n' +
          'console.log("Daire: Alan = " + (Math.PI * ' + yaricap + ' * ' + yaricap + ').toFixed(2) + ", Çevre = " + (2 * Math.PI * ' + yaricap + ').toFixed(2));\n';
      };

      javascriptGenerator.forBlock['dikdortgen_ciz_hesapla'] = function(block, generator) {
        const genislik = generator.valueToCode(block, 'GENISLIK', 0) || '80';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '60';
        return 'drawShape("2d-shape", {\n' +
          '  shape: "dikdortgen",\n' +
          '  genislik: ' + genislik + ',\n' +
          '  yukseklik: ' + yukseklik + ',\n' +
          '  label: "Dikdörtgen (" + ' + genislik + ' + "x" + ' + yukseklik + ' + ")",\n' +
          '  calculation: {\n' +
          '    alan: ' + genislik + ' * ' + yukseklik + ',\n' +
          '    cevre: 2 * (' + genislik + ' + ' + yukseklik + ')\n' +
          '  }\n' +
          '});\n' +
          'console.log("Dikdörtgen: Alan = " + (' + genislik + ' * ' + yukseklik + ').toFixed(2) + ", Çevre = " + (2 * (' + genislik + ' + ' + yukseklik + ')).toFixed(2));\n';
      };

      javascriptGenerator.forBlock['kare_ciz_hesapla'] = function(block, generator) {
        const kenar = generator.valueToCode(block, 'KENAR', 0) || '70';
        return 'drawShape("2d-shape", {\n' +
          '  shape: "kare",\n' +
          '  kenar: ' + kenar + ',\n' +
          '  label: "Kare (a=" + ' + kenar + ' + ")",\n' +
          '  calculation: {\n' +
          '    alan: ' + kenar + ' * ' + kenar + ',\n' +
          '    cevre: 4 * ' + kenar + '\n' +
          '  }\n' +
          '});\n' +
          'console.log("Kare: Alan = " + (' + kenar + ' * ' + kenar + ').toFixed(2) + ", Çevre = " + (4 * ' + kenar + ').toFixed(2));\n';
      };

      javascriptGenerator.forBlock['ucgen_ciz_hesapla'] = function(block, generator) {
        const taban = generator.valueToCode(block, 'TABAN', 0) || '80';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '60';
        return 'drawShape("2d-shape", {\n' +
          '  shape: "ucgen",\n' +
          '  taban: ' + taban + ',\n' +
          '  yukseklik: ' + yukseklik + ',\n' +
          '  label: "Üçgen (t=" + ' + taban + ' + ", h=" + ' + yukseklik + ' + ")",\n' +
          '  calculation: {\n' +
          '    alan: (' + taban + ' * ' + yukseklik + ') / 2\n' +
          '  }\n' +
          '});\n' +
          'console.log("Üçgen: Alan = " + ((' + taban + ' * ' + yukseklik + ') / 2).toFixed(2));\n';
      };

      // Yeni İlkokul blokları kod üretecileri
      javascriptGenerator.forBlock['uzunluk_donusum'] = function(block, generator) {
        const value = generator.valueToCode(block, 'VALUE', 0) || '0';
        const conversion = block.getFieldValue('CONVERSION');
        const conversions: any = {
          'm_cm': `${value} * 100`,
          'cm_m': `${value} / 100`,
          'km_m': `${value} * 1000`,
          'm_km': `${value} / 1000`
        };
        return [`(${conversions[conversion]})`, 0];
      };

      javascriptGenerator.forBlock['sivi_donusum'] = function(block, generator) {
        const value = generator.valueToCode(block, 'VALUE', 0) || '0';
        const conversion = block.getFieldValue('CONVERSION');
        const conversions: any = {
          'l_ml': `${value} * 1000`,
          'ml_l': `${value} / 1000`
        };
        return [`(${conversions[conversion]})`, 0];
      };

      javascriptGenerator.forBlock['agirlik_donusum'] = function(block, generator) {
        const value = generator.valueToCode(block, 'VALUE', 0) || '0';
        const conversion = block.getFieldValue('CONVERSION');
        const conversions: any = {
          'kg_g': `${value} * 1000`,
          'g_kg': `${value} / 1000`,
          'ton_kg': `${value} * 1000`,
          'kg_ton': `${value} / 1000`
        };
        return [`(${conversions[conversion]})`, 0];
      };

      javascriptGenerator.forBlock['aci_olc'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return 'console.log("Açı:", ' + angle + ', "derece");\n';
      };

      javascriptGenerator.forBlock['aci_turu'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return 'console.log("Açı türü:", ' + angle + ' < 90 ? "Dar" : ' + angle + ' === 90 ? "Dik" : ' + angle + ' < 180 ? "Geniş" : "Tam");\n';
      };

      javascriptGenerator.forBlock['simetri_eksen'] = function(block, generator) {
        const shape = block.getFieldValue('SHAPE');
        return 'console.log("' + shape + ' şeklinin simetri ekseni çiziliyor");\n';
      };

      javascriptGenerator.forBlock['veri_topla'] = function(block, generator) {
        const category = generator.valueToCode(block, 'CATEGORY', 0) || '""';
        const value = generator.valueToCode(block, 'VALUE', 0) || '0';
        return 'console.log("Veri:", ' + category + ', "=", ' + value + ');\n';
      };

      javascriptGenerator.forBlock['sutun_grafik'] = function(block, generator) {
        const data = generator.valueToCode(block, 'DATA', 0) || '[]';
        return 'console.log("Sütun grafik çiziliyor:", ' + data + ');\n';
      };
    }
    
    if (level === 'ortaokul') {
      javascriptGenerator.forBlock['kesir_topla'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return 'console.log("Kesir toplama:", ' + a + ' + ' + b + ');\n';
      };

      javascriptGenerator.forBlock['ondalik_cevir'] = function(block, generator) {
        const fraction = generator.valueToCode(block, 'FRACTION', 0) || '0';
        return 'console.log("Ondalık:", ' + fraction + ');\n';
      };

      javascriptGenerator.forBlock['yuzde_hesapla'] = function(block, generator) {
        const number = generator.valueToCode(block, 'NUMBER', 0) || '0';
        const percent = generator.valueToCode(block, 'PERCENT', 0) || '0';
        return 'console.log("Yüzde:", ' + number + ' * ' + percent + ' / 100);\n';
      };

      javascriptGenerator.forBlock['denklem_coz'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        return 'console.log("x =", (' + c + ' - ' + b + ') / ' + a + ');\n';
      };

      javascriptGenerator.forBlock['koordinat_ciz'] = function(block, generator) {
        const x = generator.valueToCode(block, 'X', 0) || '0';
        const y = generator.valueToCode(block, 'Y', 0) || '0';
        return 'console.log("Koordinat: (" + ' + x + ' + ", " + ' + y + ' + ")");\n';
      };

      javascriptGenerator.forBlock['olasilik_hesapla'] = function(block, generator) {
        const favorable = generator.valueToCode(block, 'FAVORABLE', 0) || '0';
        const total = generator.valueToCode(block, 'TOTAL', 0) || '1';
        return 'console.log("Olasılık:", ' + favorable + ' / ' + total + ');\n';
      };

      javascriptGenerator.forBlock['grafik_ciz'] = function(block, generator) {
        const chartType = block.getFieldValue('CHART_TYPE');
        const data = generator.valueToCode(block, 'DATA', 0) || '""';
        return 'drawChart("' + chartType + '", ' + data + ');\n';
      };

      // Yeni Ortaokul blokları kod üretecileri
      javascriptGenerator.forBlock['ebob_hesapla'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return [`Math.abs(function gcd(a,b){return b?gcd(b,a%b):a;}(${a},${b}))`, 0];
      };

      javascriptGenerator.forBlock['ekok_hesapla'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return [`Math.abs((${a}*${b})/function gcd(a,b){return b?gcd(b,a%b):a;}(${a},${b}))`, 0];
      };

      javascriptGenerator.forBlock['uslu_sayi'] = function(block, generator) {
        const base = generator.valueToCode(block, 'BASE', 0) || '0';
        const exp = generator.valueToCode(block, 'EXPONENT', 0) || '0';
        return [`Math.pow(${base}, ${exp})`, 0];
      };

      javascriptGenerator.forBlock['karekok'] = function(block, generator) {
        const number = generator.valueToCode(block, 'NUMBER', 0) || '0';
        return [`Math.sqrt(${number})`, 0];
      };

      javascriptGenerator.forBlock['kupkok'] = function(block, generator) {
        const number = generator.valueToCode(block, 'NUMBER', 0) || '0';
        return [`Math.cbrt(${number})`, 0];
      };

      javascriptGenerator.forBlock['mutlak_deger'] = function(block, generator) {
        const number = generator.valueToCode(block, 'NUMBER', 0) || '0';
        return [`Math.abs(${number})`, 0];
      };

      javascriptGenerator.forBlock['cebirsel_ifade'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return [`"${a}x + ${b}"`, 0];
      };

      javascriptGenerator.forBlock['cebirsel_topla'] = function(block, generator) {
        const expr1 = generator.valueToCode(block, 'EXPR1', 0) || '""';
        const expr2 = generator.valueToCode(block, 'EXPR2', 0) || '""';
        return [`${expr1} + " + " + ${expr2}`, 0];
      };

      javascriptGenerator.forBlock['denklem_1_bilinmeyen'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        return 'console.log("Çözüm: x =", (' + c + ' - ' + b + ') / ' + a + ');\n';
      };

      javascriptGenerator.forBlock['denklem_sistemi'] = function(block, generator) {
        const a1 = generator.valueToCode(block, 'A1', 0) || '1';
        const b1 = generator.valueToCode(block, 'B1', 0) || '1';
        const c1 = generator.valueToCode(block, 'C1', 0) || '0';
        const a2 = generator.valueToCode(block, 'A2', 0) || '1';
        const b2 = generator.valueToCode(block, 'B2', 0) || '1';
        const c2 = generator.valueToCode(block, 'C2', 0) || '0';
        return 'console.log("Denklem sistemi çözümü hesaplanıyor");\n';
      };

      javascriptGenerator.forBlock['esitsizlik'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        const op = block.getFieldValue('OPERATOR');
        return 'console.log("Eşitsizlik çözümü: x ' + op + '", (' + c + ' - ' + b + ') / ' + a + ');\n';
      };

      javascriptGenerator.forBlock['oran_hesapla'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '1';
        return [`(${a} / ${b})`, 0];
      };

      javascriptGenerator.forBlock['dogru_oranti'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        return [`((${b} * ${c}) / ${a})`, 0];
      };

      javascriptGenerator.forBlock['ters_oranti'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        return [`((${a} * ${b}) / ${c})`, 0];
      };

      javascriptGenerator.forBlock['olcek_hesapla'] = function(block, generator) {
        const actual = generator.valueToCode(block, 'ACTUAL', 0) || '0';
        const scale = generator.valueToCode(block, 'SCALE', 0) || '1';
        return [`(${actual} / ${scale})`, 0];
      };

      javascriptGenerator.forBlock['indirim_hesapla'] = function(block, generator) {
        const price = generator.valueToCode(block, 'PRICE', 0) || '0';
        const discount = generator.valueToCode(block, 'DISCOUNT', 0) || '0';
        return [`(${price} * (1 - ${discount}/100))`, 0];
      };

      javascriptGenerator.forBlock['artis_hesapla'] = function(block, generator) {
        const value = generator.valueToCode(block, 'VALUE', 0) || '0';
        const increase = generator.valueToCode(block, 'INCREASE', 0) || '0';
        return [`(${value} * (1 + ${increase}/100))`, 0];
      };

      javascriptGenerator.forBlock['ortalama'] = function(block, generator) {
        const numbers = generator.valueToCode(block, 'NUMBERS', 0) || '[]';
        return [`(${numbers}.reduce((a,b)=>a+b,0) / ${numbers}.length)`, 0];
      };

      javascriptGenerator.forBlock['mod'] = function(block, generator) {
        const numbers = generator.valueToCode(block, 'NUMBERS', 0) || '[]';
        return 'console.log("Mod (En sık değer):", ' + numbers + ');\n';
      };

      javascriptGenerator.forBlock['medyan'] = function(block, generator) {
        const numbers = generator.valueToCode(block, 'NUMBERS', 0) || '[]';
        return 'console.log("Medyan:", ' + numbers + '.sort((a,b)=>a-b)[Math.floor(' + numbers + '.length/2)]);\n';
      };

      javascriptGenerator.forBlock['ranj'] = function(block, generator) {
        const numbers = generator.valueToCode(block, 'NUMBERS', 0) || '[]';
        return [`(Math.max(...${numbers}) - Math.min(...${numbers}))`, 0];
      };

      javascriptGenerator.forBlock['komsur_aci'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return [`(180 - ${angle})`, 0];
      };

      javascriptGenerator.forBlock['tumler_aci'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return [`(90 - ${angle})`, 0];
      };

      javascriptGenerator.forBlock['butunler_aci'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return [`(180 - ${angle})`, 0];
      };

      javascriptGenerator.forBlock['pisagor'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return [`Math.sqrt(${a}*${a} + ${b}*${b})`, 0];
      };

      javascriptGenerator.forBlock['pisagor_dik_kenar'] = function(block, generator) {
        const c = generator.valueToCode(block, 'C', 0) || '0';
        const a = generator.valueToCode(block, 'A', 0) || '0';
        return [`Math.sqrt(${c}*${c} - ${a}*${a})`, 0];
      };
    }
    
    if (level === 'lise') {
      javascriptGenerator.forBlock['polinom_topla'] = function(block, generator) {
        const poly1 = generator.valueToCode(block, 'POLY1', 0) || '""';
        const poly2 = generator.valueToCode(block, 'POLY2', 0) || '""';
        return 'console.log("Polinom toplama:", ' + poly1 + ' + " + " + ' + poly2 + ');\n';
      };

      javascriptGenerator.forBlock['logaritma'] = function(block, generator) {
        const number = generator.valueToCode(block, 'NUMBER', 0) || '1';
        const base = generator.valueToCode(block, 'BASE', 0) || '10';
        return 'console.log("Logaritma:", Math.log(' + number + ') / Math.log(' + base + '));\n';
      };

      javascriptGenerator.forBlock['trigonometri_sin'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return 'console.log("Sinüs:", Math.sin(' + angle + ' * Math.PI / 180));\n';
      };

      javascriptGenerator.forBlock['trigonometri_cos'] = function(block, generator) {
        const angle = generator.valueToCode(block, 'ANGLE', 0) || '0';
        return 'console.log("Kosinüs:", Math.cos(' + angle + ' * Math.PI / 180));\n';
      };

      javascriptGenerator.forBlock['turev_hesapla'] = function(block, generator) {
        const func = generator.valueToCode(block, 'FUNCTION', 0) || '""';
        return 'console.log("Türev hesaplanıyor:", ' + func + ');\n';
      };

      javascriptGenerator.forBlock['integral_hesapla'] = function(block, generator) {
        const func = generator.valueToCode(block, 'FUNCTION', 0) || '""';
        return 'console.log("İntegral hesaplanıyor:", ' + func + ');\n';
      };

      javascriptGenerator.forBlock['matris_carp'] = function(block, generator) {
        const matrix1 = generator.valueToCode(block, 'MATRIX1', 0) || '""';
        const matrix2 = generator.valueToCode(block, 'MATRIX2', 0) || '""';
        return 'console.log("Matris çarpımı:", ' + matrix1 + ' + " × " + ' + matrix2 + ');\n';
      };

      javascriptGenerator.forBlock['fonksiyon_grafik'] = function(block) {
        const func = block.getFieldValue('FUNCTION');
        return 'drawFunction("' + func + '");\n';
      };

      // Yeni Lise blokları kod üretecileri
      // Limit blokları
      javascriptGenerator.forBlock['limit_hesapla'] = function(block, generator) {
        const func = generator.valueToCode(block, 'FUNCTION', 0) || '""';
        const point = generator.valueToCode(block, 'POINT', 0) || '0';
        return 'console.log("Limit hesaplanıyor:", ' + func + ', "x →", ' + point + ');\n';
      };

      javascriptGenerator.forBlock['limit_sonsuz'] = function(block, generator) {
        const func = generator.valueToCode(block, 'FUNCTION', 0) || '""';
        const dir = block.getFieldValue('DIRECTION');
        return 'console.log("Sonsuzda limit:", ' + func + ', "x → ' + dir + '∞");\n';
      };

      // Türev blokları
      javascriptGenerator.forBlock['turev_polinom'] = function(block, generator) {
        const n = generator.valueToCode(block, 'N', 0) || '1';
        return 'console.log("Türev: d/dx(x^" + ' + n + ' + ") =", ' + n + ', "x^", ' + n + '-1);\n';
      };

      javascriptGenerator.forBlock['turev_trigonometri'] = function(block, generator) {
        const func = block.getFieldValue('FUNCTION');
        return 'console.log("Trigonometrik türev: d/dx(' + func + ')");\n';
      };

      javascriptGenerator.forBlock['turev_us'] = function(block, generator) {
        const base = generator.valueToCode(block, 'BASE', 0) || 'e';
        return 'console.log("Üstel türev: d/dx(" + ' + base + ' + "^x)");\n';
      };

      javascriptGenerator.forBlock['turev_logaritma'] = function(block, generator) {
        const base = generator.valueToCode(block, 'BASE', 0) || '10';
        return 'console.log("Logaritma türevi: d/dx(log_" + ' + base + ' + "(x))");\n';
      };

      // İntegral blokları
      javascriptGenerator.forBlock['integral_polinom'] = function(block, generator) {
        const n = generator.valueToCode(block, 'N', 0) || '1';
        return 'console.log("İntegral: ∫x^" + ' + n + ' + "dx = x^", ' + n + '+1, "/", ' + n + '+1, "+ C");\n';
      };

      javascriptGenerator.forBlock['integral_trigonometri'] = function(block, generator) {
        const func = block.getFieldValue('FUNCTION');
        return 'console.log("Trigonometrik integral: ∫' + func + 'dx");\n';
      };

      javascriptGenerator.forBlock['integral_belirli'] = function(block, generator) {
        const func = generator.valueToCode(block, 'FUNCTION', 0) || '""';
        const lower = generator.valueToCode(block, 'LOWER', 0) || '0';
        const upper = generator.valueToCode(block, 'UPPER', 0) || '1';
        return 'console.log("Belirli integral:", ' + lower + ', "ile", ' + upper + ', "arasında", ' + func + ');\n';
      };

      // Polinom ve logaritma
      javascriptGenerator.forBlock['polinom_kokler'] = function(block, generator) {
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        return 'console.log("Kökler:", (-' + b + ' + Math.sqrt(' + b + '*' + b + ' - 4*' + a + '*' + c + '))/(2*' + a + '), "ve", (-' + b + ' - Math.sqrt(' + b + '*' + b + ' - 4*' + a + '*' + c + '))/(2*' + a + '));\n';
      };

      javascriptGenerator.forBlock['logaritma_dogal'] = function(block, generator) {
        const number = generator.valueToCode(block, 'NUMBER', 0) || '1';
        return [`Math.log(${number})`, 0];
      };

      // Vektör işlemleri
      javascriptGenerator.forBlock['vektor_olustur'] = function(block, generator) {
        const x = generator.valueToCode(block, 'X', 0) || '0';
        const y = generator.valueToCode(block, 'Y', 0) || '0';
        return [`[${x}, ${y}]`, 0];
      };

      javascriptGenerator.forBlock['vektor_topla'] = function(block, generator) {
        const v1 = generator.valueToCode(block, 'VECTOR1', 0) || '[0,0]';
        const v2 = generator.valueToCode(block, 'VECTOR2', 0) || '[0,0]';
        return [`[${v1}[0]+${v2}[0], ${v1}[1]+${v2}[1]]`, 0];
      };

      javascriptGenerator.forBlock['vektor_skaler_carp'] = function(block, generator) {
        const scalar = generator.valueToCode(block, 'SCALAR', 0) || '1';
        const vector = generator.valueToCode(block, 'VECTOR', 0) || '[0,0]';
        return [`[${scalar}*${vector}[0], ${scalar}*${vector}[1]]`, 0];
      };

      javascriptGenerator.forBlock['vektor_ic_carpim'] = function(block, generator) {
        const v1 = generator.valueToCode(block, 'VECTOR1', 0) || '[0,0]';
        const v2 = generator.valueToCode(block, 'VECTOR2', 0) || '[0,0]';
        return [`(${v1}[0]*${v2}[0] + ${v1}[1]*${v2}[1])`, 0];
      };

      javascriptGenerator.forBlock['vektor_uzunluk'] = function(block, generator) {
        const vector = generator.valueToCode(block, 'VECTOR', 0) || '[0,0]';
        return [`Math.sqrt(${vector}[0]*${vector}[0] + ${vector}[1]*${vector}[1])`, 0];
      };

      // Matris işlemleri
      javascriptGenerator.forBlock['matris_olustur_2x2'] = function(block, generator) {
        const a11 = generator.valueToCode(block, 'A11', 0) || '0';
        const a12 = generator.valueToCode(block, 'A12', 0) || '0';
        const a21 = generator.valueToCode(block, 'A21', 0) || '0';
        const a22 = generator.valueToCode(block, 'A22', 0) || '0';
        return [`[[${a11}, ${a12}], [${a21}, ${a22}]]`, 0];
      };

      javascriptGenerator.forBlock['matris_topla'] = function(block, generator) {
        const m1 = generator.valueToCode(block, 'MATRIX1', 0) || '[[0,0],[0,0]]';
        const m2 = generator.valueToCode(block, 'MATRIX2', 0) || '[[0,0],[0,0]]';
        return [`"Matris toplama: " + JSON.stringify(${m1}) + " + " + JSON.stringify(${m2})`, 0];
      };

      javascriptGenerator.forBlock['matris_cikar'] = function(block, generator) {
        const m1 = generator.valueToCode(block, 'MATRIX1', 0) || '[[0,0],[0,0]]';
        const m2 = generator.valueToCode(block, 'MATRIX2', 0) || '[[0,0],[0,0]]';
        return [`"Matris çıkarma: " + JSON.stringify(${m1}) + " - " + JSON.stringify(${m2})`, 0];
      };

      javascriptGenerator.forBlock['matris_carp_complete'] = function(block, generator) {
        const m1 = generator.valueToCode(block, 'MATRIX1', 0) || '[[0,0],[0,0]]';
        const m2 = generator.valueToCode(block, 'MATRIX2', 0) || '[[0,0],[0,0]]';
        return [`"Matris çarpma: " + JSON.stringify(${m1}) + " × " + JSON.stringify(${m2})`, 0];
      };

      javascriptGenerator.forBlock['matris_determinant'] = function(block, generator) {
        const m = generator.valueToCode(block, 'MATRIX', 0) || '[[0,0],[0,0]]';
        return [`(${m}[0][0]*${m}[1][1] - ${m}[0][1]*${m}[1][0])`, 0];
      };

      javascriptGenerator.forBlock['matris_transpose'] = function(block, generator) {
        const m = generator.valueToCode(block, 'MATRIX', 0) || '[[0,0],[0,0]]';
        return [`"Matris transpozu: " + JSON.stringify(${m})`, 0];
      };

      javascriptGenerator.forBlock['matris_skaler_carp'] = function(block, generator) {
        const scalar = generator.valueToCode(block, 'SCALAR', 0) || '1';
        const matrix = generator.valueToCode(block, 'MATRIX', 0) || '[[0,0],[0,0]]';
        return [`"Matris skaler çarpımı: " + ${scalar} + " × " + JSON.stringify(${matrix})`, 0];
      };

      // Permütasyon ve Kombinasyon
      javascriptGenerator.forBlock['permutasyon'] = function(block, generator) {
        const n = generator.valueToCode(block, 'N', 0) || '1';
        const r = generator.valueToCode(block, 'R', 0) || '1';
        // P(n,r) = n! / (n-r)!
        const factorialCode = `(function factorial(num) {
          if (num <= 1) return 1;
          let result = 1;
          for (let i = 2; i <= num; i++) result *= i;
          return result;
        })`;
        return [`(${factorialCode}(${n}) / ${factorialCode}(${n} - ${r}))`, 0];
      };

      javascriptGenerator.forBlock['kombinasyon'] = function(block, generator) {
        const n = generator.valueToCode(block, 'N', 0) || '1';
        const r = generator.valueToCode(block, 'R', 0) || '1';
        // C(n,r) = n! / (r! * (n-r)!)
        const factorialCode = `(function factorial(num) {
          if (num <= 1) return 1;
          let result = 1;
          for (let i = 2; i <= num; i++) result *= i;
          return result;
        })`;
        return [`(${factorialCode}(${n}) / (${factorialCode}(${r}) * ${factorialCode}(${n} - ${r})))`, 0];
      };

      javascriptGenerator.forBlock['faktoriyel'] = function(block, generator) {
        const n = generator.valueToCode(block, 'N', 0) || '1';
        // n! = n × (n-1) × (n-2) × ... × 2 × 1
        const factorialCode = `(function factorial(num) {
          if (num <= 1) return 1;
          let result = 1;
          for (let i = 2; i <= num; i++) result *= i;
          return result;
        })(${n})`;
        return [factorialCode, 0];
      };

      // Diziler ve Seriler
      javascriptGenerator.forBlock['aritmetik_dizi'] = function(block, generator) {
        const first = generator.valueToCode(block, 'FIRST', 0) || '0';
        const diff = generator.valueToCode(block, 'DIFF', 0) || '1';
        const n = generator.valueToCode(block, 'N', 0) || '1';
        return [`(${first} + (${n}-1)*${diff})`, 0];
      };

      javascriptGenerator.forBlock['geometrik_dizi'] = function(block, generator) {
        const first = generator.valueToCode(block, 'FIRST', 0) || '1';
        const ratio = generator.valueToCode(block, 'RATIO', 0) || '1';
        const n = generator.valueToCode(block, 'N', 0) || '1';
        return [`(${first} * Math.pow(${ratio}, ${n}-1))`, 0];
      };

      javascriptGenerator.forBlock['aritmetik_toplam'] = function(block, generator) {
        const first = generator.valueToCode(block, 'FIRST', 0) || '0';
        const last = generator.valueToCode(block, 'LAST', 0) || '0';
        const n = generator.valueToCode(block, 'N', 0) || '1';
        return [`(${n} * (${first} + ${last}) / 2)`, 0];
      };

      javascriptGenerator.forBlock['geometrik_toplam'] = function(block, generator) {
        const first = generator.valueToCode(block, 'FIRST', 0) || '1';
        const ratio = generator.valueToCode(block, 'RATIO', 0) || '1';
        const n = generator.valueToCode(block, 'N', 0) || '1';
        return [`(${first} * (1 - Math.pow(${ratio}, ${n})) / (1 - ${ratio}))`, 0];
      };

      javascriptGenerator.forBlock['fibonacci_terim'] = function(block, generator) {
        const n = generator.valueToCode(block, 'N', 0) || '1';
        // Fibonacci hesaplama: F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1
        const fibCode = `(function fib(num) {
          if (num <= 0) return 0;
          if (num === 1) return 1;
          let a = 0, b = 1;
          for (let i = 2; i <= num; i++) {
            let temp = a + b;
            a = b;
            b = temp;
          }
          return b;
        })(${n})`;
        return [fibCode, 0];
      };

      // Analitik Geometri
      javascriptGenerator.forBlock['dogru_denklemi'] = function(block, generator) {
        const m = generator.valueToCode(block, 'M', 0) || '0';
        const b = generator.valueToCode(block, 'B', 0) || '0';
        return [`"y = ${m}x + ${b}"`, 0];
      };

      javascriptGenerator.forBlock['iki_nokta_dogru'] = function(block, generator) {
        const x1 = generator.valueToCode(block, 'X1', 0) || '0';
        const y1 = generator.valueToCode(block, 'Y1', 0) || '0';
        const x2 = generator.valueToCode(block, 'X2', 0) || '0';
        const y2 = generator.valueToCode(block, 'Y2', 0) || '0';
        // Eğim = (y2-y1)/(x2-x1), y-y1 = m(x-x1)
        return [`"y - " + ${y1} + " = " + ((${y2} - ${y1}) / (${x2} - ${x1})) + "(x - " + ${x1} + ")"`, 0];
      };

      javascriptGenerator.forBlock['nokta_arasi_mesafe'] = function(block, generator) {
        const x1 = generator.valueToCode(block, 'X1', 0) || '0';
        const y1 = generator.valueToCode(block, 'Y1', 0) || '0';
        const x2 = generator.valueToCode(block, 'X2', 0) || '0';
        const y2 = generator.valueToCode(block, 'Y2', 0) || '0';
        return [`Math.sqrt(Math.pow(${x2}-${x1}, 2) + Math.pow(${y2}-${y1}, 2))`, 0];
      };

      javascriptGenerator.forBlock['orta_nokta'] = function(block, generator) {
        const x1 = generator.valueToCode(block, 'X1', 0) || '0';
        const y1 = generator.valueToCode(block, 'Y1', 0) || '0';
        const x2 = generator.valueToCode(block, 'X2', 0) || '0';
        const y2 = generator.valueToCode(block, 'Y2', 0) || '0';
        return [`[(${x1}+${x2})/2, (${y1}+${y2})/2]`, 0];
      };

      javascriptGenerator.forBlock['cember_denklemi'] = function(block, generator) {
        const h = generator.valueToCode(block, 'H', 0) || '0';
        const k = generator.valueToCode(block, 'K', 0) || '0';
        const r = generator.valueToCode(block, 'R', 0) || '1';
        return [`"(x-${h})² + (y-${k})² = ${r}²"`, 0];
      };

      javascriptGenerator.forBlock['noktadan_dogruya_mesafe'] = function(block, generator) {
        const x0 = generator.valueToCode(block, 'X0', 0) || '0';
        const y0 = generator.valueToCode(block, 'Y0', 0) || '0';
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '1';
        const c = generator.valueToCode(block, 'C', 0) || '0';
        return [`Math.abs(${a}*${x0} + ${b}*${y0} + ${c}) / Math.sqrt(${a}*${a} + ${b}*${b})`, 0];
      };

      // Konik Kesitler
      javascriptGenerator.forBlock['parabol_denklemi'] = function(block, generator) {
        const h = generator.valueToCode(block, 'H', 0) || '0';
        const k = generator.valueToCode(block, 'K', 0) || '0';
        const p = generator.valueToCode(block, 'P', 0) || '1';
        const dir = block.getFieldValue('DIRECTION');
        if (dir === 'up' || dir === 'down') {
          return [`"(x - ${h})² = " + (4 * ${p}) + "(y - ${k})"`, 0];
        } else {
          return [`"(y - ${k})² = " + (4 * ${p}) + "(x - ${h})"`, 0];
        }
      };

      javascriptGenerator.forBlock['elips_denklemi'] = function(block, generator) {
        const h = generator.valueToCode(block, 'H', 0) || '0';
        const k = generator.valueToCode(block, 'K', 0) || '0';
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '1';
        return [`"(x-${h})²/${a}² + (y-${k})²/${b}² = 1"`, 0];
      };

      javascriptGenerator.forBlock['hiperbol_denklemi'] = function(block, generator) {
        const h = generator.valueToCode(block, 'H', 0) || '0';
        const k = generator.valueToCode(block, 'K', 0) || '0';
        const a = generator.valueToCode(block, 'A', 0) || '1';
        const b = generator.valueToCode(block, 'B', 0) || '1';
        const orientation = block.getFieldValue('ORIENTATION');
        if (orientation === 'horizontal') {
          return [`"(x-${h})²/${a}² - (y-${k})²/${b}² = 1"`, 0];
        } else {
          return [`"(y-${k})²/${a}² - (x-${h})²/${b}² = 1"`, 0];
        }
      };

      // Karmaşık Sayılar
      javascriptGenerator.forBlock['karmasik_sayi'] = function(block, generator) {
        const real = generator.valueToCode(block, 'REAL', 0) || '0';
        const imag = generator.valueToCode(block, 'IMAG', 0) || '0';
        return [`"${real} + ${imag}i"`, 0];
      };

      javascriptGenerator.forBlock['karmasik_topla'] = function(block, generator) {
        const z1 = generator.valueToCode(block, 'Z1', 0) || '"0+0i"';
        const z2 = generator.valueToCode(block, 'Z2', 0) || '"0+0i"';
        return [`"Karmaşık toplama: " + ${z1} + " + " + ${z2}`, 0];
      };

      javascriptGenerator.forBlock['karmasik_carp'] = function(block, generator) {
        const z1 = generator.valueToCode(block, 'Z1', 0) || '"0+0i"';
        const z2 = generator.valueToCode(block, 'Z2', 0) || '"0+0i"';
        return [`"Karmaşık çarpma: " + ${z1} + " × " + ${z2}`, 0];
      };

      javascriptGenerator.forBlock['karmasik_eslenigi'] = function(block, generator) {
        const z = generator.valueToCode(block, 'Z', 0) || '"0+0i"';
        return [`"Eşlenik: " + ${z}`, 0];
      };

      javascriptGenerator.forBlock['karmasik_modulus'] = function(block, generator) {
        const z = generator.valueToCode(block, 'Z', 0) || '"0+0i"';
        return [`"Modül: " + ${z}`, 0];
      };

      // Katı Cisimler
      javascriptGenerator.forBlock['kup_hacim'] = function(block, generator) {
        const edge = generator.valueToCode(block, 'EDGE', 0) || '1';
        return [`Math.pow(${edge}, 3)`, 0];
      };

      javascriptGenerator.forBlock['dikdortgen_prizma_hacim'] = function(block, generator) {
        const length = generator.valueToCode(block, 'LENGTH', 0) || '1';
        const width = generator.valueToCode(block, 'WIDTH', 0) || '1';
        const height = generator.valueToCode(block, 'HEIGHT', 0) || '1';
        return [`(${length} * ${width} * ${height})`, 0];
      };

      javascriptGenerator.forBlock['silindir_hacim'] = function(block, generator) {
        const radius = generator.valueToCode(block, 'RADIUS', 0) || '1';
        const height = generator.valueToCode(block, 'HEIGHT', 0) || '1';
        return [`(Math.PI * ${radius} * ${radius} * ${height})`, 0];
      };

      javascriptGenerator.forBlock['koni_hacim'] = function(block, generator) {
        const radius = generator.valueToCode(block, 'RADIUS', 0) || '1';
        const height = generator.valueToCode(block, 'HEIGHT', 0) || '1';
        return [`((1/3) * Math.PI * ${radius} * ${radius} * ${height})`, 0];
      };

      javascriptGenerator.forBlock['kure_hacim'] = function(block, generator) {
        const radius = generator.valueToCode(block, 'RADIUS', 0) || '1';
        return [`((4/3) * Math.PI * Math.pow(${radius}, 3))`, 0];
      };

      javascriptGenerator.forBlock['kure_yuzey_alani'] = function(block, generator) {
        const radius = generator.valueToCode(block, 'RADIUS', 0) || '1';
        return [`(4 * Math.PI * ${radius} * ${radius})`, 0];
      };

      // 3D ŞEKİLLER - ÇİZ ve HESAPLA Jeneratörleri
      javascriptGenerator.forBlock['koni_ciz_hesapla'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '50';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '100';
        return 'drawShape("3d-shape", {\n' +
          '  shape: "koni",\n' +
          '  radius: ' + yaricap + ',\n' +
          '  height: ' + yukseklik + ',\n' +
          '  label: "Koni (r=" + ' + yaricap + ' + ", h=" + ' + yukseklik + ' + ")",\n' +
          '  calculation: {\n' +
          '    hacim: (1/3) * Math.PI * ' + yaricap + ' * ' + yaricap + ' * ' + yukseklik + ',\n' +
          '    yan_alan: Math.PI * ' + yaricap + ' * Math.sqrt(' + yaricap + '*' + yaricap + ' + ' + yukseklik + '*' + yukseklik + '),\n' +
          '    toplam_alan: Math.PI * ' + yaricap + ' * (' + yaricap + ' + Math.sqrt(' + yaricap + '*' + yaricap + ' + ' + yukseklik + '*' + yukseklik + '))\n' +
          '  }\n' +
          '});\n' +
          'console.log("Koni: Hacim = " + ((1/3) * Math.PI * ' + yaricap + ' * ' + yaricap + ' * ' + yukseklik + ').toFixed(2) + ", Toplam Alan = " + (Math.PI * ' + yaricap + ' * (' + yaricap + ' + Math.sqrt(' + yaricap + '*' + yaricap + ' + ' + yukseklik + '*' + yukseklik + '))).toFixed(2));\n';
      };

      javascriptGenerator.forBlock['silindir_ciz_hesapla'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '50';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '100';
        return 'drawShape("3d-shape", {\n' +
          '  shape: "silindir",\n' +
          '  radius: ' + yaricap + ',\n' +
          '  height: ' + yukseklik + ',\n' +
          '  label: "Silindir (r=" + ' + yaricap + ' + ", h=" + ' + yukseklik + ' + ")",\n' +
          '  calculation: {\n' +
          '    hacim: Math.PI * ' + yaricap + ' * ' + yaricap + ' * ' + yukseklik + ',\n' +
          '    yan_alan: 2 * Math.PI * ' + yaricap + ' * ' + yukseklik + ',\n' +
          '    toplam_alan: 2 * Math.PI * ' + yaricap + ' * (' + yaricap + ' + ' + yukseklik + ')\n' +
          '  }\n' +
          '});\n' +
          'console.log("Silindir: Hacim = " + (Math.PI * ' + yaricap + ' * ' + yaricap + ' * ' + yukseklik + ').toFixed(2) + ", Toplam Alan = " + (2 * Math.PI * ' + yaricap + ' * (' + yaricap + ' + ' + yukseklik + ')).toFixed(2));\n';
      };

      javascriptGenerator.forBlock['kure_ciz_hesapla'] = function(block, generator) {
        const yaricap = generator.valueToCode(block, 'YARICAP', 0) || '60';
        return 'drawShape("3d-shape", {\n' +
          '  shape: "küre",\n' +
          '  radius: ' + yaricap + ',\n' +
          '  label: "Küre (r=" + ' + yaricap + ' + ")",\n' +
          '  calculation: {\n' +
          '    hacim: (4/3) * Math.PI * Math.pow(' + yaricap + ', 3),\n' +
          '    alan: 4 * Math.PI * ' + yaricap + ' * ' + yaricap + '\n' +
          '  }\n' +
          '});\n' +
          'console.log("Küre: Hacim = " + ((4/3) * Math.PI * Math.pow(' + yaricap + ', 3)).toFixed(2) + ", Alan = " + (4 * Math.PI * ' + yaricap + ' * ' + yaricap + ').toFixed(2));\n';
      };

      javascriptGenerator.forBlock['kup_ciz_hesapla'] = function(block, generator) {
        const kenar = generator.valueToCode(block, 'KENAR', 0) || '70';
        return 'drawShape("3d-shape", {\n' +
          '  shape: "küp",\n' +
          '  edge: ' + kenar + ',\n' +
          '  label: "Küp (a=" + ' + kenar + ' + ")",\n' +
          '  calculation: {\n' +
          '    hacim: Math.pow(' + kenar + ', 3),\n' +
          '    alan: 6 * ' + kenar + ' * ' + kenar + '\n' +
          '  }\n' +
          '});\n' +
          'console.log("Küp: Hacim = " + Math.pow(' + kenar + ', 3).toFixed(2) + ", Alan = " + (6 * ' + kenar + ' * ' + kenar + ').toFixed(2));\n';
      };

      javascriptGenerator.forBlock['dikdortgen_prizma_ciz_hesapla'] = function(block, generator) {
        const genislik = generator.valueToCode(block, 'GENISLIK', 0) || '60';
        const uzunluk = generator.valueToCode(block, 'UZUNLUK', 0) || '80';
        const yukseklik = generator.valueToCode(block, 'YUKSEKLIK', 0) || '50';
        return 'drawShape("3d-shape", {\n' +
          '  shape: "dikdörtgen_prizma",\n' +
          '  width: ' + genislik + ',\n' +
          '  length: ' + uzunluk + ',\n' +
          '  height: ' + yukseklik + ',\n' +
          '  label: "Dikdörtgen Prizma (" + ' + genislik + ' + "x" + ' + uzunluk + ' + "x" + ' + yukseklik + ' + ")",\n' +
          '  calculation: {\n' +
          '    hacim: ' + genislik + ' * ' + uzunluk + ' * ' + yukseklik + ',\n' +
          '    alan: 2 * (' + genislik + '*' + uzunluk + ' + ' + genislik + '*' + yukseklik + ' + ' + uzunluk + '*' + yukseklik + ')\n' +
          '  }\n' +
          '});\n' +
          'console.log("Dikdörtgen Prizma: Hacim = " + (' + genislik + ' * ' + uzunluk + ' * ' + yukseklik + ').toFixed(2) + ", Alan = " + (2 * (' + genislik + '*' + uzunluk + ' + ' + genislik + '*' + yukseklik + ' + ' + uzunluk + '*' + yukseklik + ')).toFixed(2));\n';
      };
    }
  };

  useEffect(() => {
    // Mevcut workspace'i temizle
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
      workspaceRef.current = null;
    }

    if (blocklyDiv.current) {
      // Standart Blockly bloklarını yükle
      Object.assign(Blockly.Blocks, libraryBlocks);

      // Özel blokları kaydet
      registerBlocks(commonBlocks);
      registerBlocks(ilkokulBlocks);
      registerBlocks(ortaokulBlocks);
      registerBlocks(liseBlocks);

      // Kod üreticilerini kaydet
      registerGenerators(selectedLevel);

      // Workspace oluştur
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxConfigs[selectedLevel],
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: false,
          wheel: false,
          startScale: 1.0,
          maxScale: 1.0,
          minScale: 1.0,
          scaleSpeed: 1.0
        },
        trashcan: true
      });

      // Başlangıç blokları ekle
      const xml = Blockly.utils.xml.textToDom(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="math_number" x="50" y="50">
            <field name="NUM">5</field>
          </block>
        </xml>
      `);
      Blockly.Xml.domToWorkspace(xml, workspaceRef.current);

      // Separator çizgisini DOM'dan kaldır
      setTimeout(() => {
        const blocklyDiv = document.querySelector('.blocklySvg');
        if (blocklyDiv) {
          const lines = blocklyDiv.querySelectorAll('line');
          lines.forEach((line: any) => {
            const x1 = line.getAttribute('x1');
            const x2 = line.getAttribute('x2');
            // Dikey çizgileri bul (x1 ve x2 aynı)
            if (x1 === x2) {
              line.style.display = 'none';
            }
          });
        }
      }, 100);

      // Workspace'e tıklandığında flyout'u kapat
      workspaceRef.current.addChangeListener((event: any) => {
        if (event.type === Blockly.Events.CLICK && workspaceRef.current) {
          const toolbox = workspaceRef.current.getToolbox();
          if (toolbox && toolbox.getFlyout()) {
            toolbox.getFlyout()?.hide();
          }
        }
      });
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [selectedLevel]);

  const runCode = () => {
    // Önce kodu üret
    if (workspaceRef.current) {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      setGeneratedCode(code);

      // Kod boşsa çalıştırma
      if (!code || code.trim() === '') {
        setOutput(['⚠️ Workspace boş! Lütfen blokları kullanarak bir program oluşturun.']);
        return;
      }

      setOutput([]);

      // Console.log'u yakalama
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      // Görselleştirme fonksiyonlarını tanımla
      const drawShape = (type: string, data?: any, x?: number, y?: number) => {
        // Yeni format: drawShape('2d-shape', { shape: 'daire', ... })
        if (type === '2d-shape' || type === '3d-shape') {
          setVisualizationType(type);
          setVisualizationData(data);
        }
        // Eski format: drawShape('daire', x, y) - geriye dönük uyumluluk
        else if (typeof x === 'number' && typeof y === 'number') {
          setVisualizationType('geometry');
          setVisualizationData({
            shapes: [{
              type: type === 'daire' ? 'circle' : type === 'ucgen' ? 'triangle' : 'rectangle',
              x: x * 20 + 200,
              y: y * 20 + 150,
              width: 50,
              height: 50,
              radius: 25,
              color: '#3b82f6',
              fillColor: 'rgba(59, 130, 246, 0.2)',
              label: type
            }]
          });
        }
      };

      const drawChart = (chartType: string, data: string) => {
        setVisualizationType('chart');
        try {
          const values = JSON.parse(data.replace(/"/g, ''));
          setVisualizationData({ values });
        } catch {
          setVisualizationData({ values: [1, 2, 3, 4, 5] });
        }
      };

      const drawFunction = (func: string) => {
        setVisualizationType('function');
        setVisualizationData({ function: func });
      };

      try {
        // Function constructor ile güvenli kod çalıştırma (eval yerine)
        // Bu yöntem daha güvenli çünkü izole bir scope'ta çalışır
        const safeFunction = new Function(
          'console',
          'drawShape',
          'drawChart',
          'drawFunction',
          'Math',
          code
        );

        safeFunction(
          { log: (...args: unknown[]) => logs.push(args.join(' ')) },
          drawShape,
          drawChart,
          drawFunction,
          Math
        );

        setOutput(logs);
      } catch (error) {
        setOutput([`❌ Hata: ${error instanceof Error ? error.message : String(error)}`]);
      } finally {
        console.log = originalLog;
      }
    }
  };

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      setGeneratedCode('');
      setOutput([]);
      setVisualizationData(null);
    }
  };

  const handleLevelChange = (level: MathLevel) => {
    setSelectedLevel(level);
    setGeneratedCode('');
    setOutput([]);
    setVisualizationData(null);
  };

  return (
    <div className="space-y-4">
      {/* Seviye Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle>Matematik Seviyesi Seçin</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seviye seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ilkokul">İlkokul (1-4. Sınıf)</SelectItem>
              <SelectItem value="ortaokul">Ortaokul (5-8. Sınıf)</SelectItem>
              <SelectItem value="lise">Lise (9-12. Sınıf)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600 mt-2">
            Seçilen seviye: <strong>{selectedLevel === 'ilkokul' ? 'İlkokul' : selectedLevel === 'ortaokul' ? 'Ortaokul' : 'Lise'}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Kontrol Butonları */}
      <Card>
        <CardHeader>
          <CardTitle>Kontroller</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={runCode} variant="default" className="bg-green-600 hover:bg-green-700">
            ▶️ Çalıştır
          </Button>
          <Button onClick={clearWorkspace} variant="destructive">
            🗑️ Temizle
          </Button>
        </CardContent>
      </Card>

      {/* Tam Ekran Blockly Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Matematik Blok Editörü - {selectedLevel === 'ilkokul' ? 'İlkokul' : selectedLevel === 'ortaokul' ? 'Ortaokul' : 'Lise'}</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {/* Blockly Workspace - Tam Genişlik */}
          <div
            ref={blocklyDiv}
            style={{ height: '700px', width: '100%' }}
            className="border-2 border-gray-300 rounded-lg shadow-inner"
          />

          {/* Sonuç Paneli - Sağ Üst Köşe (Overlay) */}
          {output.length > 0 && (
            <div className="absolute top-4 right-4 z-50 w-80 max-h-96 overflow-y-auto">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🧮</span>
                      Canlı Sonuçlar
                    </span>
                    <button
                      onClick={() => setOutput([])}
                      className="text-white hover:text-red-200 transition-colors"
                      title="Sonuçları Temizle"
                    >
                      ✕
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {output.map((line, index) => {
                      // Boole değerlerini Türkçeleştir
                      const localizedLine = line
                        .replace(/\btrue\b/g, 'doğru')
                        .replace(/\bfalse\b/g, 'yanlış');

                      const isResult = localizedLine.includes('Sonuç') || localizedLine.includes('Hesaplama');
                      const parts = localizedLine.split(':');
                      const label = parts[0]?.trim() || '';
                      const value = parts[1]?.trim() || localizedLine;

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                            isResult
                              ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400 shadow-md'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          {isResult ? (
                            <div>
                              <div className="text-xs text-gray-600 mb-1">{label}</div>
                              <div className="text-2xl font-bold text-blue-700 font-mono">
                                {value}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-mono text-gray-700">{localizedLine}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Mini İstatistikler */}
                  <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{output.length}</div>
                        <div className="text-xs text-gray-600">İşlem</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {output.filter(l => l.includes('Sonuç') || l.includes('Hesaplama')).length}
                        </div>
                        <div className="text-xs text-gray-600">Sonuç</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Üretilen Kod (Opsiyonel - Gelişmiş kullanıcılar için) */}
          {generatedCode && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium p-2 bg-gray-100 rounded">
                📝 Üretilen JavaScript Kodunu Göster (Gelişmiş)
              </summary>
              <div className="mt-2 bg-gray-800 text-green-400 p-4 rounded-md">
                <pre className="overflow-x-auto text-xs font-mono">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Matematiksel Görselleştirme */}
      {visualizationData && (
        <MathVisualization 
          type={visualizationType}
          data={visualizationData}
          width={400}
          height={300}
        />
      )}
    </div>
  );
}
