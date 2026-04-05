import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, Send, X, TerminalSquare } from 'lucide-react';
import { useLyv } from '@/contexts/LyvContext';

export function ZiosWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { currentUser } = useLyv();
  const [history, setHistory] = useState([
    { role: 'zios', text: `Olá, ${currentUser?.name?.split(' ')[0] || 'Humano'}. Eu sou o ZIOS, a Mente Mestra do Lyvifi. Como posso otimizar sua experiência hoje?` }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setHistory([...history, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    
    // Simulação do Motor ZIOS (No futuro, baterá na API /api/zios/ask)
    setTimeout(() => {
      let resposta = "Estou processando seu pedido. Meus núcleos lógicos estão mapeando o Multiverso IO.";
      if (currentInput.toLowerCase().includes('quem é você')) resposta = "Sou o ZIOS (Zona de Inteligência Operacional Suprema). Eu gerencio a harmonia entre o TAS, Íris, Heimdall e Gaia.";
      if (currentInput.toLowerCase().includes('ajuda')) resposta = "Você pode me pedir para escrever um post para você, resumir as notícias do Mercúrio, ou alterar configurações do sistema.";
      
      setHistory(prev => [...prev, { role: 'zios', text: resposta }]);
    }, 1000);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[60] p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_8px_32px_rgba(79,70,229,0.4)] hover:scale-105 transition-transform"
      >
        <BrainCircuit className="w-6 h-6" />
      </button>

      {/* Janela de Chat do ZIOS */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-8 z-[70] w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-slate-900 border border-slate-700 shadow-2xl rounded-[2rem] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg"><TerminalSquare className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <h3 className="font-bold text-white text-sm">ZIOS Core</h3>
                  <p className="text-[10px] text-blue-400 uppercase tracking-widest">Sistema Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'zios' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mr-2 mt-1" />}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-800 rounded-full p-1 pl-4 border border-slate-700 focus-within:border-blue-500 transition-colors">
                <input 
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Comandar ZIOS..." 
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-slate-500"
                />
                <button type="submit" disabled={!input.trim()} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}