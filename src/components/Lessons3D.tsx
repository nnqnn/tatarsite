import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Interactive3DCanvas from './Interactive3DCanvas';

interface Lesson {
  id: number;
  title: string;
  description: string;
  task: string;
  shape: string;
  difficulty: 'Начальный' | 'Средний' | 'Продвинутый';
  completed: boolean;
}

const Lessons3D: React.FC = () => {
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: 1,
      title: "Знакомство с кубом",
      description: "Изучите базовую 3D-фигуру — куб. Попробуйте повернуть его мышью.",
      task: "Поверните куб так, чтобы увидеть все его грани",
      shape: "cube",
      difficulty: "Начальный",
      completed: false
    },
    {
      id: 2,
      title: "Пирамида",
      description: "Изучите пирамиду — фигуру с треугольными гранями.",
      task: "Рассмотрите, как соединяются рёбра пирамиды",
      shape: "pyramid",
      difficulty: "Начальный",
      completed: false
    },
    {
      id: 3,
      title: "Плоская фигура",
      description: "Увидите, как выглядит плоская фигура в 3D-пространстве.",
      task: "Поверните квадрат так, чтобы он стал линией",
      shape: "square",
      difficulty: "Средний",
      completed: false
    }
  ]);

  const completeLesson = (lessonId: number) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId ? { ...lesson, completed: true } : lesson
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Начальный': return 'bg-green-100 text-green-800';
      case 'Средний': return 'bg-yellow-100 text-yellow-800';
      case 'Продвинутый': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2>Интерактивные уроки</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список уроков */}
        <div className="space-y-4">
          <h3>Уроки</h3>
          {lessons.map((lesson, index) => (
            <Card 
              key={lesson.id} 
              className={`cursor-pointer transition-colors ${
                currentLesson === index ? 'border-primary' : ''
              } ${lesson.completed ? 'bg-green-50' : ''}`}
              onClick={() => setCurrentLesson(index)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{lesson.title}</CardTitle>
                  {lesson.completed && <Badge variant="secondary">✓</Badge>}
                </div>
                <Badge className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Текущий урок */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{lessons[currentLesson].title}</CardTitle>
              <p className="text-muted-foreground">{lessons[currentLesson].description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Задание:</h4>
                <p>{lessons[currentLesson].task}</p>
              </div>
              
              <div className="flex justify-center">
                <Interactive3DCanvas shape={lessons[currentLesson].shape} />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => completeLesson(lessons[currentLesson].id)}
                  disabled={lessons[currentLesson].completed}
                >
                  {lessons[currentLesson].completed ? 'Урок завершён' : 'Завершить урок'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Lessons3D;