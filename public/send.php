<?php
/**
 * Обработчик формы заявки (виртуальный хостинг REG.RU, PHP 8).
 * Отправляет заявку в Telegram и дублирует на почту — каналы независимы:
 * если один не сработал, заявка всё равно уйдёт другим.
 * Данные заявки на сервере не сохраняются.
 *
 * Настройки лежат ВНЕ папки сайта: ../form-config.php (рядом с папкой emozioniinapp.ru).
 * Образец — form-config.example.php в репозитории, инструкция — README.
 */
declare(strict_types=1);
date_default_timezone_set('Europe/Moscow');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function reply(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$config = [
    'mail_to' => '',            // куда слать заявки; несколько адресов — через запятую
    'mail_from' => '',          // от кого (ящик на домене сайта, например noreply@домен)
    'telegram_bot_token' => '', // токен бота от @BotFather
    'telegram_chat_id' => '',   // id чата/пользователя, куда бот пишет; несколько — через запятую
];
$configFile = dirname(__DIR__) . '/form-config.php';
$hasConfig = is_file($configFile);
if ($hasConfig) $config = array_merge($config, (array) require $configFile);

function telegram(string $token, string $method, array $fields): array {
    $ch = curl_init('https://api.telegram.org/bot' . $token . '/' . $method);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $fields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $res = curl_exec($ch);
    $err = $res === false ? curl_error($ch) : '';
    curl_close($ch);
    if ($res === false) return ['ok' => false, 'description' => 'curl: ' . $err];
    return (array) (json_decode((string) $res, true) ?? ['ok' => false, 'description' => 'bad response']);
}

// Самопроверка: открыть в браузере /send.php?check — покажет, найден ли файл настроек,
// видит ли сервер Telegram и есть ли бот в чате. Токен и данные заявок не выводятся.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['check'])) {
    $out = [
        'config_file' => $hasConfig ? 'найден' : 'НЕ найден: ' . $configFile,
        'curl' => function_exists('curl_init') ? 'есть' : 'НЕТ',
        'mail' => $config['mail_to'] !== '' ? 'настроена' : 'не настроена',
    ];
    if ($config['telegram_bot_token'] === '' || $config['telegram_chat_id'] === '') {
        $out['telegram'] = 'не настроен (пустой токен или chat_id)';
    } elseif (function_exists('curl_init')) {
        $me = telegram($config['telegram_bot_token'], 'getMe', []);
        $out['bot'] = $me['ok'] ?? false ? '@' . ($me['result']['username'] ?? '?') : 'ошибка: ' . ($me['description'] ?? '?');
        foreach (array_filter(array_map('trim', explode(',', (string) $config['telegram_chat_id']))) as $chatId) {
            $chat = telegram($config['telegram_bot_token'], 'getChat', ['chat_id' => $chatId]);
            $out['chat ' . $chatId] = $chat['ok'] ?? false ? 'ок: ' . ($chat['result']['title'] ?? $chat['result']['first_name'] ?? '') : 'ошибка: ' . ($chat['description'] ?? '?');
        }
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);
if (!$hasConfig) reply(500, ['ok' => false, 'error' => 'config']);

// Антиспам: скрытое поле и слишком быстрая отправка
if (!empty($_POST['website'])) reply(200, ['ok' => true]);
$ts = (int) ($_POST['ts'] ?? 0);
if ($ts > 0 && (microtime(true) * 1000 - $ts) < 3000) reply(200, ['ok' => true]);

$clean = fn(string $k, int $max) => trim(mb_substr(strip_tags((string) ($_POST[$k] ?? '')), 0, $max));
$name = $clean('name', 100);
$phone = $clean('phone', 40);
$email = $clean('email', 100);
$service = $clean('service', 100);
$message = $clean('message', 2000);
$date = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($_POST['date'] ?? '')) ? date('d.m.Y', strtotime($_POST['date'])) : '';
$page = $clean('page', 200);

if ($name === '' || $phone === '') reply(422, ['ok' => false, 'error' => 'required']);
// Телефон: российский номер, +7 и 10 цифр
$digits = preg_replace('/\D/', '', $phone);
if (strlen($digits) === 11 && $digits[0] === '8') $digits = '7' . substr($digits, 1);
if (strlen($digits) !== 11 || $digits[0] !== '7') reply(422, ['ok' => false, 'error' => 'phone']);
$phone = sprintf('+7 (%s) %s-%s-%s', substr($digits, 1, 3), substr($digits, 4, 3), substr($digits, 7, 2), substr($digits, 9, 2));
if (($_POST['consent'] ?? '') !== '1') reply(422, ['ok' => false, 'error' => 'consent']);

$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'site');
$text = "Новая заявка с сайта {$host}\n\n"
    . "Имя: {$name}\n"
    . "Телефон: {$phone}\n"
    . ($email !== '' ? "Почта: {$email}\n" : '')
    . "Вид съёмки: {$service}\n"
    . ($date !== '' ? "Дата съёмки: {$date}\n" : '')
    . ($message !== '' ? "Комментарий: {$message}\n" : '')
    . "Страница: {$page}\n"
    . "Согласие на обработку ПД: да, " . date('d.m.Y H:i') . "\n";

$sent = false;

if ($config['mail_to'] !== '') {
    $from = $config['mail_from'] !== '' ? $config['mail_from'] : 'noreply@' . $host;
    $headers = implode("\r\n", array_merge([
        'From: =?UTF-8?B?' . base64_encode('Сайт ' . $host) . "?= <{$from}>",
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ], $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) ? ['Reply-To: ' . $email] : []));
    $subject = '=?UTF-8?B?' . base64_encode("Заявка: {$service} — {$name}") . '?=';
    $ok = mail($config['mail_to'], $subject, $text, $headers, '-f' . $from);
    if (!$ok) error_log('send.php: mail() failed');
    $sent = $ok || $sent;
}

if ($config['telegram_bot_token'] !== '' && $config['telegram_chat_id'] !== '') {
    $h = fn(string $v) => htmlspecialchars($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $html = "<b>Новая заявка с сайта {$h($host)}</b>\n\n"
        . "<b>Имя:</b> {$h($name)}\n"
        . "<b>Телефон:</b> <a href=\"tel:+{$digits}\">{$h($phone)}</a>\n"
        . ($email !== '' ? "<b>Почта:</b> {$h($email)}\n" : '')
        . "<b>Вид съёмки:</b> {$h($service)}\n"
        . ($date !== '' ? "<b>Дата съёмки:</b> {$date}\n" : '')
        . ($message !== '' ? "<b>Комментарий:</b> {$h($message)}\n" : '')
        . "<b>Страница:</b> {$h($page)}\n"
        . "<i>Согласие на обработку ПД: да, " . date('d.m.Y H:i') . "</i>";
    foreach (array_filter(array_map('trim', explode(',', (string) $config['telegram_chat_id']))) as $chatId) {
        $res = telegram($config['telegram_bot_token'], 'sendMessage', ['chat_id' => $chatId, 'text' => $html, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true']);
        $ok = (bool) ($res['ok'] ?? false);
        if (!$ok) error_log('send.php: telegram ' . $chatId . ': ' . ($res['description'] ?? '?'));
        $sent = $ok || $sent;
    }
}

$sent ? reply(200, ['ok' => true]) : reply(500, ['ok' => false, 'error' => 'send']);
