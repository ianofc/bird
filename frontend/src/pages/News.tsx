import { BirdLayout } from "@/components/bird/BirdLayout";
import { PostCard } from "@/components/bird/PostCard";
import { Newspaper, TrendingUp } from "lucide-react";

export default function News() {
  // Mock de notícias/trends (Texto + Imagem de contexto)
  const news = [
    {
      id: "n1",
      userName: "TechCrunch",
      userHandle: "@techcrunch",
      userInitials: "TC",
      userColor: "bg-green-600",
      content: "A nova IA generativa está mudando a forma como codificamos. Veja os destaques do lançamento de hoje. #Tech #AI",
      likes: 1200,
      comments: 45,
      shares: 300,
      liked: false,
      createdAt: new Date(),
      verified: true
    },
    {
      id: "n2",
      userName: "GloboEsporte",
      userHandle: "@ge",
      userInitials: "GE",
      userColor: "bg-blue-600",
      content: "Vasco anuncia nova contratação bombástica para a temporada! A torcida já está comemorando em São Januário. ⚽ #Futebol #Vasco",
      imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=60",
      likes: 5400,
      comments: 890,
      shares: 120,
      liked: true,
      createdAt: new Date(),
      verified: true
    },
    {
      id: "n3",
      userName: "CNN Política",
      userHandle: "@cnnpolitica",
      userInitials: "CN",
      userColor: "bg-red-600",
      content: "Debate no congresso hoje define o futuro da regulação das redes sociais. Entenda os pontos principais da PL. 🏛️",
      likes: 890,
      comments: 2300,
      shares: 500,
      liked: false,
      createdAt: new Date(),
      verified: true
    }
  ];

  return (
    <BirdLayout>
      <div className="max-w-[600px] mx-auto pt-4">
        
        {/* Header da Página News */}
        <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Newspaper className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">News & Tendências</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" /> O que está acontecendo agora
                </p>
            </div>
        </div>

        <div className="space-y-4">
          {news.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </BirdLayout>
  );
}