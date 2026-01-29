import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const Theory3D: React.FC = () => {
  const concepts = [
    {
      title: "Координатная система",
      content: "В 3D-графике используется трёхмерная система координат (X, Y, Z). X — горизонталь, Y — вертикаль, Z — глубина.",
      example: "Точка (1, 2, 3) находится на 1 единицу вправо, 2 вверх и 3 вперёд от центра."
    },
    {
      title: "Перспектива",
      content: "Объекты, расположенные дальше от наблюдателя, кажутся меньше. Это создаёт иллюзию глубины.",
      example: "Формула проекции: x2d = x3d * distance / (distance + z3d)"
    },
    {
      title: "Вращения",
      content: "Объекты можно вращать вокруг осей X, Y, Z используя тригонометрические функции и матрицы.",
      example: "Поворот вокруг Y: x' = x*cos(θ) + z*sin(θ), z' = -x*sin(θ) + z*cos(θ)"
    },
    {
      title: "Освещение",
      content: "Освещение создаёт реалистичность. Зависит от угла между нормалью поверхности и направлением света.",
      example: "Интенсивность = cos(угол между нормалью и светом)"
    }
  ];

  return (
    <div className="space-y-4">
      <h2>Основы 3D-графики</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{concept.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">{concept.content}</p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Пример: {concept.example}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Theory3D;