import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Block {
  id: string;
  type: string;
  label: string;
  color: string;
  x: number;
  y: number;
  connections: {
    input?: string;
    output?: string;
  };
}

interface BlockType {
  type: string;
  label: string;
  color: string;
  hasInput: boolean;
  hasOutput: boolean;
}

const blockTypes: BlockType[] = [
  { type: 'start', label: 'Başla', color: '#10b981', hasInput: false, hasOutput: true },
  { type: 'action', label: 'İşlem Yap', color: '#3b82f6', hasInput: true, hasOutput: true },
  { type: 'condition', label: 'Koşul', color: '#f59e0b', hasInput: true, hasOutput: true },
  { type: 'loop', label: 'Döngü', color: '#8b5cf6', hasInput: true, hasOutput: true },
  { type: 'end', label: 'Bitir', color: '#ef4444', hasInput: true, hasOutput: false },
];

export default function CustomDragDrop() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // const rect = canvasRef.current.getBoundingClientRect();
      // setCanvasOffset({ x: rect.left, y: rect.top });
    }
  }, []);

  const createNewBlock = (type: string, label: string, color: string, x: number, y: number): Block => {
    return {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      label,
      color,
      x,
      y,
      connections: {}
    };
  };

  const handleToolboxDragStart = (e: React.DragEvent, blockType: BlockType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('blockType', JSON.stringify(blockType));
  };

  const handleBlockMouseDown = (e: React.MouseEvent, block: Block) => {
    e.preventDefault();
    setDraggedBlock(block);
    setSelectedBlock(block.id);
    setDragOffset({
      x: e.clientX - block.x,
      y: e.clientY - block.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedBlock && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x + rect.left;
      const newY = e.clientY - rect.top - dragOffset.y + rect.top;

      setBlocks(prev => prev.map(b => 
        b.id === draggedBlock.id 
          ? { ...b, x: newX, y: newY }
          : b
      ));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedBlock(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockTypeData = e.dataTransfer.getData('blockType');
    
    if (blockTypeData && canvasRef.current) {
      const blockType: BlockType = JSON.parse(blockTypeData);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newBlock = createNewBlock(blockType.type, blockType.label, blockType.color, x, y);
      setBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  };

  const clearCanvas = () => {
    setBlocks([]);
    setSelectedBlock(null);
  };

  const generateCode = () => {
    if (blocks.length === 0) {
      return '// Canvas boş';
    }

    let code = '// Oluşturulan Blok Akışı\n\n';
    
    blocks.forEach((block, index) => {
      code += `// Blok ${index + 1}: ${block.label}\n`;
      
      switch (block.type) {
        case 'start':
          code += 'function start() {\n  console.log("Program başladı");\n}\n\n';
          break;
        case 'action':
          code += 'function performAction() {\n  console.log("İşlem yapılıyor...");\n}\n\n';
          break;
        case 'condition':
          code += 'if (condition) {\n  console.log("Koşul sağlandı");\n} else {\n  console.log("Koşul sağlanmadı");\n}\n\n';
          break;
        case 'loop':
          code += 'for (let i = 0; i < 5; i++) {\n  console.log("Döngü iterasyonu:", i);\n}\n\n';
          break;
        case 'end':
          code += 'function end() {\n  console.log("Program bitti");\n}\n\n';
          break;
      }
    });

    return code;
  };

  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerateCode = () => {
    const code = generateCode();
    setGeneratedCode(code);
  };

  return (
    <div className="space-y-4">
      {/* Kontroller */}
      <Card>
        <CardHeader>
          <CardTitle>Kontroller</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={handleGenerateCode} variant="default">
            Kod Üret
          </Button>
          <Button onClick={clearCanvas} variant="destructive">
            Temizle
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Toolbox */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Blok Araç Kutusu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockTypes.map(blockType => (
                <div
                  key={blockType.type}
                  draggable
                  onDragStart={(e) => handleToolboxDragStart(e, blockType)}
                  className="p-3 rounded-lg cursor-move shadow-md hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: blockType.color, color: 'white' }}
                >
                  <div className="font-semibold">{blockType.label}</div>
                  <div className="text-xs opacity-90">
                    {blockType.hasInput && '⬆ Giriş'} {blockType.hasOutput && '⬇ Çıkış'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold mb-1">Nasıl Kullanılır:</p>
              <p className="text-xs">Blokları sağdaki canvas'a sürükleyip bırakın</p>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Çalışma Alanı (Canvas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={canvasRef}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
              style={{ height: '500px', cursor: draggedBlock ? 'grabbing' : 'default' }}
            >
              {blocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-lg font-semibold">Blokları buraya sürükleyin</p>
                    <p className="text-sm">Sol taraftaki araç kutusundan başlayın</p>
                  </div>
                </div>
              )}

              {blocks.map(block => (
                <div
                  key={block.id}
                  onMouseDown={(e) => handleBlockMouseDown(e, block)}
                  className={`absolute p-3 rounded-lg shadow-lg cursor-move select-none ${
                    selectedBlock === block.id ? 'ring-4 ring-blue-400' : ''
                  }`}
                  style={{
                    backgroundColor: block.color,
                    color: 'white',
                    left: `${block.x}px`,
                    top: `${block.y}px`,
                    minWidth: '120px'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{block.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="ml-2 text-white hover:text-red-200 font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-xs opacity-75 mt-1">ID: {block.id.slice(-8)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>İpuçları:</strong></p>
              <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                <li>Blokları canvas üzerinde hareket ettirmek için sürükleyin</li>
                <li>Bloğu silmek için üzerindeki × butonuna tıklayın</li>
                <li>Seçili blok mavi kenarlıkla gösterilir</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Üretilen Kod */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle>Üretilen Kod</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{generatedCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Blok İstatistikleri */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>İstatistikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{blocks.length}</div>
                <div className="text-sm text-gray-600">Toplam Blok</div>
              </div>
              {blockTypes.map(bt => {
                const count = blocks.filter(b => b.type === bt.type).length;
                return count > 0 ? (
                  <div key={bt.type} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: bt.color }}>{count}</div>
                    <div className="text-sm text-gray-600">{bt.label}</div>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

