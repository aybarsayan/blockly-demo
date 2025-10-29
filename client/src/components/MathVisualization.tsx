import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MathVisualizationProps {
  type: 'graph' | 'geometry' | 'chart' | 'function' | '2d-shape' | '3d-shape';
  data?: any;
  width?: number;
  height?: number;
}

export default function MathVisualization({ 
  type, 
  data, 
  width = 400, 
  height = 300 
}: MathVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, width, height);

    switch (type) {
      case 'graph':
        drawCoordinateSystem(ctx, width, height);
        if (data?.points) {
          drawPoints(ctx, data.points);
        }
        if (data?.function) {
          drawFunction(ctx, data.function, width, height);
        }
        break;

      case 'geometry':
        drawGeometricShapes(ctx, data, width, height);
        break;

      case 'chart':
        drawChart(ctx, data, width, height);
        break;

      case 'function':
        drawFunctionGraph(ctx, data, width, height);
        break;

      case '2d-shape':
        draw2DShape(ctx, data, width, height);
        break;

      case '3d-shape':
        draw3DShape(ctx, data, width, height);
        break;
    }
  }, [type, data, width, height]);

  const drawCoordinateSystem = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Yatay çizgiler
    for (let i = 0; i <= 10; i++) {
      const y = (h / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Dikey çizgiler
    for (let i = 0; i <= 10; i++) {
      const x = (w / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Ana eksenler
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X ekseni
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    
    // Y ekseni
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
  };

  const drawPoints = (ctx: CanvasRenderingContext2D, points: Array<{x: number, y: number, label?: string}>) => {
    ctx.fillStyle = '#3b82f6';
    
    points.forEach(point => {
      const x = (point.x + 5) * (400 / 10);
      const y = (5 - point.y) * (300 / 10);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      if (point.label) {
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.fillText(point.label, x + 8, y - 8);
        ctx.fillStyle = '#3b82f6';
      }
    });
  };

  const drawFunction = (ctx: CanvasRenderingContext2D, func: string, w: number, h: number) => {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let firstPoint = true;
    for (let x = -5; x <= 5; x += 0.1) {
      let y;
      try {
        // Basit fonksiyon değerlendirmesi
        if (func.includes('x^2')) {
          y = x * x;
        } else if (func.includes('x^3')) {
          y = x * x * x;
        } else if (func.includes('sin')) {
          y = Math.sin(x);
        } else if (func.includes('cos')) {
          y = Math.cos(x);
        } else if (func.includes('2x')) {
          y = 2 * x;
        } else {
          y = x; // Linear function
        }
        
        const canvasX = (x + 5) * (w / 10);
        const canvasY = (5 - y) * (h / 10);
        
        if (firstPoint) {
          ctx.moveTo(canvasX, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      } catch (e) {
        // Hata durumunda devam et
      }
    }
    
    ctx.stroke();
  };

  const drawGeometricShapes = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number) => {
    if (!data?.shapes) return;
    
    data.shapes.forEach((shape: any, index: number) => {
      ctx.strokeStyle = shape.color || '#3b82f6';
      ctx.fillStyle = shape.fillColor || 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      
      switch (shape.type) {
        case 'rectangle':
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
          
        case 'circle':
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.lineTo(shape.x3, shape.y3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
      
      // Şekil etiketini çiz
      if (shape.label) {
        ctx.fillStyle = '#374151';
        ctx.font = '14px Arial';
        ctx.fillText(shape.label, shape.x, shape.y - 10);
      }
    });
  };

  const drawChart = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number) => {
    if (!data?.values) return;
    
    const values = data.values;
    const maxValue = Math.max(...values);
    const barWidth = w / values.length;
    
    values.forEach((value: number, index: number) => {
      const barHeight = (value / maxValue) * h * 0.8;
      const x = index * barWidth;
      const y = h - barHeight;
      
      ctx.fillStyle = `hsl(${(index * 360) / values.length}, 70%, 50%)`;
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
      
      // Değer etiketini çiz
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.fillText(value.toString(), x + barWidth / 2 - 10, y - 5);
    });
  };

  const drawFunctionGraph = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number) => {
    if (!data?.function) return;

    drawCoordinateSystem(ctx, w, h);
    drawFunction(ctx, data.function, w, h);
  };

  const draw2DShape = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number) => {
    if (!data?.shape) return;

    // Arka plan - açık gri gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#f9fafb');
    gradient.addColorStop(1, '#f3f4f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const { shape, yaricap, kenar, genislik, yukseklik, taban, label, calculation } = data;

    // Gölge ayarları
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    switch (shape) {
      case 'daire':
        drawCircle2D(ctx, centerX, centerY, yaricap || 60, label, calculation);
        break;
      case 'kare':
        drawSquare2D(ctx, centerX, centerY, kenar || 80, label, calculation);
        break;
      case 'dikdortgen':
        drawRectangle2D(ctx, centerX, centerY, genislik || 100, yukseklik || 70, label, calculation);
        break;
      case 'ucgen':
        drawTriangle2D(ctx, centerX, centerY, taban || 100, yukseklik || 80, label, calculation);
        break;
    }

    // Gölgeyi kapat
    ctx.shadowColor = 'transparent';
  };

  const draw3DShape = (ctx: CanvasRenderingContext2D, data: any, w: number, h: number) => {
    if (!data?.shape) return;

    // Arka plan - açık mavi gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const { shape, radius, height: shapeHeight, label, calculation } = data;

    // Gölge ayarları
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    switch (shape) {
      case 'koni':
        drawCone(ctx, centerX, centerY, radius || 60, shapeHeight || 100, label, calculation);
        break;
      case 'silindir':
        drawCylinder(ctx, centerX, centerY, radius || 60, shapeHeight || 100, label, calculation);
        break;
      case 'küre':
        drawSphere(ctx, centerX, centerY, radius || 80, label, calculation);
        break;
      case 'küp':
        drawCube(ctx, centerX, centerY, radius || 80, label, calculation);
        break;
      case 'dikdörtgen_prizma':
        drawRectangularPrism(ctx, centerX, centerY, data.width || 80, data.length || 100, shapeHeight || 120, label, calculation);
        break;
      case 'daire':
        drawCircle2D(ctx, centerX, centerY, radius || 80, label, calculation);
        break;
      case 'dikdörtgen':
        drawRectangle2D(ctx, centerX, centerY, data.width || 120, shapeHeight || 80, label, calculation);
        break;
      case 'kare':
        drawSquare2D(ctx, centerX, centerY, data.side || 100, label, calculation);
        break;
      case 'üçgen':
        drawTriangle2D(ctx, centerX, centerY, data.base || 120, shapeHeight || 100, label, calculation);
        break;
    }

    ctx.shadowColor = 'transparent';
  };

  const drawCone = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, h: number, label?: string, calc?: any) => {
    // Koni tabanı (elips)
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(x, y + h / 2, r, r * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Koni yüzeyi
    const gradient = ctx.createLinearGradient(x - r, y - h / 2, x + r, y + h / 2);
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x - r, y + h / 2);
    ctx.ellipse(x, y + h / 2, r, r * 0.3, 0, 0, Math.PI, false);
    ctx.lineTo(x + r, y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ölçüler
    drawMeasurements(ctx, x, y, r, h, 'koni', calc);

    // Etiket
    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 20, y - h / 2 - 20);
    }
  };

  const drawCylinder = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, h: number, label?: string, calc?: any) => {
    // Üst elips
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(x, y - h / 2, r, r * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Silindir gövdesi
    const gradient = ctx.createLinearGradient(x - r, y - h / 2, x + r, y + h / 2);
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    ctx.fillStyle = gradient;

    ctx.fillRect(x - r, y - h / 2, r * 2, h);
    ctx.strokeRect(x - r, y - h / 2, r * 2, h);

    // Alt elips
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.ellipse(x, y + h / 2, r, r * 0.3, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Ölçüler
    drawMeasurements(ctx, x, y, r, h, 'silindir', calc);

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 30, y - h / 2 - 20);
    }
  };

  const drawSphere = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, label?: string, calc?: any) => {
    // Küre (gradient ile 3D efekti)
    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    gradient.addColorStop(0, '#93c5fd');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ekvator çizgisi
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.3, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Dikey çizgi
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.3, r, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Yarıçap çizgisi ve ölçüsü
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + r, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(`r = ${r}`, x + r / 2 - 10, y - 10);

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + r + 30;
      if (calc.hacim) ctx.fillText(`Hacim = ${calc.hacim.toFixed(2)}`, x - 60, yOffset);
      if (calc.alan) ctx.fillText(`Alan = ${calc.alan.toFixed(2)}`, x - 60, yOffset + 20);
    }

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 20, y - r - 20);
    }
  };

  const drawCube = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, label?: string, calc?: any) => {
    const s = size;
    const offset = s * 0.3;

    // Arka yüz
    ctx.fillStyle = '#60a5fa';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.fillRect(x - s / 2 + offset, y - s / 2 - offset, s, s);
    ctx.strokeRect(x - s / 2 + offset, y - s / 2 - offset, s, s);

    // Bağlantı çizgileri
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(x - s / 2, y - s / 2);
    ctx.lineTo(x - s / 2 + offset, y - s / 2 - offset);
    ctx.moveTo(x + s / 2, y - s / 2);
    ctx.lineTo(x + s / 2 + offset, y - s / 2 - offset);
    ctx.moveTo(x - s / 2, y + s / 2);
    ctx.lineTo(x - s / 2 + offset, y + s / 2 - offset);
    ctx.moveTo(x + s / 2, y + s / 2);
    ctx.lineTo(x + s / 2 + offset, y + s / 2 - offset);
    ctx.stroke();

    // Ön yüz
    const gradient = ctx.createLinearGradient(x - s / 2, y - s / 2, x + s / 2, y + s / 2);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    ctx.strokeStyle = '#1e40af';
    ctx.strokeRect(x - s / 2, y - s / 2, s, s);

    // Kenar ölçüsü
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x - s / 2 - 15, y - s / 2);
    ctx.lineTo(x - s / 2 - 15, y + s / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(`${s}`, x - s / 2 - 35, y);

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + s / 2 + 30;
      if (calc.hacim) ctx.fillText(`Hacim = ${calc.hacim}`, x - 40, yOffset);
      if (calc.alan) ctx.fillText(`Yüzey Alanı = ${calc.alan}`, x - 60, yOffset + 20);
    }

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 20, y - s / 2 - 20);
    }
  };

  const drawRectangularPrism = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, l: number, h: number, label?: string, calc?: any) => {
    const offsetX = w * 0.3;
    const offsetY = h * 0.3;

    // Arka yüz
    ctx.fillStyle = '#60a5fa';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.fillRect(x - w / 2 + offsetX, y - h / 2 - offsetY, w, h);
    ctx.strokeRect(x - w / 2 + offsetX, y - h / 2 - offsetY, w, h);

    // Bağlantılar
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2);
    ctx.lineTo(x - w / 2 + offsetX, y - h / 2 - offsetY);
    ctx.moveTo(x + w / 2, y - h / 2);
    ctx.lineTo(x + w / 2 + offsetX, y - h / 2 - offsetY);
    ctx.moveTo(x - w / 2, y + h / 2);
    ctx.lineTo(x - w / 2 + offsetX, y + h / 2 - offsetY);
    ctx.moveTo(x + w / 2, y + h / 2);
    ctx.lineTo(x + w / 2 + offsetX, y + h / 2 - offsetY);
    ctx.stroke();

    // Ön yüz
    const gradient = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = '#1e40af';
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + h / 2 + 30;
      if (calc.hacim) ctx.fillText(`Hacim = ${calc.hacim}`, x - 40, yOffset);
      if (calc.alan) ctx.fillText(`Yüzey Alanı = ${calc.alan}`, x - 60, yOffset + 20);
    }

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 40, y - h / 2 - 20);
    }
  };

  const drawCircle2D = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, label?: string, calc?: any) => {
    // Daire
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, '#93c5fd');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Yarıçap
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + r, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(`r = ${r}`, x + r / 2 - 15, y - 10);

    // Merkez noktası
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + r + 30;
      if (calc.alan) ctx.fillText(`Alan = ${calc.alan.toFixed(2)}`, x - 40, yOffset);
      if (calc.cevre) ctx.fillText(`Çevre = ${calc.cevre.toFixed(2)}`, x - 40, yOffset + 20);
    }

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 20, y - r - 20);
    }
  };

  const drawRectangle2D = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label?: string, calc?: any) => {
    // Dikdörtgen
    const gradient = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    gradient.addColorStop(0, '#93c5fd');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);

    // Ölçüler
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Genişlik
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h / 2 + 15);
    ctx.lineTo(x + w / 2, y + h / 2 + 15);
    ctx.stroke();

    // Yükseklik
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 15, y - h / 2);
    ctx.lineTo(x - w / 2 - 15, y + h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(`${w}`, x - 10, y + h / 2 + 30);
    ctx.fillText(`${h}`, x - w / 2 - 35, y);

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + h / 2 + 50;
      if (calc.alan) ctx.fillText(`Alan = ${calc.alan}`, x - 40, yOffset);
      if (calc.cevre) ctx.fillText(`Çevre = ${calc.cevre}`, x - 40, yOffset + 20);
    }

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 40, y - h / 2 - 20);
    }
  };

  const drawSquare2D = (ctx: CanvasRenderingContext2D, x: number, y: number, side: number, label?: string, calc?: any) => {
    drawRectangle2D(ctx, x, y, side, side, label, calc);
  };

  const drawTriangle2D = (ctx: CanvasRenderingContext2D, x: number, y: number, base: number, height: number, label?: string, calc?: any) => {
    // Üçgen
    const gradient = ctx.createLinearGradient(x - base / 2, y + height / 2, x + base / 2, y - height / 2);
    gradient.addColorStop(0, '#93c5fd');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x - base / 2, y + height / 2);
    ctx.lineTo(x + base / 2, y + height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Yükseklik çizgisi
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x, y + height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(`h = ${height}`, x + 10, y);
    ctx.fillText(`taban = ${base}`, x - 30, y + height / 2 + 25);

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + height / 2 + 45;
      if (calc.alan) ctx.fillText(`Alan = ${calc.alan.toFixed(2)}`, x - 40, yOffset);
    }

    if (label) {
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px Inter';
      ctx.fillText(label, x - 30, y - height / 2 - 20);
    }
  };

  const drawMeasurements = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, h: number, type: string, calc?: any) => {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (type === 'koni' || type === 'silindir') {
      // Yükseklik çizgisi
      ctx.beginPath();
      ctx.moveTo(x + r + 15, y - h / 2);
      ctx.lineTo(x + r + 15, y + h / 2);
      ctx.stroke();

      // Yarıçap
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + r, y + h / 2);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 14px Inter';
      ctx.fillText(`h = ${h}`, x + r + 20, y);
      ctx.fillText(`r = ${r}`, x + r / 2 - 10, y + h / 2 + 20);
    }

    if (calc) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter';
      const yOffset = y + h / 2 + 40;
      if (calc.hacim) ctx.fillText(`Hacim = ${calc.hacim.toFixed(2)}`, x - 60, yOffset);
      if (calc.yanal_alan) ctx.fillText(`Yanal Alan = ${calc.yanal_alan.toFixed(2)}`, x - 60, yOffset + 20);
      if (calc.taban_alan) ctx.fillText(`Taban Alanı = ${calc.taban_alan.toFixed(2)}`, x - 60, yOffset + 40);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Matematiksel Görselleştirme</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearCanvas}
          >
            Temizle
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block"
          />
        </div>
        
        {/* Görselleştirme Kontrolleri */}
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Tür:</strong> {type === 'graph' ? 'Koordinat Sistemi' :
                              type === 'geometry' ? 'Geometrik Şekiller' :
                              type === 'chart' ? 'Grafik' :
                              type === '3d-shape' ? '3D Şekil / 2D Çizim' : 'Fonksiyon Grafiği'}
          </div>

          {data && data.calculation && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-900 mb-2">Hesaplama Sonuçları:</div>
              <div className="text-sm text-blue-800 space-y-1">
                {data.calculation.alan && <div>• Alan: {data.calculation.alan.toFixed(2)}</div>}
                {data.calculation.cevre && <div>• Çevre: {data.calculation.cevre.toFixed(2)}</div>}
                {data.calculation.hacim && <div>• Hacim: {data.calculation.hacim.toFixed(2)}</div>}
                {data.calculation.yanal_alan && <div>• Yanal Alan: {data.calculation.yanal_alan.toFixed(2)}</div>}
                {data.calculation.taban_alan && <div>• Taban Alanı: {data.calculation.taban_alan.toFixed(2)}</div>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
