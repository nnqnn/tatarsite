import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Filter,
  Plus,
  Heart,
  Share
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventsCalendarProps {
  onBack: () => void;
  userInterests: string[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: string;
  attendees: number;
  isLiked: boolean;
  isFree: boolean;
  organizer: string;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ onBack, userInterests }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);

  const events: Event[] = [
    {
      id: '1',
      title: 'Фестиваль татарской кухни',
      description: 'Попробуйте лучшие блюда татарской кухни от именитых поваров',
      category: 'food',
      date: '15 дек',
      time: '12:00',
      location: 'Центральный парк',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      price: 'Бесплатно',
      attendees: 234,
      isLiked: false,
      isFree: true,
      organizer: 'Мин-во туризма РТ'
    },
    {
      id: '2',
      title: 'Концерт этно-музыки',
      description: 'Выступление народного ансамбля "Туган тел"',
      category: 'culture',
      date: '18 дек',
      time: '19:00',
      location: 'Концертный зал',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      price: '500 ₽',
      attendees: 156,
      isLiked: true,
      isFree: false,
      organizer: 'Филармония'
    },
    {
      id: '3',
      title: 'Мастер-класс по ковроткачеству',
      description: 'Изучите древнее искусство татарского ковроткачества',
      category: 'crafts',
      date: '20 дек',
      time: '14:00',
      location: 'Музей ремёсел',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      price: '300 ₽',
      attendees: 45,
      isLiked: false,
      isFree: false,
      organizer: 'Союз мастеров'
    },
    {
      id: '4',
      title: 'Экскурсия по зимнему лесу',
      description: 'Пешая прогулка с гидом по заповедным тропам',
      category: 'nature',
      date: '22 дек',
      time: '10:00',
      location: 'Нац. парк "Нижняя Кама"',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      price: '200 ₽',
      attendees: 89,
      isLiked: false,
      isFree: false,
      organizer: 'ЭкоТур'
    },
    {
      id: '5',
      title: 'Новогодний базар',
      description: 'Ярмарка местных мастеров с подарками и угощениями',
      category: 'events',
      date: '25 дек',
      time: '11:00',
      location: 'Площадь Тысячелетия',
      image: 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400',
      price: 'Бесплатно',
      attendees: 567,
      isLiked: true,
      isFree: true,
      organizer: 'Администрация города'
    }
  ];

  const categories = [
    { id: 'all', label: 'Все', emoji: '📍' },
    { id: 'culture', label: 'Культура', emoji: '🏛️' },
    { id: 'food', label: 'Еда', emoji: '🍯' },
    { id: 'nature', label: 'Природа', emoji: '🌲' },
    { id: 'crafts', label: 'Ремёсла', emoji: '🎨' },
    { id: 'events', label: 'События', emoji: '🎭' }
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const toggleLike = (eventId: string) => {
    setLikedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const addToRoute = (eventId: string) => {
    console.log('Add event to route:', eventId);
    // В реальном приложении здесь было бы добавление в маршрут
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
          <h1 className="font-semibold">События</h1>
          <p className="text-xs text-white/70">Что происходит в Татарстане</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <Filter className="w-5 h-5" />
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
        <Tabs defaultValue="upcoming" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="upcoming">Скоро</TabsTrigger>
            <TabsTrigger value="this-week">На неделе</TabsTrigger>
            <TabsTrigger value="month">В месяце</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="px-4 space-y-4">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <div className="relative">
                  <div className="h-48 overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Оверлей с информацией */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Дата */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xs text-muted-foreground">Дек</div>
                      <div className="font-bold text-lg">{event.date.split(' ')[0]}</div>
                    </div>
                  </div>
                  
                  {/* Цена */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={event.isFree ? "secondary" : "default"}
                      className={event.isFree ? "bg-green-100 text-green-800" : "bg-primary text-white"}
                    >
                      {event.price}
                    </Badge>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                      onClick={() => toggleLike(event.id)}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          likedEvents.includes(event.id) || event.isLiked 
                            ? 'fill-red-500 text-red-500' 
                            : ''
                        }`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{event.date} в {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} участников</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === event.category)?.emoji} {event.organizer}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="bg-primary text-white"
                        onClick={() => addToRoute(event.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        В маршрут
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="this-week" className="px-4">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">События на неделе</h3>
              <p className="text-sm text-muted-foreground">
                События на ближайшую неделю появятся здесь
              </p>
            </div>
          </TabsContent>

          <TabsContent value="month" className="px-4">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">События месяца</h3>
              <p className="text-sm text-muted-foreground">
                Полный календарь событий на месяц
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsCalendar;