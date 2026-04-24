import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import logo from "figma:asset/df889a880fc154ef65b1c2f4767be0f3c68d552c.png";

interface AuthScreenProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onRegister: (payload: { displayName: string; email: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthScreen({ onLogin, onRegister, loading, error }: AuthScreenProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  return (
    <div className="mobile-container bg-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-primary/10 p-2">
            <img src={logo} alt="ТатарСайт" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl">ТатарСайт</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Вход и регистрация для путешествий по Татарстану</p>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3">
              <Input
                type="email"
                placeholder="Электронная почта"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
              <Button
                className="w-full bg-primary text-white"
                disabled={loading}
                onClick={() => onLogin({ email: loginEmail, password: loginPassword })}
              >
                {loading ? "Выполняем вход..." : "Войти"}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-3">
              <Input
                type="text"
                placeholder="Ваше имя"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
              />
              <Input
                type="email"
                placeholder="Электронная почта"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
              />
              <Input
                type="password"
                placeholder="Пароль (минимум 8 символов)"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
              />
              <Button
                className="w-full bg-primary text-white"
                disabled={loading}
                onClick={() =>
                  onRegister({
                    displayName: registerName,
                    email: registerEmail,
                    password: registerPassword,
                  })
                }
              >
                {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
              </Button>
            </TabsContent>
          </Tabs>

          {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
