/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Apple, 
  Cherry, 
  Leaf, 
  ShoppingBasket, 
  Sparkles,
  Volume2
} from 'lucide-react';

// --- Types ---

type FruitType = 'apple' | 'cherry' | 'grape' | 'peach';

interface FruitInstance {
  id: string;
  type: FruitType;
  x: number;
  y: number;
  growth: number; // 0 to 1
  isRipe: boolean;
  scale: number;
}

interface Inventory {
  apple: number;
  cherry: number;
  grape: number;
  peach: number;
}

// --- Constants ---

const FRUIT_CONFIG: Record<FruitType, { color: string; icon: any; name: string; value: number }> = {
  apple: { color: 'bg-natural-fruit', icon: Apple, name: '苹果', value: 5 },
  cherry: { color: 'bg-natural-secondary', icon: Cherry, name: '樱桃', value: 3 },
  grape: { color: 'bg-natural-primary', icon: Leaf, name: '葡萄', value: 8 },
  peach: { color: 'bg-natural-accent', icon: Sparkles, name: '水蜜桃', value: 12 },
};

const MAX_FRUITS = 12;
const GROWTH_RATE = 0.05; // Growth per tick

// --- Components ---

export default function App() {
  const [fruits, setFruits] = useState<FruitInstance[]>([]);
  const [inventory, setInventory] = useState<Inventory>({ apple: 0, cherry: 0, grape: 0, peach: 0 });
  const [juiceDrops, setJuiceDrops] = useState(0);
  const [showJuiceStation, setShowJuiceStation] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Initialize garden
  useEffect(() => {
    const initialFruits: FruitInstance[] = [];
    for (let i = 0; i < 6; i++) {
      initialFruits.push(generateFruit());
    }
    setFruits(initialFruits);
  }, []);

  // Growth loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFruits(prev => {
        const updated = prev.map(f => {
          if (f.growth < 1) {
            const nextGrowth = f.growth + GROWTH_RATE * (0.5 + Math.random());
            return { 
              ...f, 
              growth: Math.min(1, nextGrowth),
              isRipe: nextGrowth >= 1
            };
          }
          return f;
        });

        if (updated.length < MAX_FRUITS && Math.random() > 0.95) {
          updated.push(generateFruit());
        }

        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function generateFruit(): FruitInstance {
    const types: FruitType[] = ['apple', 'cherry', 'grape', 'peach'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 10 + Math.random() * 80, // %
      y: 20 + Math.random() * 60, // %
      growth: 0,
      isRipe: false,
      scale: 0.8 + Math.random() * 0.4,
    };
  }

  const pickFruit = (id: string, x: number, y: number) => {
    const fruit = fruits.find(f => f.id === id);
    if (!fruit || !fruit.isRipe) return;

    setInventory(prev => ({
      ...prev,
      [fruit.type]: prev[fruit.type] + 1
    }));

    setFruits(prev => prev.filter(f => f.id !== id));
    
    const textId = Date.now();
    setFloatingTexts(prev => [...prev, { id: textId, text: `+1 ${FRUIT_CONFIG[fruit.type].name}`, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== textId));
    }, 1000);
  };

  const craftJuice = (type: FruitType) => {
    if (inventory[type] >= 3) {
      setInventory(prev => ({ ...prev, [type]: prev[type] - 3 }));
      const value = FRUIT_CONFIG[type].value * 4;
      
      setTimeout(() => {
        setJuiceDrops(prev => prev + value);
        const textId = Date.now();
        setFloatingTexts(prev => [...prev, { id: textId, text: `+${value} 滴露`, x: 50, y: 50 }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== textId)), 1500);
      }, 500);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-natural-bg overflow-hidden select-none cursor-default flex flex-col">
      {/* Header Area */}
      <header className="px-[60px] py-[40px] flex justify-between items-center z-50">
        <div className="font-serif text-[32px] font-normal italic tracking-[2px] text-natural-primary">
          林间小憩
        </div>
        <div className="flex gap-[40px]">
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-1">今日收获</div>
            <div className="font-serif text-[24px] text-natural-secondary">{Object.values(inventory).reduce((a: number, b: number) => a + b, 0)}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-1">治愈值</div>
            <div className="font-serif text-[24px] text-natural-secondary">{Math.min(100, juiceDrops)}%</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.1em] opacity-60 mb-1">滴露</div>
            <div className="font-serif text-[24px] text-natural-secondary">{juiceDrops}</div>
          </div>
        </div>
      </header>

      {/* Main Scene */}
      <main className="flex-1 relative px-[60px] flex gap-[40px] overflow-hidden">
        {/* Garden View */}
        <div className="flex-[1.5] bg-natural-grass rounded-[40px] relative shadow-inner overflow-hidden">
          <div className="absolute top-[30px] right-[30px] bg-white/20 px-4 py-2 rounded-full text-white text-[12px] uppercase tracking-[1px] z-10">
            ● 仲夏
          </div>
          
          <AnimatePresence>
            {fruits.map((fruit) => (
              <FruitItem 
                key={fruit.id} 
                fruit={fruit} 
                onPick={(x, y) => pickFruit(fruit.id, x, y)} 
              />
            ))}
          </AnimatePresence>

          {/* Floating Feedback */}
          <AnimatePresence>
            {floatingTexts.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: t.y, x: t.x }}
                animate={{ opacity: 1, y: t.y - 100 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none font-serif text-2xl text-natural-primary z-50"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Task Panel (Sidebar) */}
        <div className="flex-1 bg-white rounded-[32px] p-[32px] flex flex-col gap-[20px] panel-shadow">
          <h2 className="font-serif text-[20px] mb-[10px]">今日手账</h2>
          <ul className="list-none">
            <li className="flex items-center gap-[15px] py-[16px] border-b border-[#EEE]">
              <div className={`w-[20px] h-[20px] border-2 border-natural-grass rounded-[6px] ${inventory.apple >= 3 ? 'bg-natural-grass' : ''}`}></div>
              <div className="text-[14px] text-[#666]">采摘 3 颗熟透的红苹果</div>
            </li>
            <li className="flex items-center gap-[15px] py-[16px] border-b border-[#EEE]">
              <div className={`w-[20px] h-[20px] border-2 border-natural-grass rounded-[6px] ${juiceDrops > 0 ? 'bg-natural-grass' : ''}`}></div>
              <div className="text-[14px] text-[#666]">在工坊酿造第一瓶滴露</div>
            </li>
            <li className="flex items-center gap-[15px] py-[16px] border-b border-[#EEE]">
              <div className="w-[20px] h-[20px] border-2 border-natural-grass rounded-[6px]"></div>
              <div className="text-[14px] text-[#666]">为新苗浇灌清晨的山泉水</div>
            </li>
            <li className="flex items-center gap-[15px] py-[16px] border-b border-[#EEE]">
              <div className="w-[20px] h-[20px] border-2 border-natural-grass rounded-[6px]"></div>
              <div className="text-[14px] text-[#666]">收集 3 片完美的枫叶</div>
            </li>
          </ul>
          <div className="mt-auto pt-[20px] border-t border-[#EEE]">
            <p className="text-[12px] text-[#999] italic">“风吹过树梢的声音，是森林给你的回信。”</p>
          </div>
        </div>
      </main>

      {/* Bottom Bar (Footer) */}
      <footer className="px-[60px] py-[30px] pb-[40px] flex justify-center gap-[20px] items-center">
        <div className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center text-[24px] transition-all ${inventory.apple > 0 ? 'bg-[#FEFAE0] border-2 border-natural-accent' : 'bg-white border-2 border-dashed border-[#DDD]'}`}>
          {inventory.apple > 0 ? '🍎' : ''}
        </div>
        <div className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center text-[24px] transition-all ${inventory.cherry > 0 ? 'bg-[#FEFAE0] border-2 border-natural-accent' : 'bg-white border-2 border-dashed border-[#DDD]'}`}>
          {inventory.cherry > 0 ? '🍒' : ''}
        </div>
        <div className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center text-[24px] transition-all ${inventory.peach > 0 ? 'bg-[#FEFAE0] border-2 border-natural-accent' : 'bg-white border-2 border-dashed border-[#DDD]'}`}>
          {inventory.peach > 0 ? '🍑' : ''}
        </div>
        <div className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center text-[24px] transition-all ${inventory.grape > 0 ? 'bg-[#FEFAE0] border-2 border-natural-accent' : 'bg-white border-2 border-dashed border-[#DDD]'}`}>
          {inventory.grape > 0 ? '🍇' : ''}
        </div>
        
        <button 
          onClick={() => setShowJuiceStation(!showJuiceStation)}
          className="bg-natural-primary text-white px-[40px] h-[60px] rounded-full font-serif text-[16px] flex items-center gap-[10px] hover:opacity-90 transition-all active:scale-95"
        >
          <span>前往工坊</span>
          <span className="opacity-50">→</span>
        </button>
      </footer>

      {/* Juice Station Overlay */}
      <AnimatePresence>
        {showJuiceStation && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-32 mx-auto max-w-2xl px-6 z-[60]"
          >
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-[#EEE]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-3xl text-natural-primary">果汁工坊</h2>
                <div className="text-sm text-natural-grass">收集 3 个同类水果制作果汁</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(Object.keys(inventory) as FruitType[]).map(type => (
                  <div key={type} className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${FRUIT_CONFIG[type].color} flex items-center justify-center text-white shadow-inner relative`}>
                      {(() => {
                        const Icon = FRUIT_CONFIG[type].icon;
                        return <Icon className="w-8 h-8" />;
                      })()}
                      <div className="absolute -top-2 -right-2 bg-natural-primary text-white text-xs px-2 py-1 rounded-full">
                        {inventory[type]}
                      </div>
                    </div>
                    <button
                      disabled={inventory[type] < 3}
                      onClick={() => craftJuice(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        inventory[type] >= 3 
                          ? 'bg-natural-primary text-white hover:scale-105 active:scale-95' 
                          : 'bg-black/5 text-black/20 cursor-not-allowed'
                      }`}
                    >
                      制作
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-natural-primary/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white max-w-md w-full rounded-[2rem] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-natural-accent rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-4xl mb-4 text-natural-primary">林间小憩</h2>
              <p className="text-natural-primary/70 leading-relaxed mb-8">
                这是一个宁静的角落。在这里，你可以静静等待果实成熟，亲手采摘，并酿造出最纯净的果汁。
              </p>
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full py-4 bg-natural-primary text-white rounded-2xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                开始静谧之旅
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FruitItemProps {
  fruit: FruitInstance;
  onPick: (x: number, y: number) => void;
  key?: string;
}

function FruitItem({ fruit, onPick }: FruitItemProps) {
  const config = FRUIT_CONFIG[fruit.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: fruit.growth * fruit.scale, 
        opacity: 1,
        y: [0, -5, 0],
      }}
      transition={{ 
        scale: { type: 'spring', damping: 12 },
        y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
      }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute cursor-pointer group"
      style={{ left: `${fruit.x}%`, top: `${fruit.y}%` }}
      onClick={() => onPick(fruit.x, fruit.y)}
    >
      <div className="relative">
        {fruit.isRipe && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-full blur-xl ${config.color} opacity-40`}
          />
        )}
        
        <div className={`p-4 rounded-full ${config.color} text-white shadow-lg transform transition-transform group-hover:scale-110 active:scale-90`}>
          <Icon className="w-8 h-8" />
        </div>

        {!fruit.isRipe && (
          <svg className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="100"
              strokeDashoffset={100 - (fruit.growth * 100)}
              className="opacity-50"
            />
          </svg>
        )}
      </div>
    </motion.div>
  );
}
