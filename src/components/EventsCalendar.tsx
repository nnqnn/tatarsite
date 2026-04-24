import React, { useMemo, useState } from 'react';
import { Card, CardContent } from './ui/card';
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
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Place } from '@/lib/api/types';

interface EventsCalendarProps {
  onBack: () => void;
  events: Place[];
  onReact: (placeId: string, reactionType: 'LIKE' | 'DISLIKE' | 'NONE') => Promise<void>;
  onOpenComments: (place: Place) => void;
  onNavigateCreateEvent: () => void;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ onBack, events, onReact, onOpenComments, onNavigateCreateEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Все', emoji: '📍' },
    { id: 'events', label: 'События', emoji: '🎭' },
    { id: 'culture', label: 'Культура', emoji: '🏛️' },
    { id: 'food', label: 'Еда', emoji: '🍯' },
    { id: 'nature', label: 'Природа', emoji: '🌲' },
    { id: 'crafts', label: 'Ремёсла', emoji: '🎨' },
  ];

  const filteredEvents = useMemo(
    () => (selectedCategory === 'all' ? events : events.filter((event) => event.category === selectedCategory)),
    [events, selectedCategory],
  );

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">События</h1>
          <p className="text-xs text-white/70">Актуальные места и активности</p>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4">
        <Button className="w-full bg-primary text-white mb-3" onClick={onNavigateCreateEvent}>
          <Plus className="w-4 h-4 mr-2" />
          Создать событие
        </Button>
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
        <Tabs defaultValue="upcoming" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="upcoming">Скоро</TabsTrigger>
            <TabsTrigger value="this-week">На неделе</TabsTrigger>
            <TabsTrigger value="month">В месяце</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="px-4 space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">Событий пока нет</CardContent>
              </Card>
            ) : null}

            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="relative">
                  <div className="h-48 overflow-hidden">
                    <ImageWithFallback
                      src={event.thumbnailUrl ?? 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=800'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xs text-muted-foreground">Дата</div>
                      <div className="font-bold text-sm">{formatDate(event.eventStartAt ?? event.createdAt)}</div>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                      onClick={() => onReact(event.id, event.viewerReaction === 'LIKE' ? 'NONE' : 'LIKE')}
                    >
                      <ThumbsUp className={`w-4 h-4 ${event.viewerReaction === 'LIKE' ? 'fill-green-500 text-green-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 p-0"
                      onClick={() => onReact(event.id, event.viewerReaction === 'DISLIKE' ? 'NONE' : 'DISLIKE')}
                    >
                      <ThumbsDown
                        className={`w-4 h-4 ${event.viewerReaction === 'DISLIKE' ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(event.eventStartAt ?? event.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location.city ?? event.location.address ?? 'Татарстан'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.counts.reactions} реакций</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categories.find((c) => c.id === event.category)?.emoji ?? '📍'} {event.author.name}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onOpenComments(event)}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Комментарии
                        </Button>
                        <Button size="sm" className="bg-primary text-white">
                          <Plus className="w-4 h-4 mr-1" />В маршрут
                        </Button>
                      </div>
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
              <p className="text-sm text-muted-foreground">Показываем ближайшие публикации в разделе «Скоро»</p>
            </div>
          </TabsContent>

          <TabsContent value="month" className="px-4">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">События месяца</h3>
              <p className="text-sm text-muted-foreground">Расширенный календарь будет добавлен в следующих версиях</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsCalendar;
