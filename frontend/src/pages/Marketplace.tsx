import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LyvLayout } from "@/components/lyv/LyvLayout";
import { 
  Store, Search, Plus, MapPin, Tag, Filter, Loader2, ShoppingBag 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from '@/services/api';
import { toast } from 'sonner';

interface Product {
  id: number;
  title: string;
  price: number;
  location: string;
  image: string;
  category: string;
  seller: { name: string; avatar: string | null };
}

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'Todos', 'Veículos', 'Imóveis', 'Eletrônicos', 'Móveis', 
    'Vestuário', 'Esportes', 'Ferramentas', 'Serviços'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = `/marketplace/?category=${activeCategory === 'Todos' ? '' : activeCategory}&q=${searchQuery}`;
        const response = await api.get(url);
        
        if (response.data.length > 0) {
          setProducts(response.data);
        } else {
          // Fallback Visual de Alta Qualidade (Caso o banco esteja vazio)
          setProducts([
            { id: 1, title: 'MacBook Pro M3 Max 32GB', price: 18500.00, location: 'São Paulo, SP', category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', seller: { name: 'Ian Santos', avatar: null } },
            { id: 2, title: 'Câmera Sony A7III + Lente 50mm', price: 9200.00, location: 'Curitiba, PR', category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop', seller: { name: 'Lívia', avatar: null } },
            { id: 3, title: 'Bicicleta Caloi Aro 29 Alumínio', price: 1200.00, location: 'Seabra, BA', category: 'Esportes', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop', seller: { name: 'Marcos Lyv', avatar: null } },
            { id: 4, title: 'Sofá Retrátil 3 Lugares Suede', price: 850.00, location: 'Salvador, BA', category: 'Móveis', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', seller: { name: 'Loja Home', avatar: null } },
            { id: 5, title: 'Honda Civic Touring 2024', price: 185000.00, location: 'Belo Horizonte, PR', category: 'Veículos', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=600&fit=crop', seller: { name: 'Concessionária XYZ', avatar: null } },
            { id: 6, title: 'Monitor Dell Ultrawide 34"', price: 2800.00, location: 'Palmeiras, BA', category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop', seller: { name: 'Tech Store', avatar: null } },
          ]);
        }
      } catch (error) {
        toast.error("Erro ao carregar a loja.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => { fetchProducts(); }, 400); // Debounce na busca
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  return (
    <LyvLayout>
      <div className="w-full max-w-[1300px] mx-auto min-h-screen pt-4 md:pt-8 pb-24 px-4 md:px-8 bg-transparent">
        
        {/* HEADER DA LOJA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pb-2 drop-shadow-sm flex items-center gap-3">
              <Store className="w-10 h-10 text-blue-600" /> Marketplace
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Compre e venda no Multiverso Lyv.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute w-4 h-4 text-slate-400 transform -translate-y-1/2 left-4 top-1/2" />
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white transition-all border rounded-2xl bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none rounded-2xl h-11 px-4 font-bold border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                <Filter className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Filtros</span>
              </Button>
              <Button className="flex-1 sm:flex-none rounded-2xl h-11 px-5 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md border-0">
                <Plus className="w-4 h-4 mr-2" /> Vender
              </Button>
            </div>
          </div>
        </div>

        {/* CARROSSEL DE CATEGORIAS */}
        <div className="flex gap-2 p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap z-10 ${
                activeCategory === cat ? 'text-blue-800 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeCategory === cat && (
                <motion.div layoutId="marketplaceTab" className="absolute inset-0 bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-sm border border-white/50 dark:border-white/5 -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white/40 dark:bg-[#1E293B]/40 rounded-[2rem] border border-white/50 dark:border-white/10">
              <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nenhum produto encontrado.</h3>
              <p className="text-slate-500 mt-2">Tente ajustar seus filtros ou seja o primeiro a vender nesta categoria!</p>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 transition-all group cursor-pointer flex flex-col"
                >
                  {/* Imagem do Produto */}
                  <div className="w-full aspect-square overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    
                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 text-white text-[10px] font-bold uppercase">
                      <Tag className="w-3 h-3" /> {product.category}
                    </div>
                  </div>
                  
                  {/* Informações */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.title}
                    </h3>
                    
                    {/* Preço (Destaque) */}
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-auto pt-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <MapPin className="w-3.5 h-3.5" /> <span className="truncate">{product.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LyvLayout>
  );
}