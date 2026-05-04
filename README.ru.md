# Yandex Metrics Export

[![CI](https://github.com/nicshik/yandex-metrics-export/actions/workflows/ci.yml/badge.svg)](https://github.com/nicshik/yandex-metrics-export/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | [Русский](README.ru.md)

Универсальный веб-интерфейс для выгрузки сырых визитов и хитов из Yandex Metrika Logs API.

## Возможности

- Создание запросов Logs API для визитов и хитов.
- Выбор полей, периода, типа данных и модели атрибуции.
- Просмотр существующих log request для счётчика Метрики.
- Скачивание подготовленных TSV-частей.
- Очистка подготовленных логов для освобождения квоты.
- Встроенная справка по OAuth-токену и ограничениям Logs API.

## Входные данные

Пользователь указывает:

- OAuth-токен Яндекса с правом `metrika:read`;
- ID счётчика Яндекс Метрики, например `12345678`, или ссылку на страницу счётчика из Метрики.

Ссылки на счётчик нормализуются в браузере. Для API-запросов сохраняется и используется только числовой ID счётчика.

## Хранение данных

OAuth-токен и нормализованный ID счётчика хранятся только в браузерном `localStorage` пользователя.

Запросы к Яндекс Метрике отправляются через серверный proxy route `/api/metrika/[...path]`, который передаёт токен в OAuth authorization header.

Токены, ID счётчиков, клиентские URL, выгрузки и аналитические отчёты не коммитятся в репозиторий.

## API Proxy

Proxy route перенаправляет запросы на официальный endpoint API Яндекс Метрики:

```text
https://api-metrika.yandex.net
```

Браузер должен отправлять OAuth-токен в заголовке `x-metrika-token`. Без этого заголовка proxy возвращает `401`.

## Технологии

- Next.js
- React
- TypeScript
- Tailwind CSS
- Yandex Metrika Logs API

## Разработка

Требования:

- Node.js 20.9 или новее.
- npm.

```bash
npm install
npm run dev
```

Локальный dev-сервер по умолчанию запускается на `http://localhost:3000`.

## Production Build

```bash
npm run check
npm run start
```

## Как внести вклад

Issues и pull requests приветствуются. Перед открытием PR запустите:

```bash
npm run check
```

См. [CONTRIBUTING.md](CONTRIBUTING.md) для рабочего процесса проекта и [SECURITY.md](SECURITY.md) для ответственного раскрытия уязвимостей.

## Лицензия

MIT. См. [LICENSE](LICENSE).
