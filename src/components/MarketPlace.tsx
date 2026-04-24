import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  ShoppingBag,
  Search,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Place } from '@/lib/api/types';

interface MarketPlaceProps {
  onBack: () => void;
  places: Place[];
  onReact: (placeId: string, reactionType: 'LIKE' | 'DISLIKE' | 'NONE') => Promise<void>;
  onOpenComments: (place: Place) => void;
}

const MarketPlace: React.FC<MarketPlaceProps> = ({ onBack, places, onReact, onOpenComments }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'Все', emoji: '🏪' },
    { id: 'crafts', label: 'Ремёсла', emoji: '🎨' },
    { id: 'food', label: 'Продукты', emoji: '🍯' },
    { id: 'market', label: 'Маркет', emoji: '🛍️' },
    { id: 'culture', label: 'Культура', emoji: '🏛️' },
  ];

  const filteredPlaces = useMemo(
    () => (selectedCategory === 'all' ? places : places.filter((place) => place.category === selectedCategory)),
    [places, selectedCategory],
  );

  const masters = useMemo(() => {
    const map = new Map<string, { name: string; avatarUrl: string | null; places: Place[]; city?: string | null }>();

    for (const place of filteredPlaces) {
      const existing = map.get(place.author.id);
      if (existing) {
        existing.places.push(place);
      } else {
        map.set(place.author.id, {
          name: place.author.name,
          avatarUrl: place.author.avatarUrl,
          city: place.location.city,
          places: [place],
        });
      }
    }

    return Array.from(map.entries()).map(([id, value]) => ({ id, ...value }));
  }, [filteredPlaces]);

  const toggleFavorite = (masterId: string) => {
    setFavorites((prev) => (prev.includes(masterId) ? prev.filter((id) => id !== masterId) : [...prev, masterId]));
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">Маркет мастеров</h1>
          <p className="text-xs text-white/70">Локальные товары и публикации</p>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              className={`flex-shrink-0 ${selectedCategory === category.id ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <Tabs defaultValue="masters" className="h-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="masters">Мастера</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
          </TabsList>

          <TabsContent value="masters" className="px-4 space-y-4">
            {masters.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">Публикаций в маркете пока нет</CardContent>
              </Card>
            ) : null}

            {masters.map((master) => (
              <Card key={master.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      {master.avatarUrl ? (
                        <ImageWithFallback src={master.avatarUrl} alt={master.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback>{master.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{master.name}</h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          ✓ Проверен
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Местный автор и гид</p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>4.8</span>
                          <span>({master.places.length})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{master.city ?? 'Татарстан'}</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => toggleFavorite(master.id)}>
                      <Heart
                        className={`w-4 h-4 ${favorites.includes(master.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                      />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Автор добавил {master.places.length} мест(а). Вы можете поддержать лайком и написать комментарий.
                  </p>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">Публикации ({master.places.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {master.places.slice(0, 2).map((place) => (
                        <div key={place.id} className="space-y-2">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <ImageWithFallback
                              src={place.thumbnailUrl ?? 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=600'}
                              alt={place.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{place.title}</p>
                            <p className="text-xs text-muted-foreground">{place.location.city ?? 'Татарстан'}</p>
                            <div className="flex gap-2 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => onReact(place.id, place.viewerReaction === 'LIKE' ? 'NONE' : 'LIKE')}
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />{place.counts.reactions}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => onReact(place.id, place.viewerReaction === 'DISLIKE' ? 'NONE' : 'DISLIKE')}
                              >
                                <ThumbsDown className="w-3 h-3 mr-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-4 h-4 mr-1" />Позвонить
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-white" onClick={() => onOpenComments(master.places[0])}>
                      <MessageSquare className="w-4 h-4 mr-1" />Написать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="products" className="px-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPlaces.map((place) => (
                <Card key={place.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <ImageWithFallback
                      src={place.thumbnailUrl ?? 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=600'}
                      alt={place.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{place.title}</h4>
                    <p className="text-primary font-semibold text-sm mb-2">{place.location.city ?? 'Татарстан'}</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback className="text-xs">{place.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{place.author.name}</span>
                    </div>
                    <Button size="sm" className="w-full mt-2 bg-primary text-white">
                      <ShoppingBag className="w-4 h-4 mr-1" />В корзину
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketPlace;
