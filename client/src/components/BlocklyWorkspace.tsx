import React, { useEffect, useRef, useState } from "react";
import * as Blockly from 'blockly/core';
import * as libraryBlocks from 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as Tr from 'blockly/msg/tr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Türkçe dil desteğini ayarla
Blockly.setLocale(Tr as any);

// Özel blok tanımları
const customBlocks = {
  'hello_world': {
    init: function(this: Blockly.Block) {
      this.appendDummyInput()
          .appendField("Merhaba Dünya yaz");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Konsola 'Merhaba Dünya' yazdırır");
    }
  },
  'alert_message': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("MESSAGE")
          .setCheck("String")
          .appendField("Uyarı göster:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Ekranda uyarı mesajı gösterir");
    }
  },
  'repeat_times': {
    init: function(this: Blockly.Block) {
      this.appendValueInput("TIMES")
          .setCheck("Number")
          .appendField("Tekrarla");
      this.appendStatementInput("DO")
          .setCheck(null)
          .appendField("yap:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Belirtilen sayıda işlemi tekrarlar");
    }
  }
};

// Özel blokları kaydet
Object.keys(customBlocks).forEach(blockName => {
  Blockly.Blocks[blockName] = customBlocks[blockName as keyof typeof customBlocks];
});

// Kod üretici tanımları
javascriptGenerator.forBlock['hello_world'] = function() {
  return 'console.log("Merhaba Dünya!");\n';
};

javascriptGenerator.forBlock['alert_message'] = function(block, generator) {
  const message = generator.valueToCode(block, 'MESSAGE', 0) || '""';
  return `alert(${message});\n`;
};

javascriptGenerator.forBlock['repeat_times'] = function(block, generator) {
  const times = generator.valueToCode(block, 'TIMES', 0) || '0';
  const branch = generator.statementToCode(block, 'DO');
  return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
};

// Toolbox yapılandırması
const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Mantık',
      colour: '210',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
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
        { kind: 'block', type: 'repeat_times' }
      ]
    },
    {
      kind: 'category',
      name: 'Matematik',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' }
      ]
    },
    {
      kind: 'category',
      name: 'Metin',
      colour: '160',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_print' },
        { kind: 'block', type: 'text_join' }
      ]
    },
    {
      kind: 'category',
      name: 'Değişkenler',
      colour: '330',
      custom: 'VARIABLE'
    },
    {
      kind: 'category',
      name: 'Özel Bloklar',
      colour: '290',
      contents: [
        { kind: 'block', type: 'hello_world' },
        { kind: 'block', type: 'alert_message' }
      ]
    }
  ]
};

export default function BlocklyWorkspace() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (blocklyDiv.current && !workspaceRef.current) {
      // Workspace oluştur
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        trashcan: true
      });

      // Başlangıç blokları ekle
      const xml = Blockly.utils.xml.textToDom(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="hello_world" x="50" y="50"></block>
        </xml>
      `);
      Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  const generateCode = () => {
    if (workspaceRef.current) {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      setGeneratedCode(code);
    }
  };

  const runCode = () => {
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
      const originalAlert = window.alert;
      const logs: string[] = [];

      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      // Alert'leri yakalama
      window.alert = (message?: unknown) => {
        logs.push(`🔔 Uyarı: ${String(message)}`);
        originalAlert(String(message));
      };

      try {
        // Function constructor ile güvenli kod çalıştırma (eval yerine)
        const safeFunction = new Function(
          'console',
          'alert',
          'Math',
          code
        );

        safeFunction(
          { log: (...args: unknown[]) => logs.push(args.join(' ')) },
          (msg: string) => logs.push(`🔔 Uyarı: ${msg}`),
          Math
        );

        setOutput(logs.length > 0 ? logs : ['✅ Kod başarıyla çalıştırıldı! (Çıktı yok)']);
      } catch (error) {
        setOutput([`❌ Hata: ${error instanceof Error ? error.message : String(error)}`]);
      } finally {
        console.log = originalLog;
        window.alert = originalAlert;
      }
    }
  };

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      setGeneratedCode('');
      setOutput([]);
    }
  };

  const saveWorkspace = () => {
    if (workspaceRef.current) {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToText(xml);
      
      const blob = new Blob([xmlText], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blockly-workspace.xml';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const loadWorkspace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && workspaceRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const xmlText = e.target?.result as string;
        const xml = Blockly.utils.xml.textToDom(xmlText);
        workspaceRef.current?.clear();
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current!);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kontrol Butonları */}
      <Card>
        <CardHeader>
          <CardTitle>Kontroller</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={generateCode} variant="default">
            Kod Üret
          </Button>
          <Button onClick={runCode} variant="default" className="bg-green-600 hover:bg-green-700">
            Çalıştır
          </Button>
          <Button onClick={clearWorkspace} variant="destructive">
            Temizle
          </Button>
          <Button onClick={saveWorkspace} variant="outline">
            Kaydet
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>Yükle</span>
            </Button>
            <input
              type="file"
              accept=".xml"
              onChange={loadWorkspace}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>

      {/* Blockly Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Blok Editörü</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={blocklyDiv} 
            style={{ height: '500px', width: '100%' }}
            className="border border-border rounded-md"
          />
        </CardContent>
      </Card>

      {/* Üretilen Kod */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle>Üretilen JavaScript Kodu</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              <code>{generatedCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Çıktı */}
      {output.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Çıktı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md space-y-1">
              {output.map((line, index) => (
                <div key={index} className="font-mono text-sm">
                  {line}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

