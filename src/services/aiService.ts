import { GAMES } from "../constants";

export const aiSearch = async (query: string) => {
  if (query.length < 3) return null;

  try {
    const gamesContext = GAMES.map(g => ({ 
      id: g.id, 
      name: g.name, 
      description: g.description, 
      packages: g.packages.map(p => ({ id: p.id, name: p.name, price: p.price })) 
    }));

    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, games: gamesContext })
    });

    if (!response.ok) {
      throw new Error('Falha na busca assistida por IA');
    }

    return await response.json();
  } catch (error) {
    console.error("AI Search Error:", error);
    return null;
  }
};
