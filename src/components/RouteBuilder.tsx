import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Navigation,
  RefreshCw,
  Play,
  ExternalLink,
  Info,
  LocateFixed,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { RoutePlanPoint } from '@/lib/api/types';

type RoutePoint = RoutePlanPoint;

interface RouteBuilderProps {
  userProfile: {
    interests: string[];
    language: string;
  };
  onBack: () => void;
  routePoints: RoutePoint[];
  estimatedDurationMinutes: number;
  isGenerating: boolean;
  onGenerateRoute: (latitude?: number, longitude?: number) => Promise<void>;
}

const RouteBuilder: React.FC<RouteBuilderProps> = ({
  userProfile,
  onBack,
  routePoints,
  estimatedDurationMinutes,
  isGenerating,
  onGenerateRoute,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({});

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'culture':
        return '🏛️';
      case 'food':
        return '🍯';
      case 'nature':
        return '🌲';
      case 'events':
        return '🎭';
      case 'crafts':
        return '🎨';
      default:
        return '📍';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'culture':
        return 'Культура';
      case 'food':
        return 'Еда';
      case 'nature':
        return 'Природа';
      case 'events':
        return 'События';
      case 'crafts':
        return 'Ремёсла';
      default:
        return 'Место';
    }
  };

  const openNavigationToPoint = (point: RoutePoint) => {
    if (location.latitude !== undefined && location.longitude !== undefined) {
      const routeText = `${location.latitude},${location.longitude}~${point.latitude},${point.longitude}`;
      const url = `https://yandex.ru/maps/?rtext=${encodeURIComponent(routeText)}&rtt=auto`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const url = `https://yandex.ru/maps/?ll=${point.longitude},${point.latitude}&z=16&pt=${point.longitude},${point.latitude},pm2rdm`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openFullRoute = () => {
    if (!routePoints.length) {
      return;
    }

    const parts = [
      ...(location.latitude !== undefined && location.longitude !== undefined
        ? [`${location.latitude},${location.longitude}`]
        : []),
      ...routePoints.map((point) => `${point.latitude},${point.longitude}`),
    ];

    const url = `https://yandex.ru/maps/?rtext=${encodeURIComponent(parts.join('~'))}&rtt=auto`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">ИИ-Маршрут</h1>
          <p className="text-xs text-white/70">Персональный гид</p>
        </div>
        <div className="w-9" />
      </div>

      <div className="p-4 space-y-4">
        {routePoints.length === 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Создадим идеальный маршрут</CardTitle>
                <p className="text-muted-foreground">ИИ подберёт места на основе ваших интересов и местоположения</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Ваши интересы:</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {getCategoryIcon(interest)} {getCategoryLabel(interest)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={requestLocation}>
                  <LocateFixed className="w-4 h-4 mr-2" />
                  Определить мою геолокацию
                </Button>

                <Button
                  onClick={() => onGenerateRoute(location.latitude, location.longitude)}
                  disabled={isGenerating}
                  className="w-full tatar-gradient text-white border-0"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ИИ создаёт маршрут...
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

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">Как работает ИИ-гид?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Анализирует ваши интересы и предпочтения</li>
                      <li>• Учитывает близость локаций</li>
                      <li>• Подбирает удобный порядок посещения</li>
                      <li>• Добавляет популярные и новые места</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="tatar-gradient text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold">Ваш маршрут готов!</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={() => onGenerateRoute(location.latitude, location.longitude)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{routePoints.length} мест</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.max(1, Math.round(estimatedDurationMinutes / 60))} ч</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>ИИ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {routePoints.map((point) => (
                <Card
                  key={point.placeId}
                  className={`cursor-pointer transition-all ${selectedPoint === point.placeId ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedPoint(selectedPoint === point.placeId ? null : point.placeId)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-3 p-4">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                        {point.order}
                      </div>

                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={point.imageUrl ?? 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'}
                          alt={point.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium truncate">{point.title}</h3>
                          <Play className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{point.description}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(point.category)} {getCategoryLabel(point.category)}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{point.estimatedDurationMinutes} мин</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Navigation className="w-3 h-3" />
                            <span>{point.distanceFromPreviousKm} км</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedPoint === point.placeId && (
                      <div className="border-t border-border p-4 bg-muted/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Город</div>
                            <div className="font-medium">{point.city ?? 'Не указан'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">В пути</div>
                            <div className="font-medium">{point.estimatedTravelMinutes} мин</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">На месте</div>
                            <div className="font-medium">{point.estimatedStopMinutes} мин</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Расстояние</div>
                            <div className="font-medium">{point.distanceFromPreviousKm} км</div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1" onClick={() => openNavigationToPoint(point)}>
                            <Navigation className="w-4 h-4 mr-1" />
                            Навигация
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => point.imageUrl && window.open(point.imageUrl, '_blank', 'noopener,noreferrer')}
                            disabled={!point.imageUrl}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Фото
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="sticky bottom-4 pt-4">
              <Button className="w-full tatar-gradient text-white border-0" size="lg" onClick={openFullRoute}>
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
