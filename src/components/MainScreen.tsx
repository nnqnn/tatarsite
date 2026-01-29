import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Route, 
  Calendar, 
  ShoppingBag, 
  User, 
  Heart,
  Share,
  Play,
  VolumeX,
  Volume2,
  Navigation
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from 'figma:asset/df889a880fc154ef65b1c2f4767be0f3c68d552c.png';

interface MainScreenProps {
  userProfile: {
    name: string;
    interests: string[];
    language: string;
  };
  onNavigate: (screen: string) => void;
}

interface VideoItem {
  id: string;
  title: string;
  location: string;
  duration: string;
  thumbnail: string;
  views: string;
  isLiked: boolean;
  category: string;
}

const MainScreen: React.FC<MainScreenProps> = ({ userProfile, onNavigate }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);

  const videos: VideoItem[] = [
    {
      id: '1',
      title: 'Казанский Кремль на рассвете',
      location: 'Казань, Кремль',
      duration: '0:23',
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      views: '2.1к',
      isLiked: false,
      category: 'culture'
    },
    {
      id: '2',
      title: 'Мастер-класс по чак-чаку',
      location: 'Елабуга',
      duration: '0:31',
      thumbnail: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
      views: '1.8к',
      isLiked: true,
      category: 'food'
    },
    {
      id: '3',
      title: 'Скрытый водопад в лесах',
      location: 'Национальный парк',
      duration: '0:19',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      views: '3.2к',
      isLiked: false,
      category: 'nature'
    },
    {
      id: '4',
      title: 'Татарские народные танцы',
      location: 'Болгар',
      duration: '0:28',
      thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400',
      views: '4.1к',
      isLiked: true,
      category: 'culture'
    }
  ];

  const handleScroll = (e: React.UIEvent) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

  const toggleLike = (videoId: string) => {
    // В реальном приложении здесь был бы API вызов
    console.log('Toggle like for video:', videoId);
  };

  const shareVideo = (videoId: string) => {
    // В реальном приложении здесь была бы функция шейринга
    console.log('Share video:', videoId);
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
            <img src={logo} alt="ТатарСайт" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold">ТатарСайт</h1>
            <p className="text-xs text-white/70">Откройте Татарстан</p>
          </div>
        </div>
        
        <Avatar className="w-8 h-8 cursor-pointer" onClick={() => onNavigate('profile')}>
          <AvatarFallback className="bg-white text-primary text-sm">
            {userProfile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Кнопка построения маршрута */}
      <div className="p-4">
        <Button 
          onClick={() => onNavigate('route-builder')}
          className="w-full tatar-gradient text-white border-0 h-12 text-base"
          size="lg"
        >
          <Route className="w-5 h-5 mr-2" />
          Построить маршрут с AI
        </Button>
      </div>

      {/* Лента видео */}
      <div className="flex-1 relative">
        <div 
          className="h-full overflow-y-auto snap-y snap-mandatory"
          onScroll={handleScroll}
          ref={videoRef}
        >
          {videos.map((video, index) => (
            <div 
              key={video.id} 
              className="h-full snap-start relative flex flex-col"
              style={{ height: 'calc(100vh - 140px)' }}
            >
              {/* Видео фон */}
              <div className="flex-1 relative bg-gray-900 rounded-lg mx-4 mb-4 overflow-hidden">
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Оверлей с градиентом */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Кнопка воспроизведения */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-16 h-16 rounded-full bg-white/20 text-white hover:bg-white/30"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                </div>

                {/* Информация о видео */}
                <div className="absolute bottom-4 left-4 right-16 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm opacity-90">{video.location}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{video.title}</h3>
                  <div className="flex items-center space-x-3 text-sm opacity-80">
                    <span>{video.views} просмотров</span>
                    <span>{video.duration}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="mt-2 bg-white/20 text-white border-0"
                  >
                    {video.category === 'culture' ? '🏛️ Культура' :
                     video.category === 'food' ? '🍯 Еда' :
                     video.category === 'nature' ? '🌲 Природа' : '🎭 События'}
                  </Badge>
                </div>

                {/* Боковые кнопки */}
                <div className="absolute right-4 bottom-4 space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                    onClick={() => toggleLike(video.id)}
                  >
                    <Heart 
                      className={`w-6 h-6 ${video.isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                    onClick={() => shareVideo(video.id)}
                  >
                    <Share className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="bg-white border-t border-border p-2">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 flex flex-col items-center py-2 text-primary"
          >
            <Route className="w-5 h-5 mb-1" />
            <span className="text-xs">Маршруты</span>
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
  );
};

export default MainScreen;