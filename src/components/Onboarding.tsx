import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Globe, ChevronRight, Check } from 'lucide-react';
import logo from 'figma:asset/df889a880fc154ef65b1c2f4767be0f3c68d552c.png';

interface OnboardingProps {
  onComplete: (data: { interests: string[]; language: string }) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ru');
  const [locationEnabled, setLocationEnabled] = useState(false);

  const interests = [
    { id: 'nature', label: 'Природа', emoji: '🌲' },
    { id: 'culture', label: 'Культура', emoji: '🏛️' },
    { id: 'food', label: 'Еда', emoji: '🍯' },
    { id: 'events', label: 'События', emoji: '🎭' },
    { id: 'hidden', label: 'Скрытые места', emoji: '💎' },
    { id: 'history', label: 'История', emoji: '📚' },
    { id: 'crafts', label: 'Ремёсла', emoji: '🎨' },
    { id: 'festivals', label: 'Фестивали', emoji: '🎪' }
  ];

  const languages = [
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
    { id: 'tt', label: 'Татарский', flag: '🏛️' },
    { id: 'en', label: 'English', flag: '🇺🇸' }
  ];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false)
      );
    }
  };

  const handleComplete = () => {
    onComplete({
      interests: selectedInterests,
      language: selectedLanguage
    });
  };

  return (
    <div className="mobile-container bg-primary text-white min-h-screen">
      {/* Заголовок */}
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white p-2">
          <img src={logo} alt="ТатарСайт" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold mb-2">ТатарСайт</h1>
        <p className="text-white/80">Открой Татарстан с AI-гидом</p>
      </div>

      {/* Прогресс */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Шаг {step} из 3</span>
          <span className="text-sm text-white/60">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Контент */}
      <div className="px-6 flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Что вас интересует?</h2>
              <p className="text-white/70">Выберите несколько вариантов для персональных рекомендаций</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {interests.map(interest => (
                <Card 
                  key={interest.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedInterests.includes(interest.id)
                      ? 'bg-white border-white' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{interest.emoji}</div>
                    <div className={`text-sm font-medium ${
                      selectedInterests.includes(interest.id) ? 'text-primary' : 'text-current'
                    }`}>
                      {interest.label}
                    </div>
                    {selectedInterests.includes(interest.id) && (
                      <Check className="w-4 h-4 text-primary mt-2 mx-auto" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Выберите язык</h2>
              <p className="text-white/70">На каком языке будем путешествовать?</p>
            </div>
            
            <div className="space-y-3">
              {languages.map(language => (
                <Card 
                  key={language.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedLanguage === language.id
                      ? 'bg-white border-white' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                  onClick={() => setSelectedLanguage(language.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{language.flag}</span>
                      <span className={`font-medium ${
                        selectedLanguage === language.id ? 'text-primary' : 'text-current'
                      }`}>
                        {language.label}
                      </span>
                    </div>
                    {selectedLanguage === language.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Разрешить геолокацию?</h2>
              <p className="text-white/70">Для персональных маршрутов и рекомендаций поблизости</p>
            </div>
            
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white">
                    <h4 className="font-medium mb-1">Что это даёт?</h4>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• Маршруты от вашего местоположения</li>
                      <li>• События и места поблизости</li>
                      <li>• Точная навигация до достопримечательностей</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={handleLocationRequest}
                className="w-full bg-white text-primary hover:bg-white/90"
                size="lg"
              >
                Разрешить геолокацию
              </Button>
              <Button 
                onClick={() => setLocationEnabled(true)}
                variant="outline" 
                className="w-full border-white/30 text-white hover:bg-white/10"
                size="lg"
              >
                Пропустить
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Кнопки навигации */}
      <div className="p-6 space-y-3">
        {step < 3 ? (
          <Button 
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && selectedInterests.length === 0}
            className="w-full bg-white text-primary hover:bg-white/90"
            size="lg"
          >
            Продолжить
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete}
            className="w-full bg-white text-primary hover:bg-white/90"
            size="lg"
          >
            Начать путешествие
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        {step > 1 && (
          <Button 
            onClick={() => setStep(step - 1)}
            variant="ghost" 
            className="w-full text-white hover:bg-white/10"
          >
            Назад
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;