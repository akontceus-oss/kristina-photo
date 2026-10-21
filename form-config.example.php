<?php
// Скопируйте этот файл на хостинг В ПАПКУ ВЫШЕ public_html под именем form-config.php
// (так его нельзя открыть из браузера) и впишите свои данные.
return [
    'mail_to' => 'kristina@example.ru',
    'mail_from' => 'noreply@kristina-photo.ru',
    // Необязательно: заявки в Telegram. Бот создаётся в @BotFather,
    // chat_id можно узнать, написав боту и открыв https://api.telegram.org/bot<TOKEN>/getUpdates
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
];
