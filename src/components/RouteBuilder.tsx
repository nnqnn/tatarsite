import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Navigation,
  RefreshCw,
  Play,
  Camera,
  Info
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RouteBuilderProps {
  userProfile: {
    interests: string[];
    language: string;
  };
  onBack: () => void;
}

interface RoutePoint {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  duration: string;
  rating: number;
  distance: string;
  videoAvailable: boolean;
  coordinates: { lat: number; lng: number };
}

const RouteBuilder: React.FC<RouteBuilderProps> = ({ userProfile, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState('');

  const sampleRoute: RoutePoint[] = [
    {
      id: '1',
      name: 'Казанский Кремль',
      description: 'Историческая крепость и главная достопримечательность Казани',
      category: 'culture',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      duration: '2 часа',
      rating: 4.8,
      distance: '0 км',
      videoAvailable: true,
      coordinates: { lat: 55.7985, lng: 49.1068 }
    },
    {
      id: '2', 
      name: 'Мечеть Кул-Шариф',
      description: 'Главная мечеть Республики Татарстан',
      category: 'culture',
      image: 'https://images.unsplash.com/photo-1564935739348-f0b78d34aacf?w=400',
      duration: '1 час',
      rating: 4.9,
      distance: '0.3 км',
      videoAvailable: true,
      coordinates: { lat: 55.7982, lng: 49.1055 }
    },
    {
      id: '3',
      name: 'Улица Баумана',
      description: 'Пешеходная улица с кафе, магазинами и уличными артистами',
      category: 'food',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      duration: '1.5 часа',
      rating: 4.6,
      distance: '0.7 км',
      videoAvailable: false,
      coordinates: { lat: 55.7877, lng: 49.1214 }
    },
    {
      id: '4',
      name: 'Озеро Кабан',
      description: 'Живописное озеро в центре города для прогулок',
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      duration: '1 час',
      rating: 4.4,
      distance: '1.2 км',
      videoAvailable: true,
      coordinates: { lat: 55.7794, lng: 49.1340 }
    },
    {
      id: '5',
      name: 'Музей национальной культуры',
      description: 'Экспозиция татарского быта и традиций',
      category: 'culture',
      image: 'https://images.unsplash.com/photo-1594736797933-d0701ba9b018?w=400',
      duration: '1.5 часа',
      rating: 4.7,
      distance: '0.8 км',
      videoAvailable: false,
      coordinates: { lat: 55.7856, lng: 49.1189 }
    }
  ];

  const generateRoute = async () => {
    setIsGenerating(true);
    
    // Имитация AI-генерации маршрута
    setTimeout(() => {
      const filteredRoute = sampleRoute.filter(point => 
        userProfile.interests.includes(point.category)
      );
      
      const finalRoute = filteredRoute.length >= 3 
        ? filteredRoute.slice(0, 5)
        : sampleRoute.slice(0, 5);
      
      setCurrentRoute(finalRoute);
      setTotalDuration(`${finalRoute.length * 1.3} часов`);
      setIsGenerating(false);
    }, 2000);
  };

  const regenerateRoute = () => {
    setCurrentRoute([]);
    generateRoute();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'culture': return '🏛️';
      case 'food': return '🍯';
      case 'nature': return '🌲';
      case 'events': return '🎭';
      default: return '📍';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'culture': return 'Культура';
      case 'food': return 'Еда';
      case 'nature': return 'Природа';
      case 'events': return 'События';
      default: return 'Место';
    }
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
          <h1 className="font-semibold">AI-Маршрут</h1>
          <p className="text-xs text-white/70">Персональный гид</p>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Контент */}
      <div className="p-4 space-y-4">
        {currentRoute.length === 0 ? (
          /* Генерация маршрута */
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Создадим идеальный маршрут</CardTitle>
                <p className="text-muted-foreground">
                  AI подберёт места на основе ваших интересов и местоположения
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Ваши интересы:</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map(interest => (
                      <Badge key={interest} variant="secondary">
                        {getCategoryIcon(interest)} {getCategoryLabel(interest)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={generateRoute}
                  disabled={isGenerating}
                  className="w-full tatar-gradient text-white border-0"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      AI создаёт маршрут...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Создать маршрут
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Информация об AI */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">Как работает AI-гид?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Анализирует ваши интересы и предпочтения</li>
                      <li>• Учитывает время и расстояния между точками</li>
                      <li>• Подбирает оптимальный порядок посещения</li>
                      <li>• Добавляет скрытые места от местных жителей</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Готовый маршрут */
          <div className="space-y-4">
            {/* Информация о маршруте */}
            <Card className="tatar-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Ваш маршрут готов!</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={regenerateRoute}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{currentRoute.length} мест</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{totalDuration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>4.7</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Список точек маршрута */}
            <div className="space-y-3">
              {currentRoute.map((point, index) => (
                <Card 
                  key={point.id}
                  className={`cursor-pointer transition-all ${
                    selectedPoint === point.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3 p-4">
                      {/* Номер точки */}
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                        {index + 1}
                      </div>
                      
                      {/* Изображение */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={point.image}
                          alt={point.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Информация */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium truncate">{point.name}</h3>
                          {point.videoAvailable && (
                            <Play className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {point.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(point.category)} {getCategoryLabel(point.category)}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{point.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span>{point.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Развернутая информация */}
                    {selectedPoint === point.id && (
                      <div className="border-t border-border p-4 bg-muted/30">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Расстояние</div>
                            <div className="font-medium">{point.distance}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Время</div>
                            <div className="font-medium">{point.duration}</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Navigation className="w-4 h-4 mr-1" />
                            Навигация
                          </Button>
                          {point.videoAvailable && (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Camera className="w-4 h-4 mr-1" />
                              Видео
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Кнопка запуска маршрута */}
            <div className="sticky bottom-4 pt-4">
              <Button className="w-full tatar-gradient text-white border-0" size="lg">
                <Navigation className="w-5 h-5 mr-2" />
                Начать путешествие
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteBuilder;