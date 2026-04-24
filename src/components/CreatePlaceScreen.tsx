import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { InterestCategory } from "@/lib/api/types";

interface CreatePlaceScreenProps {
  onBack: () => void;
  onCreatePlace: (payload: {
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
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  mode?: "place" | "event";
  fixedCategory?: InterestCategory;
}

const categoryOptions: Array<{ value: InterestCategory; label: string }> = [
  { value: "culture", label: "Культура" },
  { value: "food", label: "Еда" },
  { value: "nature", label: "Природа" },
  { value: "events", label: "События" },
  { value: "crafts", label: "Ремёсла" },
  { value: "history", label: "История" },
  { value: "hidden", label: "Скрытые места" },
  { value: "festivals", label: "Фестивали" },
  { value: "market", label: "Маркет" },
];

export default function CreatePlaceScreen({
  onBack,
  onCreatePlace,
  loading,
  error,
  mode = "place",
  fixedCategory,
}: CreatePlaceScreenProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<InterestCategory>(fixedCategory ?? (mode === "event" ? "events" : "culture"));
  const [latitude, setLatitude] = useState("55.7963");
  const [longitude, setLongitude] = useState("49.1088");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Казань");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [eventStartLocal, setEventStartLocal] = useState("");
  const [eventEndLocal, setEventEndLocal] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const availableCategoryOptions = useMemo(
    () => (mode === "event" ? categoryOptions : categoryOptions.filter((item) => item.value !== "events")),
    [mode],
  );

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const parseCoordinate = (value: string) => {
    const normalized = value.trim().replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const submit = async () => {
    setFormError(null);
    const isEventMode = mode === "event";

    if (title.trim().length < 3) {
      setFormError("Введите название не короче 3 символов.");
      return;
    }

    if (description.trim().length < 10) {
      setFormError("Введите описание не короче 10 символов.");
      return;
    }

    const parsedLatitude = parseCoordinate(latitude);
    const parsedLongitude = parseCoordinate(longitude);

    if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
      setFormError("Проверьте широту: значение должно быть от -90 до 90.");
      return;
    }

    if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
      setFormError("Проверьте долготу: значение должно быть от -180 до 180.");
      return;
    }

    let eventStartIso: string | undefined;
    let eventEndIso: string | undefined;
    if (isEventMode) {
      if (!eventStartLocal) {
        setFormError("Для события нужно указать дату и время начала.");
        return;
      }

      const startDate = new Date(eventStartLocal);
      if (Number.isNaN(startDate.getTime())) {
        setFormError("Некорректная дата/время начала события.");
        return;
      }
      eventStartIso = startDate.toISOString();

      if (eventEndLocal) {
        const endDate = new Date(eventEndLocal);
        if (Number.isNaN(endDate.getTime())) {
          setFormError("Некорректная дата/время окончания события.");
          return;
        }

        if (endDate < startDate) {
          setFormError("Время окончания не может быть раньше времени начала.");
          return;
        }
        eventEndIso = endDate.toISOString();
      }
    }

    const finalCategory = fixedCategory ?? category;
    await onCreatePlace({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      isEvent: isEventMode,
      eventStartAt: eventStartIso,
      eventEndAt: eventEndIso,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      imageUrls: imageUrls
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => (item.startsWith("http://") || item.startsWith("https://") ? item : `https://${item}`)),
      files,
    });
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">{mode === "event" ? "Создать событие" : "Добавить место"}</h1>
          <p className="text-xs text-white/70">
            {mode === "event" ? "Публикация для раздела событий" : "Публикация для ленты мест"}
          </p>
        </div>
        <div className="w-9" />
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Название места" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Textarea
              placeholder="Описание места"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Минимум 10 символов. Можно писать подробно, как в Instagram-посте.</p>

            {fixedCategory ? (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                Категория: {categoryOptions.find((item) => item.value === fixedCategory)?.label ?? "События"}
              </div>
            ) : (
              <Select value={category} onValueChange={(value: InterestCategory) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Локация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Город" value={city} onChange={(event) => setCity(event.target.value)} />
            <Input placeholder="Адрес" value={address} onChange={(event) => setAddress(event.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Широта"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                type="text"
                inputMode="decimal"
              />
              <Input
                placeholder="Долгота"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                type="text"
                inputMode="decimal"
              />
            </div>
            <p className="text-xs text-muted-foreground">Можно вводить через точку или запятую (например, 55,7963).</p>
          </CardContent>
        </Card>

        {mode === "event" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Дата и время события</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Начало события</label>
                <Input
                  type="datetime-local"
                  value={eventStartLocal}
                  onChange={(event) => setEventStartLocal(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Окончание (необязательно)</label>
                <Input
                  type="datetime-local"
                  value={eventEndLocal}
                  onChange={(event) => setEventEndLocal(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ссылки на изображения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {imageUrls.map((url, index) => (
              <div key={`${index}-${url}`} className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(event) => updateImageUrl(index, event.target.value)}
                />
                {imageUrls.length > 1 ? (
                  <Button type="button" variant="outline" onClick={() => removeImageUrl(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full" onClick={addImageUrl}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить ссылку на изображение
            </Button>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Или загрузите файлы (jpg/png/webp, до 10 файлов)
              </p>
              <Input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []);
                  setFiles(selected.slice(0, 10));
                }}
              />
              {files.length > 0 ? (
                <p className="text-xs text-muted-foreground">Выбрано файлов: {files.length}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full bg-primary text-white" disabled={loading} onClick={submit}>
          {loading ? "Публикуем..." : mode === "event" ? "Опубликовать событие" : "Опубликовать место"}
        </Button>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
