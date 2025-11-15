# Дерево файлов проекта

```
nuxt-app/
├── app/
│   ├── app.vue
│   ├── middleware/
│   │   └── trace.global.ts
│   ├── pages/
│   │   ├── delayed.vue
│   │   ├── index.vue
│   │   └── spa/
│   │       └── demo.vue
│   └── plugins/
│       ├── app.client.ts
│       └── app.server.ts
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── server/
│   ├── api/
│   │   ├── site/
│   │   │   └── settings.ts
│   │   └── slow.ts
│   └── middleware/
│       └── log.ts
├── .git/
├── .nuxt/
├── node_modules/
├── nuxt.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Описание структуры

### `/app` - Клиентская часть приложения
- `app.vue` - Корневой компонент приложения
- `middleware/` - Клиентские middleware
  - `trace.global.ts` - Глобальный middleware для трассировки
- `pages/` - Страницы приложения (автоматическая маршрутизация)
  - `index.vue` - Главная страница
  - `delayed.vue` - Страница с задержкой
  - `spa/` - SPA-островок (CSR режим)
    - `demo.vue` - Демо-страница SPA
- `plugins/` - Плагины Nuxt
  - `app.client.ts` - Клиентский плагин (хуки жизненного цикла)
  - `app.server.ts` - Серверный плагин

### `/public` - Статические файлы
- `favicon.ico` - Иконка сайта
- `robots.txt` - Файл для поисковых роботов

### `/server` - Серверная часть
- `api/` - API endpoints
  - `site/settings.ts` - Настройки сайта
  - `slow.ts` - Медленный endpoint (для тестирования)
- `middleware/` - Серверные middleware
  - `log.ts` - Middleware для логирования

### Корневые файлы
- `nuxt.config.ts` - Конфигурация Nuxt
- `package.json` - Зависимости и скрипты проекта
- `package-lock.json` - Зафиксированные версии зависимостей
- `tsconfig.json` - Конфигурация TypeScript
- `README.md` - Документация проекта

### Служебные директории (не включены в дерево)
- `.git/` - Git репозиторий
- `.nuxt/` - Сгенерированные файлы Nuxt
- `node_modules/` - Установленные зависимости

