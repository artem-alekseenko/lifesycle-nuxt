# Nuxt 4: Детальный разбор жизненного цикла приложения

Этот документ содержит подробные примеры кода и объяснения для каждого этапа жизненного цикла Nuxt 4 приложения.

---

## 0. Подключение Nuxt модулей (Build Time)

**Слой:** Nuxt Kit (build time)  
**Файл:** `nuxt.config.ts` или модули в `modules/`  
**Когда:** на этапе сборки приложения, **ДО** запуска жизненного цикла приложения (до S1).

### Пример реализации модуля

```typescript
// modules/my-custom-module.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'my-custom-module',
    configKey: 'myModule'
  },
  
  defaults: {
    apiKey: '',
    enabled: true
  },
  
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    
    // ЛЁГКИЕ ВЕЩИ — делаем прямо в setup()
    // Изменение конфигурации Nuxt
    nuxt.options.runtimeConfig.public.myModule = {
      apiKey: options.apiKey
    }
    
    // Добавление серверных утилит
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.experimental = nitroConfig.experimental || {}
      nitroConfig.experimental.wasm = true
    })
    
    // Хук modules:done - когда все модули установлены
    nuxt.hook('modules:done', () => {
      console.log('Все модули установлены')
    })
    
    // Хук ready - инстанс Nuxt во время сборки/старта
    // ⚠️ ВАЖНО: блокирует старт/сборку до завершения!
    // Хорошее место для финального редактирования конфига и добавления плагинов
    nuxt.hook('ready', async (nuxt) => {
      // ТЯЖЁЛЫЕ ВЕЩИ (I/O) — делаем аккуратно здесь, чтобы не тормозить
      // Например, чтение файлов, запросы к API и т.п.
      const configData = await loadModuleConfig(options.configPath)
      
      // Финальное редактирование конфигурации
      nuxt.options.runtimeConfig.public.myModule.config = configData
      
      // Добавление плагинов (всё, что должно жить на запросах/в браузере)
      if (options.enabled) {
        addPlugin({
          src: resolver.resolve('./runtime/plugin'),
          mode: 'client'
        })
        
        // Runtime-плагины для сервера
        addPlugin({
          src: resolver.resolve('./runtime/server-plugin'),
          mode: 'server'
        })
      }
    })
    
    // Хук build:done - после завершения сборки
    // В dev — после первичной сборки; не триггерится на каждый HMR
    nuxt.hook('build:done', () => {
      console.log('Сборка завершена')
      // Можно делать пост-обработку собранных файлов
    })
    
    // Хук close - при остановке процесса Nuxt (dev-сервер, build-процесс)
    // Удобно для очистки временных файлов/соединений
    nuxt.hook('close', async () => {
      console.log('Процесс завершается, очистка ресурсов')
      // Очистка временных файлов
      await cleanupTempFiles()
      // Закрытие соединений
      await closeConnections()
    })
  }
})
```

### Использование в nuxt.config.ts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '~/modules/my-custom-module'
  ],
  
  // Конфигурация модуля
  myModule: {
    apiKey: process.env.MY_API_KEY,
    enabled: true
  },
  
  // Хуки на уровне конфигурации
  hooks: {
    'modules:done': () => {
      console.log('Все модули установлены из конфига')
    },
    'ready': (nuxt) => {
      console.log('Nuxt готов из конфига')
    },
    'build:done': () => {
      console.log('Сборка завершена из конфига')
    },
    'close': () => {
      console.log('Процесс завершается из конфига')
    }
  }
})
```

### Ключевые хуки для модулей

- **`modules:done`** — срабатывает после того, как все модули из массива `modules` в `nuxt.config.ts` были установлены. Это момент, когда все модули выполнили свою функцию `setup()`.

- **`ready`** — хук инстанса Nuxt во время сборки/старта (не рантайм при запросе!). **Важно:** блокирует старт/сборку до завершения. Хорошее место для:
  - финального редактирования конфигурации
  - добавления плагинов
  - выполнения тяжёлых операций (I/O), которые нужно сделать аккуратно, чтобы не тормозить

- **`build:done`** — вызывается после завершения сборки. В dev-режиме — после первичной сборки; **не триггерится на каждый HMR**.

- **`close`** — при остановке процесса Nuxt (dev-сервер, build-процесс). Удобно для очистки временных файлов/соединений.

### Важные детали и рекомендации

- Модули выполняются **синхронно** в порядке их объявления в массиве `modules`
- Модули имеют доступ к объекту `nuxt` и могут изменять конфигурацию через `nuxt.options`
- Модули могут добавлять плагины, компоненты, composables, middleware и другие ресурсы
- Хуки модулей выполняются **до** жизненного цикла приложения (до S1)
- Модули могут подписываться на хуки сборки через `nuxt.hook()`

**Рекомендации по организации кода в модуле:**

- **Лёгкие вещи** — делайте прямо в `setup()`:
  - Изменение конфигурации
  - Регистрация хуков
  - Добавление простых ресурсов

- **Тяжёлые операции (I/O)** — откладывайте или делайте аккуратно в `ready`:
  - Чтение файлов
  - Запросы к API
  - Инициализация внешних сервисов
  - ⚠️ Помните: `ready` блокирует старт/сборку до завершения!

- **Всё, что должно жить на запросах/в браузере** — выносите в runtime-плагины/handlers:
  - Логика, выполняемая при каждом запросе
  - Инициализация клиентских библиотек
  - Серверные обработчики запросов
  - Модуль добавляет эти плагины через `addPlugin()`

### Порядок выполнения модулей

```
1. Чтение nuxt.config.ts
2. Установка модулей (в порядке объявления)
   → modules:done
3. Подготовка конфигурации
   → ready
4. Сборка приложения (если production)
   → build:done
5. Запуск жизненного цикла приложения (S1 → S5 → C1 → ...)
6. Завершение процесса
   → close
```

---

## 1. Серверный middleware (S1: Nitro/H3)

**Слой:** Nitro/H3 (сервер)  
**Файл:** `server/middleware/security.ts`  
**Когда:** на каждый HTTP-запрос; выполняется перед API-роутами и SSR.

### Пример реализации

```typescript
// server/middleware/security.ts

export default defineEventHandler((event) => {
  // Комплексная защита и препроцессинг
  const requestStart = Date.now()
  const ip = getRequestIP(event)
  const method = getMethod(event)

  // Расширенные проверки безопасности
  if (isRateLimited(ip, method)) {
    throw createError({
      statusCode: 429,
      message: 'Too Many Requests'
    })
  }

  // Обогащение контекста запроса
  event.context.security = {
    ip,
    timestamp: requestStart,
    traceId: generateTraceId()
  }

  // CORS и безопасность
  if (process.env.NODE_ENV === 'development') {
      setHeader(event, 'Access-Control-Allow-Origin', '*')
  }
    
  // Опциональная CSRF-защита
  if (method === 'POST') {
      validateCSRFToken(event)
  }

  // Логирование входящего запроса
  logger.info(`[${method}] ${event.path} from ${ip}`, {
    traceId: event.context.security.traceId
  })
})

// Утилиты безопасности
function isRateLimited(ip: string, method: string): boolean {
  const requestCount = getRateLimitCounter(ip, method)
  return requestCount > MAX_REQUESTS_PER_MINUTE
}

function generateTraceId(): string {
  return crypto.randomUUID()
}
```

### Ключевые задачи

- **Первичная фильтрация запросов** — проверка валидности и безопасности запроса до обработки
- **Защита от атак** — rate limiting, проверка CSRF токенов, валидация заголовков
- **Логирование и трассировка** — создание trace ID для отслеживания запроса через всю систему
- **Обогащение контекста запроса** — добавление метаданных (IP, timestamp, traceId) в `event.context` для использования в последующих этапах

### Важные детали

- Можно вернуть `H3Event` или использовать `send()`/`throwError()` для отправки ответа или ошибки
- Middleware выполняются последовательно, порядок важен
- Типичные случаи использования: защита от CSRF, логирование запросов с учетом приватности (маскирование данных)

---

## 2. Серверная инициализация приложения (S2)

**Слой:** Nuxt (сервер)  
**Файл:** `app/plugins/server-init.ts`  
**Когда:** на каждый SSR-запрос; после инициализации Nuxt-приложения, в конце этапа вызывается хук `app:created`.

### Пример реализации

```typescript
// app/plugins/server-init.ts

export default defineNuxtPlugin(async (nuxtApp) => {
  // Инициализация серверных сервисов
  const serverConfig = useRuntimeConfig()
  
  // Создание изолированных сервисов для каждого запроса
  const appContext = {
    db: createDatabaseConnection(serverConfig.database),
    cache: new ServerCache(),
    auth: new AuthenticationService(serverConfig.auth)
  }

  // Внедрение зависимостей в контекст приложения
  nuxtApp.provide('serverContext', appContext)

  // Хук жизненного цикла
  nuxtApp.hook('app:created', () => {
    // Дополнительная настройка после создания приложения
    initializeGlobalMiddlewares(appContext)
  })
})

// Пример сервиса аутентификации
class AuthenticationService {
  constructor(private config: AuthConfig) {}

  async validateToken(token: string) {
    // Проверка токена через внешний сервис
    return this.config.provider.verify(token)
  }
}
```

### Ключевые возможности

- **Создание изолированного контекста для запроса** — каждый запрос получает свой экземпляр сервисов
- **Инициализация серверных сервисов** — подключение к БД, кэш, внешние API
- **Внедрение зависимостей** — использование `nuxtApp.provide()` для создания глобально доступных инъекций
- **Настройка глобальных middleware** — инициализация общих компонентов системы

### Важные детали

- На сервере каждый запрос получает новый экземпляр приложения Nuxt, поэтому DI обеспечивает изоляцию данных между запросами
- Рассмотрите использование `@nuxtjs/` сторонних библиотек для централизованного управления состоянием и DI на сервере
- Доступ к текущему H3-запросу через `useRequestEvent()` (IP, куки, заголовки)

---

## 3. Route Middleware (S3)

**Слой:** Nuxt (сервер)  
**Файл:** `app/middleware/trace.global.ts`  
**Когда:** перед первым SSR-рендером конкретной страницы. (Ещё раз будет в браузере — см. C2.)

### Пример реализации

```typescript
// app/middleware/trace.global.ts

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Расширенная логика маршрутизации
  const nuxtApp = useNuxtApp()
  const auth = nuxtApp.$serverContext.auth

  // Проверка прав доступа
  if (to.meta.requiresAuth) {
    const token = getCookie(useRequestEvent(), 'auth_token')
    
    try {
      const user = await auth.validateToken(token)
      
      // Обогащение роута данными пользователя
      to.meta.user = user

      // Проверка ролей
      if (!hasRequiredPermissions(user, to.meta.permissions)) {
        return navigateTo('/forbidden')
      }
    } catch (error) {
      // Редирект на страницу входа
      return navigateTo('/login', { 
        query: { redirect: to.fullPath } 
      })
    }
  }

  // Логирование навигации
  trackRouteNavigation(to, from)
})

// Утилита проверки прав
function hasRequiredPermissions(user, requiredPermissions) {
  return requiredPermissions.every(perm => 
    user.permissions.includes(perm)
  )
}
```

### Функционал

- **Проверка прав доступа** — валидация токенов, проверка ролей и разрешений
- **Динамическая маршрутизация** — изменение маршрута на основе состояния пользователя
- **Логирование переходов** — отслеживание навигации для аналитики
- **Безопасные редиректы** — использование `navigateTo()` для создания редиректов (301/302)

### Важные детали

- Функция `navigateTo()` создает редирект. Важно понимать разницу между 301 (постоянный редирект, кэшируется браузером) и 302 (временный редирект)
- В глобальных middleware можно реализовать сложную логику авторизации, например, проверку JWT и установку пользователя в контекст
- Неправильный выбор типа редиректа может повлиять на SEO и производительность

---

## 4. Серверный Setup корневого компонента (S4)

**Слой:** Nuxt/Vue (сервер)  
**Файл:** `app/app.vue`  
**Когда:** в начале SSR-рендера дерева компонентов (после S3).

### Пример реализации

```typescript
// app/app.vue

export default defineComponent({
  setup() {
    // Серверная подготовка глобальных провайдеров
    const nuxtApp = useNuxtApp()
    const config = useRuntimeConfig()

    // Провайд глобальных значений
    provide('appConfig', {
      version: config.version,
      environment: config.environment
    })

    // Выбор layout динамически
    const layout = computed(() => {
      const route = useRoute()
      return route.meta.layout || 'default'
    })

    // Метаданные приложения
    useHead({
      title: 'My Nuxt App',
      meta: [
        { name: 'description', content: 'Powerful Nuxt Application' }
      ]
    })

    return { layout }
  }
})
```

### Особенности

- **Динамический выбор layout** — определение layout с помощью `<NuxtLayout>` или `useLayout()`. Layout оборачивает содержимое страницы и позволяет определить структуру сайта
- **Провайд глобальных значений** — использование `provide()` для передачи данных во всё дерево компонентов
- **Настройка метаданных** — использование `useHead()` для динамического управления мета-тегами страницы (title, description и т.д.)
- **Серверная подготовка состояния** — инициализация глобального состояния приложения без доступа к DOM

### Важные детали

- На сервере не вызываются lifecycle-хуки (`onMounted`/`onBeforeMount`)
- Типичная ошибка — попытка обратиться к `window`/`document` на сервере
- Здесь можно использовать `useHead()` для динамического управления мета-тегами страницы

---

## 5. Setup страницы (S5)

**Слой:** Nuxt/Vue (сервер)  
**Файл:** `app/pages/index.vue`  
**Когда:** после S4; здесь же выполняются асинхронные загрузки данных.

### Пример реализации

```typescript
// app/pages/index.vue

export default defineComponent({
  async setup() {
    // Серверная загрузка данных
    const { data, pending, error } = await useAsyncData('page-data', async () => {
      const result = await $fetch('/api/initial-data', {
        method: 'GET',
        // Параметры запроса
        params: {
          timestamp: Date.now()
        }
      })

      // Трансформация данных
      return transformServerData(result)
    }, {
      // Настройки кэширования
      lazy: false,
      server: true,
      
      // Обработка ошибок
      onError: (err) => {
        console.error('Data fetch error', err)
        // Fallback механизм
        return { default: [] }
      }
    })

    return {
      data,
      pending,
      error
    }
  }
})
```

### Ключевые аспекты

- **Серверная загрузка данных** — использование `useAsyncData`/`useFetch` для получения данных на сервере
- **Трансформация ответа** — использование `transform` опции в `useAsyncData` для оптимизации данных перед сериализацией
- **Обработка ошибок** — реализация fallback механизмов при ошибках загрузки данных
- **Настройка кэширования** — управление кэшированием данных для оптимизации производительности

### Важные детали

- Результат `useAsyncData` и `useFetch` сериализуется в `window.__NUXT__` (payload) и встраивается в HTML как `<script>` тег
- Это позволяет избежать повторных запросов при гидратации
- Рассмотрите возможность использования `transform` опции в `useAsyncData` для оптимизации данных перед сериализацией
- В SSR возможен `onServerPrefetch`, но он обычно скрыт внутри `useAsyncData`/`useFetch`

---

## Порядок выполнения серверных этапов

```
S1 (Nitro Middleware) 
  → S2 (Server Plugin) 
  → S3 (Route Middleware) 
  → S4 (App.vue Setup) 
  → S5 (Page Setup) 
  → [HTML отправлен в браузер]
```

Каждый этап выполняет свою роль в подготовке и рендеринге страницы на сервере, обеспечивая безопасность, производительность и правильную структуру данных для клиента.

---

# Nuxt 4: Клиентский жизненный цикл

После того, как HTML отправлен с сервера, начинается клиентская часть жизненного цикла, которая отвечает за гидратацию, интерактивность и динамическое поведение приложения.

---

## 1. Клиентский плагин (C1)

**Слой:** Nuxt (клиент)  
**Файл:** `plugins/app.client.ts`  
**Когда:** один раз при загрузке приложения в браузере; `app:created` — в конце этого этапа.

### Пример реализации

```typescript
// plugins/app.client.ts

export default defineNuxtPlugin((nuxtApp) => {
  // Расширенная клиентская инициализация
  const clientTracker = {
    // Аналитика производительности
    performanceMarks: new Map(),
    
    // Трекинг навигации
    trackNavigation(route) {
      // Замер времени навигации
      this.performanceMarks.set('navigationStart', performance.now())
      
      // Отправка в аналитику
      analyticsService.trackPageView({
        route: route.path,
        timestamp: Date.now()
      })
    },

    // Замер производительности
    measurePerformance() {
      const navigationEnd = performance.now()
      const navigationStart = this.performanceMarks.get('navigationStart')
      
      const duration = navigationEnd - navigationStart
      
      // Отправка метрик
      performanceMonitoring.send({
        type: 'navigation',
        duration,
        route: nuxtApp.$route.path
      })
    }
  }

  // Подписка на системные хуки Nuxt
  nuxtApp.hook('page:start', (route) => {
    clientTracker.trackNavigation(route)
  })

  nuxtApp.hook('page:finish', () => {
    clientTracker.measurePerformance()
  })

  // Инициализация глобальных клиентских сервисов
  const clientServices = {
    // Менеджер уведомлений
    notificationManager: new NotificationManager(),
    
    // Сервис событий
    eventBus: new EventBus(),
    
    // Менеджер модальных окон
    modalManager: new ModalManager()
  }

  // Внедрение сервисов в приложение
  nuxtApp.provide('clientServices', clientServices)

  // Глобальная обработка необработанных ошибок
  window.addEventListener('unhandledrejection', (event) => {
    clientServices.notificationManager.showError({
      message: 'Unexpected error occurred',
      details: event.reason
    })

    // Логирование критических ошибок
    errorLoggingService.capture(event.reason)
  })

  // Возвращаем инстанс для дополнительных манипуляций
  return {
    provide: {
      clientTracker,
      clientServices
    }
  }
})

// Сервис уведомлений
class NotificationManager {
  private notifications: Array<Notification> = []

  showError(config) {
    const notification = {
      type: 'error',
      ...config
    }
    
    this.notifications.push(notification)
    this.render()
  }

  private render() {
    // Логика рендера уведомлений
  }
}
```

### Ключевые функции

- **Трекинг производительности** — отслеживание времени навигации и метрик производительности
- **Глобальная обработка ошибок** — перехват необработанных ошибок и promise rejections
- **Инициализация клиентских сервисов** — создание менеджеров уведомлений, событий, модальных окон
- **Подписка на системные хуки** — использование `nuxtApp.hook()` для перехвата и изменения поведения Nuxt на разных этапах

### Важные детали

- Плагины выполняются в порядке их объявления в `nuxt.config.ts` или алфавитном порядке файлов в директории `plugins/`
- Пример использования: инициализация service worker, настройка клиентского хранилища (localStorage, sessionStorage)
- Подписка на хуки жизненного цикла Nuxt позволяет перехватывать и изменять поведение Nuxt на разных этапах

---

## 2. Клиентское Route Middleware (C2)

**Слой:** Nuxt (клиент)  
**Файл:** `middleware/client-route.global.ts`  
**Когда:** перед первичной клиентской инициализацией маршрута и перед каждой дальнейшей навигацией. (На сервере уже было — см. S3.)

### Пример реализации

```typescript
// middleware/client-route.global.ts

export default defineNuxtRouteMiddleware((to, from) => {
  // Расширенная клиентская маршрутизация
  const nuxtApp = useNuxtApp()
  const clientServices = nuxtApp.$clientServices
  const userStore = useUserStore()

  // Динамический контроль доступа
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // Сохранение intended-роута
    clientServices.eventBus.emit('redirect:login', {
      intendedRoute: to.fullPath
    })

    return navigateTo('/login')
  }

  // Динамическая предзагрузка
  if (to.meta.prefetch) {
    prefetchPageData(to)
  }

  // Аналитика переходов
  clientServices.trackNavigation({
    from: from.path,
    to: to.path,
    timestamp: Date.now()
  })

  // Опциональные трансформации роута
  if (to.meta.redirectTo) {
    return navigateTo(to.meta.redirectTo)
  }
})

// Функция предзагрузки
async function prefetchPageData(route) {
  try {
    // Опциональная предзагрузка данных
    await fetchPageResources(route.path)
  } catch (error) {
    console.warn('Prefetch failed', error)
  }
}
```

### Возможности

- **Динамический контроль доступа** — проверка аутентификации и прав доступа на клиенте
- **Предзагрузка ресурсов** — оптимизация навигации через предварительную загрузку данных
- **Трекинг навигации** — реализация клиентской аналитики (отправка событий в Google Analytics, Yandex Metrika)
- **Условная маршрутизация** — динамическое изменение маршрута на основе состояния приложения

### Важные детали

- `navigateTo()` выполняет клиентский редирект без перезагрузки страницы
- Middleware выполняется перед каждой навигацией, поэтому избегайте тяжелых операций
- Можно реализовать сложную логику авторизации, например, проверку JWT и установку пользователя в контекст

---

## 3. Клиентский Setup корневого компонента (C6)

**Слой:** Vue (клиент)  
**Файл:** `app.vue`  
**Когда:** в начале процесса гидрации корня.

### Пример реализации

```typescript
// app.vue

export default defineComponent({
  setup() {
    const nuxtApp = useNuxtApp()
    const clientServices = nuxtApp.$clientServices

    // Реактивное состояние приложения
    const appState = reactive({
      isOnline: navigator.onLine,
      theme: ref('light'),
      language: ref('en')
    })

    // Обработчики системных событий
    useEventListener(window, 'online', () => {
      appState.isOnline = true
      clientServices.notificationManager.show({
        type: 'success',
        message: 'Connection restored'
      })
    })

    useEventListener(window, 'offline', () => {
      appState.isOnline = false
      clientServices.notificationManager.show({
        type: 'warning',
        message: 'No internet connection'
      })
    })

    // Переключение темы
    function toggleTheme() {
      appState.theme.value = 
        appState.theme.value === 'light' ? 'dark' : 'light'
      
      // Применение темы
      applyTheme(appState.theme.value)
    }

    // Провайд глобальных реактивных значений
    provide('appState', appState)

    // Хуки жизненного цикла
    onBeforeMount(() => {
      // Предварительная подготовка
      initializeClientFeatures()
    })

    return {
      appState,
      toggleTheme
    }
  }
})

// Инициализация клиентских функций
function initializeClientFeatures() {
  // Регистрация SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }

  // Инициализация оффлайн-возможностей
  setupOfflineCapabilities()
}
```

### Особенности

- **Реактивное состояние приложения** — создание реактивного графа на клиенте и привязка его к SSR-HTML
- **Обработка системных событий** — отслеживание онлайн/оффлайн статуса, изменение темы
- **Провайд глобальных значений** — подготовка `provide`/состояния для дочерних компонентов
- **Инициализация клиентских возможностей** — регистрация service worker, настройка оффлайн-возможностей

### Важные детали

- Отсутствие "прыжков" в интерфейсе и ошибок hydration mismatch указывает на успешную гидратацию
- Ошибки могут возникнуть из-за различий в HTML, сгенерированном сервером и клиентом
- Использование `<ClientOnly>` компонента для оборачивания компонентов, которые должны рендериться только на клиенте

---

## 4. Клиентская Гидратация и Mounted (C8-C12)

**Слой:** Vue (клиент)  
**Файл:** `pages/index.vue`  
**Когда:** во время гидрации/инициализации страничного компонента и после монтирования.

### Пример реализации

```typescript
// pages/index.vue

export default defineComponent({
  setup() {
    // Клиентская загрузка данных
    const { data, pending } = useAsyncData('client-data', async () => {
      // Выборка с клиента
      return $fetch('/api/dynamic-content', {
        method: 'GET',
        // Клиентские параметры
        params: { 
          clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        }
      })
    }, {
      // Настройки клиентской выборки
      lazy: true,
      immediate: false
    })

    // Реактивные вычисления
    const processedData = computed(() => {
      // Трансформация данных на клиенте
      return data.value 
        ? enhanceClientData(data.value)
        : []
    })

    // Хуки жизненного цикла
    onBeforeMount(() => {
      // Подготовка DOM-независимых операций
      preparePageInteractions()
    })

    onMounted(() => {
      // Инициализация клиентских виджетов
      initializePageWidgets()

      // Загрузка данных после монтирования
      data.execute()
    })

    return {
      data: processedData,
      pending
    }
  }
})

// Enhance client-side data
function enhanceClientData(data) {
  return data.map(item => ({
    ...item,
    localizedDate: formatRelativeTime(item.date)
  }))
}

// Инициализация виджетов
function initializePageWidgets() {
  // Пример: инициализация карты
  if (document.querySelector('#map-container')) {
    initMap('#map-container')
  }

  // Инициализация charts/graphs
  initCharts()
}
```

### Ключевые аспекты

- **Клиентская загрузка данных** — данные, полученные из `payload`, становятся реактивными и используются для отображения контента страницы
- **Реактивная трансформация** — активация реактивности страницы; данные берутся из `payload` (повторного запроса нет)
- **Отложенная инициализация** — выполнение действий, которые необходимо выполнить до монтирования компонентов страницы, но после завершения гидратации
- **Виджеты после монтирования** — инициализация компонентов страницы, требующих доступа к DOM (например, карусели, модальные окна, карты, чарты)

### Важные детали

- `onBeforeMount` — подготовка действий до доступа к DOM элементам страницы
- `onMounted` — инициализация только-клиентских виджетов этой страницы (карта, чарт и т.п.)
- Инициализация библиотек, требующих доступа к DOM (например, Leaflet, Three.js)
- Хук `app:mounted` (C9) срабатывает после всех `onMounted`, включая страничные компоненты

---

## Порядок выполнения клиентских этапов

При первом заходе на страницу (SSR):

```
C1 (Client Plugin) 
  → C2 (Route Middleware) 
  → C3 (page:start) 
  → C4 (page:finish) 
  → C5 (app:beforeMount) 
  → C6 (App.vue Setup) 
  → C7 (App.vue onBeforeMount) 
  → C8 (Page Setup) 
  → C10 (Page onBeforeMount) 
  → C11 (App.vue onMounted) 
  → C12 (Page onMounted) 
  → C9 (app:mounted)
```

При последующих навигациях (SPA):

```
C2 (Route Middleware) 
  → C3 (page:start) 
  → C4 (page:finish) 
  → C6 (App.vue Setup) 
  → C7 (App.vue onBeforeMount) 
  → C8 (Page Setup) 
  → C10 (Page onBeforeMount) 
  → C11 (App.vue onMounted) 
  → C12 (Page onMounted) 
  → C9 (app:mounted)
```

**Примечание:** Хук `app:mounted` (C9) срабатывает после всех `onMounted`, включая страничные компоненты.

---

## Полный жизненный цикл Nuxt 4

Объединение всех этапов от сборки до выполнения:

```
[BUILD TIME]
Модули (modules:done → ready → build:done)

[СЕРВЕР]
S1 → S2 → S3 → S4 → S5 → [HTML отправлен в браузер]

[КЛИЕНТ]
C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C10 → C11 → C12 → C9

[ЗАВЕРШЕНИЕ]
close
```

**Важно:** Модули выполняются на этапе сборки (build time) **ДО** запуска жизненного цикла приложения. Они подготавливают конфигурацию, добавляют плагины, компоненты и другие ресурсы, которые затем используются в серверных и клиентских этапах.

Каждый этап выполняет свою роль в создании полнофункционального, производительного и безопасного приложения с SSR и клиентской гидратацией.

