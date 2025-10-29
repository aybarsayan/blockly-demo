import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MathProblem {
  id: string;
  level: 'ilkokul' | 'ortaokul' | 'lise';
  category: string;
  question: string;
  answer: number | string;
  explanation: string;
  hints: string[];
}

const mathProblems: MathProblem[] = [
  // İlkokul Problemleri
  {
    id: 'ilkokul-1',
    level: 'ilkokul',
    category: 'Toplama',
    question: 'Ayşe 15 elma topladı, Mehmet 23 elma topladı. Toplam kaç elma topladılar?',
    answer: 38,
    explanation: '15 + 23 = 38 elma',
    hints: ['İki sayıyı toplamanız gerekiyor', '15 + 23 işlemini yapın']
  },
  {
    id: 'ilkokul-2',
    level: 'ilkokul',
    category: 'Geometri',
    question: 'Kenarları 5 cm ve 8 cm olan dikdörtgenin alanı kaç cm² dir?',
    answer: 40,
    explanation: 'Dikdörtgenin alanı = uzunluk × genişlik = 5 × 8 = 40 cm²',
    hints: ['Dikdörtgenin alan formülü: uzunluk × genişlik', '5 × 8 = ?']
  },
  {
    id: 'ilkokul-3',
    level: 'ilkokul',
    category: 'Çarpma',
    question: 'Bir kutuda 6 kalem var. 4 kutuda toplam kaç kalem var?',
    answer: 24,
    explanation: '6 × 4 = 24 kalem',
    hints: ['Çarpma işlemi yapmanız gerekiyor', '6 × 4 = ?']
  },

  // Ortaokul Problemleri
  {
    id: 'ortaokul-1',
    level: 'ortaokul',
    category: 'Yüzde',
    question: '200 TL\'nin %15\'i kaç TL\'dir?',
    answer: 30,
    explanation: '200 × 15/100 = 200 × 0.15 = 30 TL',
    hints: ['Yüzde hesaplama: sayı × yüzde/100', '200 × 15/100 = ?']
  },
  {
    id: 'ortaokul-2',
    level: 'ortaokul',
    category: 'Denklem',
    question: '2x + 5 = 13 denklemini çözün. x = ?',
    answer: 4,
    explanation: '2x + 5 = 13 → 2x = 13 - 5 → 2x = 8 → x = 4',
    hints: ['Önce sabit terimi çıkarın', 'Sonra x\'in katsayısına bölün']
  },
  {
    id: 'ortaokul-3',
    level: 'ortaokul',
    category: 'Olasılık',
    question: 'Bir zar atıldığında 3 gelme olasılığı kaçtır?',
    answer: '1/6',
    explanation: 'Zarın 6 yüzü var, sadece 1 tanesi 3. Olasılık = 1/6',
    hints: ['Zarın kaç yüzü var?', 'Kaç tanesi 3?']
  },

  // Lise Problemleri
  {
    id: 'lise-1',
    level: 'lise',
    category: 'Trigonometri',
    question: '30° açısının sinüsü kaçtır?',
    answer: 0.5,
    explanation: 'sin(30°) = 1/2 = 0.5',
    hints: ['30-60-90 üçgenini hatırlayın', 'sin(30°) = 1/2']
  },
  {
    id: 'lise-2',
    level: 'lise',
    category: 'Logaritma',
    question: 'log₁₀(100) = ?',
    answer: 2,
    explanation: '10² = 100 olduğu için log₁₀(100) = 2',
    hints: ['10\'un kaçıncı kuvveti 100?', '10² = 100']
  },
  {
    id: 'lise-3',
    level: 'lise',
    category: 'Türev',
    question: 'f(x) = x² fonksiyonunun türevi nedir?',
    answer: '2x',
    explanation: 'f\'(x) = 2x (kuvvet kuralı: x^n → nx^(n-1))',
    hints: ['Kuvvet kuralını kullanın', 'x^n → nx^(n-1)']
  }
];

export default function InteractiveMathProblems() {
  const [selectedLevel, setSelectedLevel] = useState<'ilkokul' | 'ortaokul' | 'lise'>('ilkokul');
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const filteredProblems = mathProblems.filter(p => p.level === selectedLevel);

  const startProblem = (problem: MathProblem) => {
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowResult(false);
    setShowHint(false);
    setHintIndex(0);
  };

  const checkAnswer = () => {
    if (!currentProblem) return;

    setTotalAttempts(prev => prev + 1);
    setShowResult(true);

    const isCorrect = userAnswer.toString().trim() === currentProblem.answer.toString();
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const showNextHint = () => {
    if (currentProblem && hintIndex < currentProblem.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
  };

  const nextProblem = () => {
    const currentIndex = filteredProblems.findIndex(p => p.id === currentProblem?.id);
    const nextIndex = (currentIndex + 1) % filteredProblems.length;
    startProblem(filteredProblems[nextIndex]);
  };

  const resetScore = () => {
    setScore(0);
    setTotalAttempts(0);
  };

  return (
    <div className="space-y-6">
      {/* Seviye Seçimi ve Skor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Etkileşimli Matematik Problemleri</span>
            <div className="text-sm text-gray-600">
              Skor: {score}/{totalAttempts} ({totalAttempts > 0 ? Math.round((score/totalAttempts)*100) : 0}%)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              {(['ilkokul', 'ortaokul', 'lise'] as const).map(level => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level === 'ilkokul' ? 'İlkokul' : level === 'ortaokul' ? 'Ortaokul' : 'Lise'}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={resetScore}>
              Skoru Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problem Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedLevel === 'ilkokul' ? 'İlkokul' : selectedLevel === 'ortaokul' ? 'Ortaokul' : 'Lise'} Problemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredProblems.map(problem => (
              <div key={problem.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{problem.category}</div>
                  <div className="text-sm text-gray-600">{problem.question}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startProblem(problem)}
                >
                  Başla
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aktif Problem */}
      {currentProblem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentProblem.category} Problemi</span>
              <Button variant="outline" size="sm" onClick={nextProblem}>
                Sonraki Problem
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg font-medium">
              {currentProblem.question}
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Cevabınız:</Label>
              <Input
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Cevabınızı girin..."
                disabled={showResult}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={checkAnswer}
                disabled={!userAnswer.trim() || showResult}
              >
                Kontrol Et
              </Button>
              
              {!showHint && currentProblem.hints.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setShowHint(true)}
                >
                  İpucu Göster
                </Button>
              )}
            </div>

            {/* İpucuları */}
            {showHint && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-medium text-blue-800 mb-2">İpucu:</div>
                <div className="text-blue-700">{currentProblem.hints[hintIndex]}</div>
                {hintIndex < currentProblem.hints.length - 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={showNextHint}
                  >
                    Sonraki İpucu
                  </Button>
                )}
              </div>
            )}

            {/* Sonuç */}
            {showResult && (
              <div className={`p-4 rounded-lg ${
                userAnswer.toString().trim() === currentProblem.answer.toString() 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium mb-2 ${
                  userAnswer.toString().trim() === currentProblem.answer.toString() 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {userAnswer.toString().trim() === currentProblem.answer.toString() 
                    ? '✅ Doğru!' 
                    : '❌ Yanlış!'}
                </div>
                <div className={`text-sm ${
                  userAnswer.toString().trim() === currentProblem.answer.toString() 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  <div><strong>Doğru cevap:</strong> {currentProblem.answer}</div>
                  <div className="mt-1"><strong>Açıklama:</strong> {currentProblem.explanation}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
      {totalAttempts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>İstatistikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalAttempts}</div>
                <div className="text-sm text-gray-600">Toplam Deneme</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Doğru Cevap</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{totalAttempts - score}</div>
                <div className="text-sm text-gray-600">Yanlış Cevap</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((score/totalAttempts)*100)}%
                </div>
                <div className="text-sm text-gray-600">Başarı Oranı</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
