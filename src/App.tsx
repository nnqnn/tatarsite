import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Onboarding from './components/Onboarding';
import MainScreen from './components/MainScreen';
import RouteBuilder from './components/RouteBuilder';
import EventsCalendar from './components/EventsCalendar';
import MarketPlace from './components/MarketPlace';
import UserProfile from './components/UserProfile';
import AuthScreen from './components/AuthScreen';
import CreatePlaceScreen from './components/CreatePlaceScreen';
import CommentsDialog from './components/CommentsDialog';
import { apiClient, ApiError } from './lib/api/client';
import type { InterestCategory, MeUser, Place, RoutePlanPoint, ThreadedComment } from './lib/api/types';

type Screen = 'main' | 'route-builder' | 'events' | 'market' | 'profile' | 'create-place' | 'create-event';

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [createPlaceLoading, setCreatePlaceLoading] = useState(false);
  const [createPlaceError, setCreatePlaceError] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [me, setMe] = useState<MeUser | null>(null);

  const [feedPlaces, setFeedPlaces] = useState<Place[]>([]);
  const [eventsPlaces, setEventsPlaces] = useState<Place[]>([]);
  const [marketPlaces, setMarketPlaces] = useState<Place[]>([]);
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);

  const [routePoints, setRoutePoints] = useState<RoutePlanPoint[]>([]);
  const [routeDurationMinutes, setRouteDurationMinutes] = useState(0);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedCommentsPlace, setSelectedCommentsPlace] = useState<Place | null>(null);
  const [comments, setComments] = useState<ThreadedComment[]>([]);

  const userProfile = useMemo(() => {
    if (!me) {
      return {
        id: '',
        name: 'Гость',
        email: '',
        interests: ['culture'],
        language: 'ru',
        stats: {
          placesCount: 0,
          reactionsCount: 0,
          commentsCount: 0,
        },
      };
    }

    return {
      id: me.id,
      name: me.displayName,
      email: me.email,
      interests: me.interests,
      language: me.language,
      stats: me.stats,
    };
  }, [me]);

  const splitPublicPlaces = (allPlaces: Place[]) => {
    setEventsPlaces(allPlaces.filter((item) => item.isEvent));
    setMarketPlaces(allPlaces.filter((item) => !item.isEvent && ['market', 'crafts'].includes(item.category)));
  };

  const loadAppData = useCallback(
    async (currentUser: MeUser) => {
      setFeedLoading(true);
      try {
        const [feed, allPlaces, myPlaces] = await Promise.all([
          apiClient.getRecommendedFeed({ limit: 30 }),
          apiClient.getPlaces({ limit: 100 }),
          apiClient.getUserPlaces(currentUser.id),
        ]);

        setFeedPlaces(feed.items);
        splitPublicPlaces(allPlaces);
        setUserPlaces(myPlaces);
      } finally {
        setFeedLoading(false);
      }
    },
    [],
  );

  const refreshMe = useCallback(async () => {
    const meResponse = await apiClient.getMe();
    setMe(meResponse);
    return meResponse;
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!apiClient.hasSession) {
        setAppLoading(false);
        return;
      }

      try {
        const meResponse = await refreshMe();
        if (meResponse.onboardingCompleted) {
          await loadAppData(meResponse);
          setCurrentScreen('main');
        }
      } catch {
        apiClient.clearTokens();
        setMe(null);
      } finally {
        setAppLoading(false);
      }
    };

    init();
  }, [loadAppData, refreshMe]);

  const handleLogin = async (payload: { email: string; password: string }) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      await apiClient.login(payload);
      const meResponse = await refreshMe();

      if (meResponse.onboardingCompleted) {
        await loadAppData(meResponse);
      }
      setCurrentScreen('main');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось выполнить вход';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (payload: { displayName: string; email: string; password: string }) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      await apiClient.register(payload);
      await refreshMe();
      setCurrentScreen('main');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось выполнить регистрацию';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setMe(null);
    setFeedPlaces([]);
    setEventsPlaces([]);
    setMarketPlaces([]);
    setUserPlaces([]);
    setRoutePoints([]);
    setRouteDurationMinutes(0);
    setCurrentScreen('main');
    setIsCommentsOpen(false);
    setSelectedCommentsPlace(null);
  };

  const handleOnboardingComplete = async (data: { interests: string[]; language: string }) => {
    setOnboardingError(null);
    setOnboardingLoading(true);

    try {
      await apiClient.savePreferences({
        interests: data.interests as InterestCategory[],
        language: data.language as 'ru' | 'tt' | 'en',
      });
      const meResponse = await refreshMe();
      await loadAppData(meResponse);
      setCurrentScreen('main');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось сохранить предпочтения';
      setOnboardingError(message);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const mutatePlaceLists = (placeId: string, mutation: (place: Place) => Place) => {
    const updateArray = (items: Place[]) => items.map((place) => (place.id === placeId ? mutation(place) : place));

    setFeedPlaces((prev) => updateArray(prev));
    setEventsPlaces((prev) => updateArray(prev));
    setMarketPlaces((prev) => updateArray(prev));
    setUserPlaces((prev) => updateArray(prev));
  };

  const handleReactToPlace = async (placeId: string, reactionType: 'LIKE' | 'DISLIKE' | 'NONE') => {
    const currentPlace = [...feedPlaces, ...eventsPlaces, ...marketPlaces, ...userPlaces].find((place) => place.id === placeId);
    if (!currentPlace) return;

    const previousReaction = currentPlace.viewerReaction;

    const optimisticReaction = reactionType === 'NONE' ? null : reactionType;
    const countDelta = previousReaction === null && optimisticReaction !== null ? 1 : previousReaction !== null && optimisticReaction === null ? -1 : 0;

    mutatePlaceLists(placeId, (place) => ({
      ...place,
      viewerReaction: optimisticReaction,
      counts: {
        ...place.counts,
        reactions: Math.max(0, place.counts.reactions + countDelta),
      },
    }));

    try {
      const savedReaction = await apiClient.reactToPlace(placeId, reactionType);
      mutatePlaceLists(placeId, (place) => ({
        ...place,
        viewerReaction: savedReaction,
      }));
    } catch {
      mutatePlaceLists(placeId, (place) => ({
        ...place,
        viewerReaction: previousReaction,
        counts: {
          ...place.counts,
          reactions: Math.max(0, place.counts.reactions - countDelta),
        },
      }));
    }
  };

  const loadCommentsForSelectedPlace = useCallback(async () => {
    if (!selectedCommentsPlace) return;

    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const list = await apiClient.getComments(selectedCommentsPlace.id);
      setComments(list);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось загрузить комментарии';
      setCommentsError(message);
    } finally {
      setCommentsLoading(false);
    }
  }, [selectedCommentsPlace]);

  const handleOpenComments = (place: Place) => {
    setSelectedCommentsPlace(place);
    setComments([]);
    setCommentsError(null);
    setIsCommentsOpen(true);
  };

  const handleSubmitComment = async (body: string, parentCommentId?: string) => {
    if (!selectedCommentsPlace) return;

    setCommentsError(null);
    try {
      await apiClient.addComment(selectedCommentsPlace.id, body, parentCommentId);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось отправить комментарий';
      setCommentsError(message);
      return;
    }

    mutatePlaceLists(selectedCommentsPlace.id, (place) => ({
      ...place,
      counts: {
        ...place.counts,
        comments: place.counts.comments + 1,
      },
    }));

    await loadCommentsForSelectedPlace();
  };

  const handleReloadFeed = async () => {
    if (!me) return;
    await loadAppData(me);
  };

  const handleCreatePlace = async (payload: {
    title: string;
    description: string;
    category: InterestCategory;
    isEvent?: boolean;
    eventStartAt?: string;
    eventEndAt?: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    imageUrls?: string[];
    files?: File[];
  }) => {
    setCreatePlaceError(null);
    setCreatePlaceLoading(true);

    try {
      const created = await apiClient.createPlace({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        isEvent: payload.isEvent,
        eventStartAt: payload.eventStartAt,
        eventEndAt: payload.eventEndAt,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        city: payload.city,
        imageUrls: payload.imageUrls,
      });

      if (payload.files?.length) {
        await apiClient.uploadPlaceImages(created.id, payload.files);
      }

      if (me) {
        await loadAppData(me);
      }
      setCurrentScreen(payload.isEvent ? 'events' : 'main');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Не удалось создать место';
      setCreatePlaceError(message);
    } finally {
      setCreatePlaceLoading(false);
    }
  };

  const handleGenerateRoute = async (latitude?: number, longitude?: number) => {
    setRouteLoading(true);
    try {
      const response = await apiClient.generateRoute({ latitude, longitude, maxPlaces: 5 });
      setRoutePoints(response.points);
      setRouteDurationMinutes(response.estimatedTotalDurationMinutes);
    } finally {
      setRouteLoading(false);
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загружаем приложение...</p>
      </div>
    );
  }

  if (!me) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} loading={authLoading} error={authError} />;
  }

  if (!me.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} loading={onboardingLoading} error={onboardingError} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'main' && (
        <MainScreen
          userProfile={{ name: userProfile.name, interests: userProfile.interests, language: userProfile.language }}
          places={feedPlaces}
          feedLoading={feedLoading}
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
          onReact={handleReactToPlace}
          onOpenComments={handleOpenComments}
          onReloadFeed={handleReloadFeed}
        />
      )}

      {currentScreen === 'route-builder' && (
        <RouteBuilder
          userProfile={{ interests: userProfile.interests, language: userProfile.language }}
          onBack={() => setCurrentScreen('main')}
          routePoints={routePoints}
          estimatedDurationMinutes={routeDurationMinutes}
          isGenerating={routeLoading}
          onGenerateRoute={handleGenerateRoute}
        />
      )}

      {currentScreen === 'events' && (
        <EventsCalendar
          onBack={() => setCurrentScreen('main')}
          events={eventsPlaces}
          onReact={handleReactToPlace}
          onOpenComments={handleOpenComments}
          onNavigateCreateEvent={() => setCurrentScreen('create-event')}
        />
      )}

      {currentScreen === 'market' && (
        <MarketPlace
          onBack={() => setCurrentScreen('main')}
          places={marketPlaces}
          onReact={handleReactToPlace}
          onOpenComments={handleOpenComments}
        />
      )}

      {currentScreen === 'profile' && (
        <UserProfile
          userProfile={userProfile}
          userPlaces={userPlaces}
          onBack={() => setCurrentScreen('main')}
          onLogout={handleLogout}
          onNavigateCreatePlace={() => setCurrentScreen('create-place')}
        />
      )}

      {currentScreen === 'create-place' && (
        <CreatePlaceScreen
          onBack={() => setCurrentScreen('main')}
          onCreatePlace={handleCreatePlace}
          loading={createPlaceLoading}
          error={createPlaceError}
          mode="place"
        />
      )}

      {currentScreen === 'create-event' && (
        <CreatePlaceScreen
          onBack={() => setCurrentScreen('events')}
          onCreatePlace={handleCreatePlace}
          loading={createPlaceLoading}
          error={createPlaceError}
          mode="event"
        />
      )}

      <CommentsDialog
        open={isCommentsOpen}
        placeTitle={selectedCommentsPlace?.title ?? ''}
        comments={comments}
        loading={commentsLoading}
        error={commentsError}
        onOpenChange={setIsCommentsOpen}
        onLoad={loadCommentsForSelectedPlace}
        onSubmit={handleSubmitComment}
      />
    </div>
  );
}
