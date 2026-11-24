const clientPhotos = [
  {
    "src": "shared/img/clients/clientbmw7.jpg",
    "alt": "Клиент CARBURG получил BMW из Германии"
  },
  {
    "src": "shared/img/clients/clientmercedes.jpg",
    "alt": "Клиент CARBURG с Mercedes — импорт из Германии"
  },
  {
    "src": "shared/img/clients/clientaudi1.jpg",
    "alt": "Клиент CARBURG — доставка Audi в Нижний Новгород"
  },
  {
    "src": "shared/img/clients/clientbmw6.jpg",
    "alt": "BMW для клиента CARBURG — доставка по России"
  },
  {
    "src": "shared/img/clients/clientchevrolete.jpg",
    "alt": "Клиент CARBURG — доставка Chevrolet"
  },
  {
    "src": "shared/img/clients/clienthyundai.jpg",
    "alt": "Клиент CARBURG — доставка Hyundai"
  },
  {
    "src": "shared/img/clients/clientchangan1.jpg",
    "alt": "Клиент CARBURG — Changan из Китая"
  },
  {
    "src": "shared/img/clients/clientvolkswagen.jpg",
    "alt": "Довольный клиент CARBURG с Volkswagen"
  },
  {
    "src": "shared/img/clients/clientbmw1.jpg",
    "alt": "Клиент CARBURG — покупка BMW из Германии"
  },
  {
    "src": "shared/img/clients/clientkia.jpg",
    "alt": "Довольный клиент CARBURG с Kia"
  },
  {
    "src": "shared/img/clients/clientgeely.jpg",
    "alt": "Довольный клиент CARBURG с Geely"
  },
  {
    "src": "shared/img/clients/clientbmw2.jpg",
    "alt": "Доставка BMW для клиента CARBURG"
  },
  {
    "src": "shared/img/clients/clientchangan2.jpg",
    "alt": "Доставка Changan для клиента CARBURG"
  },
  {
    "src": "shared/img/clients/clientmazda1.jpg",
    "alt": "Клиент CARBURG — покупка Mazda"
  },
  {
    "src": "shared/img/clients/clientGMC.jpg",
    "alt": "Клиент CARBURG — импорт GMC из Америки"
  },
  {
    "src": "shared/img/clients/clientbmw3.jpg",
    "alt": "Клиент CARBURG с BMW — импорт из Европы"
  },
  {
    "src": "shared/img/clients/clientchangan3.jpg",
    "alt": "Довольный клиент CARBURG с Changan"
  },
  {
    "src": "shared/img/clients/clientnissan.jpg",
    "alt": "Доставка Nissan для клиента CARBURG"
  },
  {
    "src": "shared/img/clients/clientaudi2.jpg",
    "alt": "Довольный клиент CARBURG с новым Audi"
  },
  {
    "src": "shared/img/clients/clientbmw4.jpg",
    "alt": "Довольный владелец BMW от CARBURG"
  },
  {
    "src": "shared/img/clients/clientchangan4.jpg",
    "alt": "Клиент CARBURG — Changan под ключ"
  },
  {
    "src": "shared/img/clients/clientrenault.jpg",
    "alt": "Клиент CARBURG — покупка Renault"
  },
  {
    "src": "shared/img/clients/clientbmw5.jpg",
    "alt": "Клиент CARBURG — BMW под ключ"
  },
  {
    "src": "shared/img/clients/clientchangan5.jpg",
    "alt": "Changan для клиента CARBURG — импорт из Китая"
  },
  {
    "src": "shared/img/clients/clientchangan6.jpg",
    "alt": "Клиент CARBURG с новым Changan"
  }
];

const customerReviews = [
  {
    "quote": "Если подбирать авто, то только с этими ребятами. Уже 3-й автомобиль через них беру. Роман очень компетентный и приятный человек, всегда на связи, разъясняет нюансы. По факту 90% предложений на рынке — откровенный хлам в красивой обёртке. Работая с ними можно быть уверенным в своём будущем автомобиле. Полное юридическое и техническое сопровождение, гарантия на купленный авто. Это те ребята, на которых можно положиться. Рекомендую!",
    "name": "Нижегородец",
    "context": "3 автомобиля с 2021 года"
  },
  {
    "quote": "Обратился к ребятам за помощью в поиске автомобиля. С достаточно классическим запросом — что-то неприхотливое, свежее и на автомате, желательно побольше. И к моему счастью в ближайшее время нашёлся именно такой вариант. Аккуратный обслуженный автомобиль, с одним косметическим окрасом без ДТП и в богатой комплектации. Плюс дополнительно дали гарантию, что не может не радовать. Рекомендую!",
    "name": "Андрей",
    "context": "Подбор по России"
  },
  {
    "quote": "Первый раз покупала автомобиль в 2019 году — Porsche Macan, нашли в заявленные деньги в комплектации лучше чем ожидалось. Второй раз покупала Mercedes GLE Coupé, оба раза машины без нареканий, ездила по 2 года — ничего не ломалось. Самое главное, что ребята так же помогают продать автомобиль. Довольна покупками, обязательно вернусь ещё!",
    "name": "Анна",
    "context": "Porsche Macan, Mercedes GLE Coupé"
  },
  {
    "quote": "Заказывал выездную проверку автомобиля. Максимально оперативно договорились с продавцом. Провели осмотр и не упустили ни одной проблемы. Представили подробный отчёт с фотографиями по всем деталям и нюансам. Провели диагностику на ошибки, посмотрели на подъёмнике. После чего дали экспертное мнение о целесообразности покупки. Большое спасибо!",
    "name": "Даниил",
    "context": "Выездная проверка"
  },
  {
    "quote": "Обратились в компанию за подбором автомобиля в довольно небольшом бюджете. Основными условиями были минимальный пробег, 1-2 хозяина — мы ждали. И дождались Kia Rio X-Line с пробегом в 25 000 и 1 владельцем. Состояние идеальное, сделка прошла успешно. За полтора года эксплуатации никаких проблем с машиной не возникло. Рекомендую обращаться!",
    "name": "Константин",
    "context": "Kia Rio X-Line"
  },
  {
    "quote": "В семье два автомобиля, оба приобретались с помощью данной компании. Сказать что доволен — ничего не сказать! Очень понравился тёплый приём и высокий уровень специалистов. Ребята в обоих случаях нашли нам с супругой очень хорошие автомобили! За следующим автомобилем тоже приду к ним. Отдельное спасибо Роману за полное сопровождение от покупки до постановки на учёт.",
    "name": "Михаил",
    "context": "2 автомобиля для семьи"
  }
];
