import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Settings, 
  Award, 
  MapPin, 
  Route, 
  Calendar,
  Star,
  Trophy,
  Target,
  Camera,
  Share,
  Globe,
  Moon,
  Sun
} from 'lucide-react';

interface UserProfileProps {
  userProfile: {
    name: string;
    interests: string[];
    language: string;
  };
  onBack: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: string;
}

interface TripHistory {
  id: string;
  title: string;
  date: string;
  places: number;
  duration: string;
  image: string;
  rating: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userProfile, onBack }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const userStats = {
    level: 5,
    experience: 2340,
    nextLevelExp: 3000,
    routesCompleted: 12,
    placesVisited: 47,
    badgesEarned: 8,
    totalDistance: '127 км'
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Первооткрыватель',
      description: 'Завершите первый маршрут',
      icon: '🗺️',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      category: 'route'
    },
    {
      id: '2',
      title: 'Культурный исследователь',
      description: 'Посетите 10 культурных мест',
      icon: '🏛️',
      progress: 8,
      maxProgress: 10,
      unlocked: false,
      category: 'culture'
    },
    {
      id: '3',
      title: 'Гурман',
      description: 'Попробуйте 15 блюд татарской кухни',
      icon: '🍯',
      progress: 12,
      maxProgress: 15,
      unlocked: false,
      category: 'food'
    },
    {
      id: '4',
      title: 'Натуралист',
      description: 'Откройте 20 природных мест',
      icon: '🌲',
      progress: 5,
      maxProgress: 20,
      unlocked: false,
      category: 'nature'
    },
    {
      id: '5',
      title: 'Мастер путешествий',
      description: 'Пройдите 100 км по маршрутам',
      icon: '🏃',
      progress: 127,
      maxProgress: 100,
      unlocked: true,
      category: 'distance'
    },
    {
      id: '6',
      title: 'Знаток традиций',
      description: 'Посетите 5 мастер-классов',
      icon: '🎨',
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      category: 'crafts'
    }
  ];

  const tripHistory: TripHistory[] = [
    {
      id: '1',
      title: 'Исторический центр Казани',
      date: '15 ноября',
      places: 5,
      duration: '4 часа',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      rating: 5
    },
    {
      id: '2',
      title: 'Гастрономический тур',
      date: '28 октября',
      places: 4,
      duration: '3 часа',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300',
      rating: 4
    },
    {
      id: '3',
      title: 'Природные красоты',
      date: '12 октября',
      places: 3,
      duration: '5 часов',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
      rating: 5
    }
  ];

  const experienceProgress = (userStats.experience / userStats.nextLevelExp) * 100;

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
          <h1 className="font-semibold">Профиль</h1>
          <p className="text-xs text-white/70">Ваши достижения</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Информация о пользователе */}
        <Card className="tatar-gradient text-white">
          <CardContent className="p-6 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white">
              <AvatarFallback className="bg-white text-primary text-2xl">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-semibold mb-1">{userProfile.name}</h2>
            <p className="text-white/80 mb-4">Путешественник Татарстана</p>
            
            {/* Уровень */}
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Уровень {userStats.level}</span>
                <span className="text-sm">{userStats.experience}/{userStats.nextLevelExp} XP</span>
              </div>
              <Progress value={experienceProgress} className="h-2 bg-white/20" />
            </div>
            
            {/* Статистика */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{userStats.routesCompleted}</div>
                <div className="text-xs text-white/70">Маршрутов</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{userStats.placesVisited}</div>
                <div className="text-xs text-white/70">Мест</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{userStats.badgesEarned}</div>
                <div className="text-xs text-white/70">Наград</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{userStats.totalDistance}</div>
                <div className="text-xs text-white/70">Пройдено</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Вкладки */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">
              <Award className="w-4 h-4 mr-1" />
              Награды
            </TabsTrigger>
            <TabsTrigger value="history">
              <Route className="w-4 h-4 mr-1" />
              История
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-1" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {achievements.map(achievement => (
                <Card 
                  key={achievement.id}
                  className={`${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          {achievement.unlocked && (
                            <Badge className="bg-green-100 text-green-800">Получено</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {tripHistory.map(trip => (
              <Card key={trip.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={trip.image} 
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{trip.title}</h4>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                        <span>{trip.date}</span>
                        <span>{trip.places} мест</span>
                        <span>{trip.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${
                              i < trip.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              {/* Интересы */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Интересы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map(interest => (
                      <Badge key={interest} variant="secondary">
                        {interest === 'culture' ? '🏛️ Культура' :
                         interest === 'food' ? '🍯 Еда' :
                         interest === 'nature' ? '🌲 Природа' :
                         interest === 'events' ? '🎭 События' : interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Язык */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Настройки приложения</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <span>Язык</span>
                    </div>
                    <Badge variant="outline">
                      {userProfile.language === 'ru' ? '🇷🇺 Русский' :
                       userProfile.language === 'tt' ? '🏛️ Татарский' : '🇺🇸 English'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDarkMode ? (
                        <Moon className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Sun className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>Тёмная тема</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                      {isDarkMode ? 'Вкл' : 'Выкл'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Действия */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Поделиться профилем
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Обратная связь
                </Button>
                
                <Button variant="destructive" className="w-full justify-start">
                  Выйти из аккаунта
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;