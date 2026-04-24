import React, { useEffect, useMemo, useState } from 'react';
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
  Route,
  Star,
  Target,
  Camera,
  Share,
  Globe,
  Moon,
  Sun,
  PlusSquare,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Place } from '@/lib/api/types';

interface UserProfileProps {
  userProfile: {
    id: string;
    name: string;
    email: string;
    interests: string[];
    language: string;
    stats: {
      placesCount: number;
      reactionsCount: number;
      commentsCount: number;
    };
  };
  userPlaces: Place[];
  onBack: () => void;
  onLogout: () => Promise<void>;
  onNavigateCreatePlace: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userProfile,
  userPlaces,
  onBack,
  onLogout,
  onNavigateCreatePlace,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = window.localStorage.getItem('tatarsite-theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [activeTab, setActiveTab] = useState('achievements');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('tatarsite-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const userStats = useMemo(
    () => ({
      level: Math.max(1, Math.floor((userProfile.stats.placesCount + userProfile.stats.reactionsCount) / 3) + 1),
      experience: userProfile.stats.placesCount * 180 + userProfile.stats.reactionsCount * 20,
      nextLevelExp: 3000,
      routesCompleted: Math.max(1, Math.floor(userProfile.stats.placesCount / 2)),
      placesVisited: userProfile.stats.placesCount,
      badgesEarned: Math.max(1, Math.floor(userProfile.stats.commentsCount / 2) + 1),
      totalDistance: `${Math.max(10, userProfile.stats.placesCount * 3)} км`,
    }),
    [userProfile.stats],
  );

  const experienceProgress = Math.min(100, (userStats.experience / userStats.nextLevelExp) * 100);

  const achievements = [
    {
      id: '1',
      title: 'Первая публикация',
      description: 'Добавьте первое место в ленту',
      icon: '🗺️',
      progress: Math.min(userProfile.stats.placesCount, 1),
      maxProgress: 1,
      unlocked: userProfile.stats.placesCount >= 1,
    },
    {
      id: '2',
      title: 'Активный автор',
      description: 'Опубликуйте 5 мест',
      icon: '📍',
      progress: Math.min(userProfile.stats.placesCount, 5),
      maxProgress: 5,
      unlocked: userProfile.stats.placesCount >= 5,
    },
    {
      id: '3',
      title: 'Общительный',
      description: 'Получите 10 комментариев',
      icon: '💬',
      progress: Math.min(userProfile.stats.commentsCount, 10),
      maxProgress: 10,
      unlocked: userProfile.stats.commentsCount >= 10,
    },
  ];

  const languageLabel =
    userProfile.language === 'ru' ? '🇷🇺 Русский' : userProfile.language === 'tt' ? '🏛️ Татарский' : '🇺🇸 Английский';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
    });

  const shareWithFallback = async (payload: { title: string; text: string }) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: window.location.href,
        });
        return;
      } catch {
        // Пользователь закрыл системное окно шаринга.
      }
    }

    await navigator.clipboard.writeText(`${payload.title}\n${payload.text}\n${window.location.href}`);
  };

  const shareProfile = async () => {
    await shareWithFallback({
      title: `Профиль ${userProfile.name} в ТатарСайт`,
      text: `Публикаций: ${userProfile.stats.placesCount}, реакций: ${userProfile.stats.reactionsCount}, комментариев: ${userProfile.stats.commentsCount}`,
    });
  };

  const sharePlaceCard = async (place: Place) => {
    await shareWithFallback({
      title: place.title,
      text: place.description,
    });
  };

  const openFeedback = () => {
    const subject = encodeURIComponent('Обратная связь по ТатарСайт');
    const body = encodeURIComponent(`Здравствуйте!\n\nПишу по поводу приложения ТатарСайт.\n\nПользователь: ${userProfile.email}\n`);
    window.location.href = `mailto:support@tatarsite.ru?subject=${subject}&body=${body}`;
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">Профиль</h1>
          <p className="text-xs text-white/70">Ваши публикации и настройки</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        <Card className="tatar-gradient text-white">
          <CardContent className="p-6 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-white">
              <AvatarFallback className="bg-white text-primary text-2xl">{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-semibold mb-1">{userProfile.name}</h2>
            <p className="text-white/80 mb-4">{userProfile.email}</p>

            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Уровень {userStats.level}</span>
                <span className="text-sm">
                  {userStats.experience}/{userStats.nextLevelExp} XP
                </span>
              </div>
              <Progress value={experienceProgress} className="h-2 bg-white/20" />
            </div>

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">
              <Award className="w-4 h-4 mr-1" />Награды
            </TabsTrigger>
            <TabsTrigger value="history">
              <Route className="w-4 h-4 mr-1" />Публикации
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-1" />Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          {achievement.unlocked ? <Badge className="bg-green-100 text-green-800">Получено</Badge> : null}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="flex-1 h-2" />
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
            <Button className="w-full bg-primary text-white" onClick={onNavigateCreatePlace}>
              <PlusSquare className="w-4 h-4 mr-2" />Добавить новое место
            </Button>

            {userPlaces.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">У вас пока нет публикаций</CardContent>
              </Card>
            ) : null}

            {userPlaces.map((place) => (
              <Card key={place.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={place.thumbnailUrl ?? 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400'}
                        alt={place.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{place.title}</h4>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                        <span>{formatDate(place.createdAt)}</span>
                        <span>{place.location.city ?? 'Татарстан'}</span>
                        <span>{place.counts.reactions} реакций</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => sharePlaceCard(place)}>
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Интересы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest === 'culture'
                          ? '🏛️ Культура'
                          : interest === 'food'
                            ? '🍯 Еда'
                            : interest === 'nature'
                              ? '🌲 Природа'
                              : interest === 'events'
                                ? '🎭 События'
                                : interest === 'crafts'
                                  ? '🎨 Ремёсла'
                                  : interest === 'history'
                                    ? '📚 История'
                                    : interest === 'hidden'
                                      ? '💎 Скрытые места'
                                      : interest === 'festivals'
                                        ? '🎪 Фестивали'
                                        : '🛍️ Маркет'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                    <Badge variant="outline">{languageLabel}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isDarkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                      <span>Тёмная тема</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{isDarkMode ? 'Включена' : 'Выключена'}</span>
                      <Button variant="outline" size="sm" onClick={() => setIsDarkMode((prev) => !prev)}>
                        {isDarkMode ? 'Выключить' : 'Включить'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={shareProfile}>
                  <Camera className="w-4 h-4 mr-2" />Поделиться профилем
                </Button>

                <Button variant="outline" className="w-full justify-start" onClick={openFeedback}>
                  <Target className="w-4 h-4 mr-2" />Обратная связь
                </Button>

                <Button variant="destructive" className="w-full justify-start" onClick={() => void onLogout()}>
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
