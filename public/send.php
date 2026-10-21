<?php
/**
 * Обработчик формы заявки для хостинга TimeWeb.
 * Отправляет заявку на почту и (если настроено) в Telegram.
 * Данные заявки на сервере не сохраняются.
 *
 * Настройки лежат ВНЕ папки сайта: ../form-config.php (рядом с public_html).
 * Образец — form-config.example.php в репозитории.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function reply(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);

$config = [
    'mail_to' => '',            // куда слать заявки
    'mail_from' => '',          // от кого (ящик на домене сайта, например noreply@домен)
    'telegram_bot_token' => '', // токен бота от @BotFather
    'telegram_chat_id' => '',   // id чата/пользователя, куда бот пишет
];
$configFile = dirname(__DIR__) . '/form-config.php';
if (is_file($configFile)) $config = array_merge($config, (array) require $configFile);

// Антиспам: скрытое поле и слишком быстрая отправка
if (!empty($_POST['website'])) reply(200, ['ok' => true]);
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts > 0 && (microtime(true) * 1000 - $ts) < 3000) reply(200, ['ok' => true]);

$clean = fn(string $k, int $max) => trim(mb_substr(strip_tags((string) ($_POST[$k] ?? '')), 0, $max));
$name = $clean('name', 100);
$contact = $clean('contact', 100);
$service = $clean('service', 100);
$message = $clean('message', 2000);
$page = $clean('page', 200);

if ($name === '' || $contact === '') reply(422, ['ok' => false, 'error' => 'required']);
if (($_POST['consent'] ?? '') !== '1') reply(422, ['ok' => false, 'error' => 'consent']);

$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'site');
$text = "Новая заявка с сайта {$host}\n\n"
    . "Имя: {$name}\n"
    . "Контакт: {$contact}\n"
    . "Вид съёмки: {$service}\n"
    . ($message !== '' ? "Комментарий: {$message}\n" : '')
    . "Страница: {$page}\n"
    . "Согласие на обработку ПД: да, " . date('d.m.Y H:i') . "\n";

$sent = false;

if ($config['mail_to'] !== '') {
    $from = $config['mail_from'] !== '' ? $config['mail_from'] : 'noreply@' . $host;
    $headers = implode("\r\n", [
        'From: =?UTF-8?B?' . base64_encode('Сайт ' . $host) . "?= <{$from}>",
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $subject = '=?UTF-8?B?' . base64_encode("Заявка: {$service} — {$name}") . '?=';
    $sent = mail($config['mail_to'], $subject, $text, $headers) || $sent;
}

if ($config['telegram_bot_token'] !== '' && $config['telegram_chat_id'] !== '') {
    $ch = curl_init('https://api.telegram.org/bot' . $config['telegram_bot_token'] . '/sendMessage');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => ['chat_id' => $config['telegram_chat_id'], 'text' => $text],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $res = curl_exec($ch);
    $sent = ($res !== false && (json_decode((string) $res, true)['ok'] ?? false)) || $sent;
    curl_close($ch);
}

$sent ? reply(200, ['ok' => true]) : reply(500, ['ok' => false, 'error' => 'send']);
