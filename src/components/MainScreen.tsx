import React, { useMemo } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Route,
  Calendar,
  ShoppingBag,
  User,
  Share,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  PlusSquare,
  RefreshCw,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Place } from '@/lib/api/types';
import logo from 'figma:asset/df889a880fc154ef65b1c2f4767be0f3c68d552c.png';

interface MainScreenProps {
  userProfile: {
    name: string;
    interests: string[];
    language: string;
  };
  places: Place[];
  feedLoading: boolean;
  onNavigate: (screen: string) => void;
  onReact: (placeId: string, reactionType: 'LIKE' | 'DISLIKE' | 'NONE') => Promise<void>;
  onOpenComments: (place: Place) => void;
  onReloadFeed: () => Promise<void>;
}

const MainScreen: React.FC<MainScreenProps> = ({
  userProfile,
  places,
  feedLoading,
  onNavigate,
  onReact,
  onOpenComments,
  onReloadFeed,
}) => {
  const sharePlace = async (place: Place) => {
    const shareData = {
      title: place.title,
      text: place.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Пользователь мог отменить системное окно шаринга.
      }
      return;
    }

    await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
  };

  const categoryLabel = useMemo(
    () => ({
      culture: '🏛️ Культура',
      food: '🍯 Еда',
      nature: '🌲 Природа',
      events: '🎭 События',
      crafts: '🎨 Ремёсла',
      history: '📚 История',
      hidden: '💎 Скрытые места',
      festivals: '🎪 Фестивали',
      market: '🛍️ Маркет',
    }),
    [],
  );

  return (
    <div className="mobile-container bg-muted/30" style={{ minHeight: '100dvh', background: '#f5f7fb' }}>
      <div className="flex items-center justify-between p-4 bg-primary text-white rounded-b-xl shadow-sm" style={{ width: '100%' }}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
            <img src={logo} alt="ТатарСайт" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold">ТатарСайт</h1>
            <p className="text-xs text-white/70">Лента рекомендаций</p>
          </div>
        </div>

        <Avatar className="w-8 h-8 cursor-pointer" onClick={() => onNavigate('profile')}>
          <AvatarFallback className="bg-white text-primary text-sm">{userProfile.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 640,
          margin: '0 auto',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 92,
        }}
      >
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={() => onNavigate('route-builder')}
            className="w-full tatar-gradient text-white border-0 h-12 text-base"
            size="lg"
          >
            <Route className="w-5 h-5 mr-2" />
            Построить маршрут с ИИ
          </Button>

          <Button
            onClick={() => onNavigate('create-place')}
            className="w-full bg-primary text-white border-0 h-12 text-base"
            size="lg"
          >
            <PlusSquare className="w-5 h-5 mr-2" />
            Добавить место
          </Button>
        </div>

        <div className="px-4 pb-2">
          <Button variant="outline" className="w-full bg-white" onClick={onReloadFeed} disabled={feedLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${feedLoading ? 'animate-spin' : ''}`} />
            {feedLoading ? 'Обновляем ленту...' : 'Обновить рекомендации'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {places.length === 0 && !feedLoading ? (
            <div className="h-full min-h-[260px] flex items-center justify-center text-center">
              <p className="text-muted-foreground">Пока нет публикаций в ленте. Добавьте первое место.</p>
            </div>
          ) : null}

          <div className="space-y-4">
            {places.map((place) => (
              <article key={place.id} className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{place.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{place.author.name}</p>
                      <p className="text-xs text-muted-foreground">{place.location.city ?? 'Татарстан'}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{categoryLabel[place.category] ?? '📍 Место'}</Badge>
                </div>

                <div className="relative aspect-[4/5] bg-gray-100">
                  <ImageWithFallback
                    src={place.thumbnailUrl ?? 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=1200'}
                    alt={place.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => onReact(place.id, place.viewerReaction === 'LIKE' ? 'NONE' : 'LIKE')}
                    >
                      <ThumbsUp className={`w-4 h-4 mr-1 ${place.viewerReaction === 'LIKE' ? 'fill-green-500 text-green-500' : ''}`} />
                      Нравится
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => onReact(place.id, place.viewerReaction === 'DISLIKE' ? 'NONE' : 'DISLIKE')}
                    >
                      <ThumbsDown className={`w-4 h-4 mr-1 ${place.viewerReaction === 'DISLIKE' ? 'fill-red-500 text-red-500' : ''}`} />
                      Не нравится
                    </Button>

                    <Button variant="ghost" size="sm" className="h-9 px-3" onClick={() => onOpenComments(place)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Комментарии
                    </Button>

                    <Button variant="ghost" size="sm" className="h-9 px-3 ml-auto" onClick={() => sharePlace(place)}>
                      <Share className="w-4 h-4 mr-1" />
                      Поделиться
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base">{place.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{place.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> {place.location.address ?? 'Адрес не указан'}
                    </span>
                    <span>{place.counts.reactions} реакций</span>
                    <span>{place.counts.comments} комментариев</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div
        className="border-t border-border bg-white/95"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', padding: 8 }}>
          <div className="flex items-center justify-around">
            <Button variant="ghost" size="sm" className="flex-1 flex flex-col items-center py-2 text-primary">
              <Route className="w-5 h-5 mb-1" />
              <span className="text-xs">Лента</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 flex flex-col items-center py-2 text-muted-foreground"
              onClick={() => onNavigate('events')}
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-xs">События</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 flex flex-col items-center py-2 text-muted-foreground"
              onClick={() => onNavigate('market')}
            >
              <ShoppingBag className="w-5 h-5 mb-1" />
              <span className="text-xs">Маркет</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1 flex flex-col items-center py-2 text-muted-foreground"
              onClick={() => onNavigate('profile')}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">Профиль</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
