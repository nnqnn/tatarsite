import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  Filter
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MarketPlaceProps {
  onBack: () => void;
}

interface Master {
  id: string;
  name: string;
  specialty: string;
  description: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  location: string;
  phone: string;
  products: Product[];
  isVerified: boolean;
  category: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  inStock: boolean;
}

const MarketPlace: React.FC<MarketPlaceProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const masters: Master[] = [
    {
      id: '1',
      name: 'Гульнара Хасанова',
      specialty: 'Мастер по тюбетейкам',
      description: 'Создаю авторские тюбетейки с татарскими орнаментами уже 15 лет',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200',
      rating: 4.9,
      reviewsCount: 127,
      location: 'Казань, Старо-Татарская слобода',
      phone: '+7 (843) 123-45-67',
      isVerified: true,
      category: 'crafts',
      products: [
        {
          id: '1-1',
          name: 'Тюбетейка классическая',
          price: '2500 ₽',
          image: 'https://images.unsplash.com/photo-1566479179817-c7e8b7d9b30f?w=400',
          description: 'Ручная вышивка золотыми нитями',
          inStock: true
        },
        {
          id: '1-2',
          name: 'Тюбетейка праздничная',
          price: '4200 ₽',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          description: 'Эксклюзивная модель с жемчугом',
          inStock: false
        }
      ]
    },
    {
      id: '2',
      name: 'Фарид Галиев',
      specialty: 'Пчеловод',
      description: 'Производим натуральный башкирский мёд в экологически чистом районе',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      rating: 4.8,
      reviewsCount: 89,
      location: 'Пестречинский район',
      phone: '+7 (843) 234-56-78',
      isVerified: true,
      category: 'food',
      products: [
        {
          id: '2-1',
          name: 'Мёд липовый',
          price: '800 ₽/кг',
          image: 'https://images.unsplash.com/photo-1587049352847-e5ac1db1cb9b?w=400',
          description: 'Собран в липовых лесах Татарстана',
          inStock: true
        },
        {
          id: '2-2',
          name: 'Мёд с прополисом',
          price: '1200 ₽/кг',
          image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
          description: 'Обладает лечебными свойствами',
          inStock: true
        }
      ]
    },
    {
      id: '3',
      name: 'Лейла Закирова',
      specialty: 'Художник-керамист',
      description: 'Создаю керамическую посуду с булгарскими мотивами',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      rating: 4.7,
      reviewsCount: 156,
      location: 'Болгар',
      phone: '+7 (843) 345-67-89',
      isVerified: false,
      category: 'crafts',
      products: [
        {
          id: '3-1',
          name: 'Чайный сервиз "Булгар"',
          price: '6500 ₽',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          description: 'Ручная роспись, 6 предметов',
          inStock: true
        }
      ]
    },
    {
      id: '4',
      name: 'Ильдар Мухаметов',
      specialty: 'Резчик по дереву',
      description: 'Изготавливаю деревянные изделия в традиционном татарском стиле',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      rating: 4.6,
      reviewsCount: 73,
      location: 'Елабуга',
      phone: '+7 (843) 456-78-90',
      isVerified: true,
      category: 'crafts',
      products: [
        {
          id: '4-1',
          name: 'Шкатулка резная',
          price: '3200 ₽',
          image: 'https://images.unsplash.com/photo-1594736797933-d0701ba9b018?w=400',
          description: 'Орнамент "Тюльпан", липа',
          inStock: true
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Все', emoji: '🏪' },
    { id: 'crafts', label: 'Ремёсла', emoji: '🎨' },
    { id: 'food', label: 'Продукты', emoji: '🍯' },
    { id: 'textiles', label: 'Текстиль', emoji: '🧵' },
    { id: 'jewelry', label: 'Украшения', emoji: '💎' }
  ];

  const filteredMasters = selectedCategory === 'all' 
    ? masters 
    : masters.filter(master => master.category === selectedCategory);

  const toggleFavorite = (masterId: string) => {
    setFavorites(prev => 
      prev.includes(masterId) 
        ? prev.filter(id => id !== masterId)
        : [...prev, masterId]
    );
  };

  const contactMaster = (masterId: string, type: 'phone' | 'message') => {
    console.log(`Contact master ${masterId} via ${type}`);
    // В реальном приложении здесь был бы вызов или открытие чата
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/10"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">Маркет мастеров</h1>
          <p className="text-xs text-white/70">Аутентичные товары от местных</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {/* Фильтры */}
      <div className="p-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`flex-shrink-0 ${
                selectedCategory === category.id 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-foreground'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex-1">
        <Tabs defaultValue="masters" className="h-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="masters">Мастера</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
          </TabsList>

          <TabsContent value="masters" className="px-4 space-y-4">
            {filteredMasters.map(master => (
              <Card key={master.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <ImageWithFallback
                        src={master.avatar}
                        alt={master.name}
                        className="w-full h-full object-cover"
                      />
                      <AvatarFallback>{master.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{master.name}</h3>
                        {master.isVerified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            ✓ Проверен
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{master.specialty}</p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{master.rating}</span>
                          <span>({master.reviewsCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{master.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => toggleFavorite(master.id)}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.includes(master.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{master.description}</p>
                  
                  {/* Товары мастера */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Товары ({master.products.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {master.products.slice(0, 2).map(product => (
                        <div key={product.id} className="space-y-2">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-primary font-semibold">{product.price}</p>
                            {!product.inStock && (
                              <Badge variant="outline" className="text-xs">Нет в наличии</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => contactMaster(master.id, 'phone')}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Позвонить
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary text-white"
                      onClick={() => contactMaster(master.id, 'message')}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Написать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="products" className="px-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredMasters.flatMap(master => 
                master.products.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="secondary">Нет в наличии</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h4>
                      <p className="text-primary font-semibold text-sm mb-2">{product.price}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">
                            {masters.find(m => m.products.some(p => p.id === product.id))?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {masters.find(m => m.products.some(p => p.id === product.id))?.name}
                        </span>
                      </div>
                      <Button size="sm" className="w-full mt-2 bg-primary text-white">
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        В корзину
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketPlace;