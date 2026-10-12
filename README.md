# POLINA CHILI · Москва

https://polinachilimsk.ru/
Статический сайт · GitHub Pages (main, корень репозитория).

## Qtickets · 12 октября 2026
Все шесть purchase CTA открывают официальный Qtickets modal (event 265491),
используя https://cdn.qtickets.tech/openapi.js, как в CHEBANOV.
Цвет d4132a. При недоступном SDK и без JS остаётся обычная ссылка checkout.
Передаются utm_source, utm_medium, utm_campaign, utm_content, utm_term из URL/
sessionStorage; yclid передаётся из URL. Искусственной UTM по умолчанию нет.
Qtickets управляет единственным окном покупки, закрытием и повторным открытием.
Мобильное меню закрывается перед показом checkout. Дизайн, цены, прочий контент
и существующая аналитика не меняются. Тестовые покупки не выполняются.
