import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import Interactive3DCanvas from './Interactive3DCanvas';

const Playground3D: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<string>('cube');
  const [animationSpeed, setAnimationSpeed] = useState<number[]>([1]);
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);

  const shapes = [
    { value: 'cube', label: 'Куб' },
    { value: 'pyramid', label: 'Пирамида' },
    { value: 'square', label: 'Квадрат' }
  ];

  const tips = [
    "Зажмите левую кнопку мыши и перетаскивайте для вращения объекта",
    "Попробуйте разные фигуры, чтобы понять их структуру",
    "Обратите внимание, как меняется перспектива при вращении",
    "Красные точки — это вершины фигуры",
    "Синие линии — это рёбра, соединяющие вершины"
  ];

  return (
    <div className="space-y-6">
      <h2>Песочница для экспериментов</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Панель управления */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">Выберите фигуру:</label>
                <Select value={selectedShape} onValueChange={setSelectedShape}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shapes.map(shape => (
                      <SelectItem key={shape.value} value={shape.value}>
                        {shape.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block mb-2">Скорость анимации:</label>
                <Slider
                  value={animationSpeed}
                  onValueChange={setAnimationSpeed}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {animationSpeed[0]}x
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setWireframeMode(!wireframeMode)}
                className="w-full"
              >
                {wireframeMode ? 'Каркасный режим' : 'Сплошной режим'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Подсказки</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 3D-канвас */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3D-Визуализация</CardTitle>
              <p className="text-muted-foreground">
                Перетаскивайте мышью для поворота объекта
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Interactive3DCanvas shape={selectedShape} />
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Информация о фигуре</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Тип фигуры:</span>
                  <p className="text-muted-foreground">
                    {shapes.find(s => s.value === selectedShape)?.label}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Количество вершин:</span>
                  <p className="text-muted-foreground">
                    {selectedShape === 'cube' ? '8' : 
                     selectedShape === 'pyramid' ? '5' : '4'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Количество рёбер:</span>
                  <p className="text-muted-foreground">
                    {selectedShape === 'cube' ? '12' : 
                     selectedShape === 'pyramid' ? '8' : '4'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Количество граней:</span>
                  <p className="text-muted-foreground">
                    {selectedShape === 'cube' ? '6' : 
                     selectedShape === 'pyramid' ? '5' : '1'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Playground3D;