export interface FieldDef {
  name: string;
  label: string;
  description: string;
}

export interface FieldCategory {
  category: string;
  fields: FieldDef[];
}

export const VISIT_FIELDS: FieldCategory[] = [
  {
    category: "Основные",
    fields: [
      { name: "ym:s:visitID", label: "ID визита", description: "Уникальный идентификатор визита" },
      { name: "ym:s:counterID", label: "ID счётчика", description: "Идентификатор счётчика" },
      { name: "ym:s:date", label: "Дата", description: "Дата визита (YYYY-MM-DD)" },
      { name: "ym:s:dateTime", label: "Дата и время", description: "Дата и время визита" },
      { name: "ym:s:isNewUser", label: "Новый пользователь", description: "1 — новый, 0 — вернувшийся" },
    ],
  },
  {
    category: "Идентификация",
    fields: [
      { name: "ym:s:clientID", label: "Client ID", description: "Анонимный идентификатор пользователя" },
      { name: "ym:s:counterUserIDHash", label: "User ID Hash", description: "Хэш пользовательского UserID" },
      { name: "ym:s:ipAddress", label: "IP-адрес", description: "IP-адрес посетителя" },
    ],
  },
  {
    category: "Поведение",
    fields: [
      { name: "ym:s:pageViews", label: "Просмотры страниц", description: "Количество просмотренных страниц" },
      { name: "ym:s:visitDuration", label: "Длительность визита", description: "Продолжительность визита в секундах" },
      { name: "ym:s:bounce", label: "Отказ", description: "1 — отказ, 0 — нет" },
    ],
  },
  {
    category: "Страницы",
    fields: [
      { name: "ym:s:startURL", label: "URL входа", description: "Страница входа" },
      { name: "ym:s:endURL", label: "URL выхода", description: "Страница выхода" },
      { name: "ym:s:referer", label: "Реферер", description: "Страница-источник перехода" },
    ],
  },
  {
    category: "География",
    fields: [
      { name: "ym:s:regionCountry", label: "Страна", description: "Страна посетителя" },
      { name: "ym:s:regionCity", label: "Город", description: "Город посетителя" },
      { name: "ym:s:regionCountryID", label: "ID страны", description: "Числовой ID страны" },
      { name: "ym:s:regionCityID", label: "ID города", description: "Числовой ID города" },
    ],
  },
  {
    category: "Источники трафика",
    fields: [
      { name: "ym:s:lastTrafficSource", label: "Источник трафика", description: "Тип источника (direct, referral, organic, ad, social, etc.)" },
      { name: "ym:s:lastAdvEngine", label: "Рекламная система", description: "Название рекламной системы" },
      { name: "ym:s:lastReferalSource", label: "Реферальный источник", description: "Домен реферального источника" },
      { name: "ym:s:lastSearchEngine", label: "Поисковая система", description: "Поисковая система" },
      { name: "ym:s:lastSearchEngineRoot", label: "Поисковая (корень)", description: "Корневой домен поисковой системы" },
      { name: "ym:s:lastSocialNetwork", label: "Соцсеть", description: "Название социальной сети" },
    ],
  },
  {
    category: "UTM-метки",
    fields: [
      { name: "ym:s:lastUTMSource", label: "UTM Source", description: "utm_source" },
      { name: "ym:s:lastUTMMedium", label: "UTM Medium", description: "utm_medium" },
      { name: "ym:s:lastUTMCampaign", label: "UTM Campaign", description: "utm_campaign" },
      { name: "ym:s:lastUTMContent", label: "UTM Content", description: "utm_content" },
      { name: "ym:s:lastUTMTerm", label: "UTM Term", description: "utm_term" },
    ],
  },
  {
    category: "Яндекс Директ",
    fields: [
      { name: "ym:s:lastDirectClickOrder", label: "ID кампании Директ", description: "Номер кампании Директа" },
      { name: "ym:s:lastDirectClickOrderName", label: "Название кампании", description: "Название кампании Директа" },
      { name: "ym:s:lastDirectClickBanner", label: "ID объявления", description: "Номер объявления Директа" },
      { name: "ym:s:lastDirectPhraseOrCond", label: "Фраза / условие", description: "Поисковая фраза или условие подбора" },
      { name: "ym:s:lastDirectPlatformType", label: "Тип площадки", description: "Поиск или сеть" },
      { name: "ym:s:lastDirectPlatform", label: "Площадка", description: "Площадка показа" },
    ],
  },
  {
    category: "Цели",
    fields: [
      { name: "ym:s:goalsID", label: "ID целей", description: "Массив ID достигнутых целей" },
      { name: "ym:s:goalsSerialNumber", label: "Порядковые номера целей", description: "Порядковые номера достижений" },
      { name: "ym:s:goalsDateTime", label: "Время достижения целей", description: "Время достижения каждой цели" },
      { name: "ym:s:goalsPrice", label: "Ценность целей", description: "Денежная ценность целей" },
      { name: "ym:s:goalsOrder", label: "Номера заказов", description: "Номера заказов из целей" },
    ],
  },
  {
    category: "Устройства и технологии",
    fields: [
      { name: "ym:s:deviceCategory", label: "Тип устройства", description: "desktop, mobile, tablet" },
      { name: "ym:s:operatingSystem", label: "ОС", description: "Операционная система" },
      { name: "ym:s:operatingSystemRoot", label: "Семейство ОС", description: "Корневое семейство ОС" },
      { name: "ym:s:browser", label: "Браузер", description: "Название браузера" },
      { name: "ym:s:browserMajorVersion", label: "Версия браузера", description: "Мажорная версия" },
      { name: "ym:s:browserEngine", label: "Движок браузера", description: "Webkit, Blink, Gecko, etc." },
      { name: "ym:s:mobilePhone", label: "Модель телефона", description: "Производитель мобильного" },
      { name: "ym:s:mobilePhoneModel", label: "Модель устройства", description: "Модель мобильного устройства" },
      { name: "ym:s:screenWidth", label: "Ширина экрана", description: "Ширина экрана в пикселях" },
      { name: "ym:s:screenHeight", label: "Высота экрана", description: "Высота экрана в пикселях" },
      { name: "ym:s:screenFormat", label: "Формат экрана", description: "Разрешение экрана" },
      { name: "ym:s:cookieEnabled", label: "Cookies", description: "Включены ли cookie" },
      { name: "ym:s:javascriptEnabled", label: "JavaScript", description: "Включён ли JavaScript" },
    ],
  },
  {
    category: "E-commerce",
    fields: [
      { name: "ym:s:purchaseID", label: "ID покупки", description: "Идентификатор покупки" },
      { name: "ym:s:purchaseRevenue", label: "Доход", description: "Доход от покупки" },
      { name: "ym:s:purchaseProductQuantity", label: "Количество товаров", description: "Количество товаров в покупке" },
    ],
  },
];

export const HIT_FIELDS: FieldCategory[] = [
  {
    category: "Основные",
    fields: [
      { name: "ym:pv:watchID", label: "ID хита", description: "Уникальный идентификатор хита" },
      { name: "ym:pv:counterID", label: "ID счётчика", description: "Идентификатор счётчика" },
      { name: "ym:pv:date", label: "Дата", description: "Дата хита" },
      { name: "ym:pv:dateTime", label: "Дата и время", description: "Точное время хита" },
      { name: "ym:pv:visitID", label: "ID визита", description: "ID визита, к которому относится хит" },
      { name: "ym:pv:clientID", label: "Client ID", description: "Анонимный ID пользователя" },
      { name: "ym:pv:counterUserIDHash", label: "User ID Hash", description: "Хэш UserID" },
    ],
  },
  {
    category: "Страницы",
    fields: [
      { name: "ym:pv:URL", label: "URL страницы", description: "URL просмотренной страницы" },
      { name: "ym:pv:title", label: "Заголовок страницы", description: "Title страницы" },
      { name: "ym:pv:referer", label: "Реферер", description: "URL реферера" },
      { name: "ym:pv:isPageView", label: "Просмотр страницы", description: "1 — просмотр, 0 — другой тип хита" },
      { name: "ym:pv:isTurboPage", label: "Турбо-страница", description: "Является ли турбо-страницей" },
    ],
  },
  {
    category: "UTM-метки",
    fields: [
      { name: "ym:pv:UTMSource", label: "UTM Source", description: "utm_source" },
      { name: "ym:pv:UTMMedium", label: "UTM Medium", description: "utm_medium" },
      { name: "ym:pv:UTMCampaign", label: "UTM Campaign", description: "utm_campaign" },
      { name: "ym:pv:UTMContent", label: "UTM Content", description: "utm_content" },
      { name: "ym:pv:UTMTerm", label: "UTM Term", description: "utm_term" },
    ],
  },
  {
    category: "География",
    fields: [
      { name: "ym:pv:regionCountry", label: "Страна", description: "Страна посетителя" },
      { name: "ym:pv:regionCity", label: "Город", description: "Город посетителя" },
    ],
  },
  {
    category: "Устройства и технологии",
    fields: [
      { name: "ym:pv:deviceCategory", label: "Тип устройства", description: "desktop, mobile, tablet" },
      { name: "ym:pv:operatingSystem", label: "ОС", description: "Операционная система" },
      { name: "ym:pv:browser", label: "Браузер", description: "Название браузера" },
      { name: "ym:pv:mobilePhone", label: "Модель телефона", description: "Производитель мобильного" },
      { name: "ym:pv:mobilePhoneModel", label: "Модель устройства", description: "Модель мобильного устройства" },
      { name: "ym:pv:screenWidth", label: "Ширина экрана", description: "Ширина экрана в пикселях" },
      { name: "ym:pv:screenHeight", label: "Высота экрана", description: "Высота экрана в пикселях" },
      { name: "ym:pv:ipAddress", label: "IP-адрес", description: "IP-адрес посетителя" },
    ],
  },
  {
    category: "Цели",
    fields: [
      { name: "ym:pv:goalsID", label: "ID целей", description: "Массив ID целей, достигнутых на этом хите" },
    ],
  },
];

export const ATTRIBUTION_MODELS = [
  { value: "LASTSIGN", label: "Последний значимый", description: "По умолчанию. Последний значимый источник" },
  { value: "LAST", label: "Последний переход", description: "Последний переход из любого источника" },
  { value: "FIRST", label: "Первый переход", description: "Первое посещение сайта" },
  { value: "CROSS_DEVICE_LAST_SIGNIFICANT", label: "Кросс-девайс (последний)", description: "Кросс-девайсная, последний значимый" },
  { value: "CROSS_DEVICE_FIRST", label: "Кросс-девайс (первый)", description: "Кросс-девайсная, первый переход" },
];

export const DEFAULT_VISIT_FIELDS = [
  "ym:s:visitID",
  "ym:s:date",
  "ym:s:dateTime",
  "ym:s:clientID",
  "ym:s:pageViews",
  "ym:s:visitDuration",
  "ym:s:bounce",
  "ym:s:startURL",
  "ym:s:lastTrafficSource",
  "ym:s:lastUTMSource",
  "ym:s:lastUTMMedium",
  "ym:s:lastUTMCampaign",
  "ym:s:deviceCategory",
  "ym:s:browser",
  "ym:s:regionCity",
];

export const DEFAULT_HIT_FIELDS = [
  "ym:pv:watchID",
  "ym:pv:visitID",
  "ym:pv:clientID",
  "ym:pv:date",
  "ym:pv:dateTime",
  "ym:pv:URL",
  "ym:pv:title",
  "ym:pv:referer",
  "ym:pv:deviceCategory",
  "ym:pv:browser",
  "ym:pv:regionCity",
];
