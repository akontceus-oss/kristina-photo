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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);

$config = [
    'mail_to' => '',            // куда слать заявки; несколько адресов — через запятую
    'mail_from' => '',          // от кого (ящик на домене сайта, например noreply@домен)
    'telegram_bot_token' => '', // токен бота от @BotFather
    'telegram_chat_id' => '',   // id чата/пользователя, куда бот пишет; несколько — через запятую
];
$configFile = dirname(__DIR__) . '/form-config.php';
if (is_file($configFile)) $config = array_merge($config, (array) require $configFile);

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
$page = $clean('page', 200);

if ($name === '' || $phone === '') reply(422, ['ok' => false, 'error' => 'required']);
if (($_POST['consent'] ?? '') !== '1') reply(422, ['ok' => false, 'error' => 'consent']);

$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'site');
$text = "Новая заявка с сайта {$host}\n\n"
    . "Имя: {$name}\n"
    . "Телефон: {$phone}\n"
    . ($email !== '' ? "Почта: {$email}\n" : '')
    . "Вид съёмки: {$service}\n"
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
    $tel = preg_replace('/[^\d+]/', '', $phone);
    $html = "<b>Новая заявка с сайта {$h($host)}</b>\n\n"
        . "<b>Имя:</b> {$h($name)}\n"
        . "<b>Телефон:</b> " . ($tel !== '' ? "<a href=\"tel:{$h($tel)}\">{$h($phone)}</a>" : $h($phone)) . "\n"
        . ($email !== '' ? "<b>Почта:</b> {$h($email)}\n" : '')
        . "<b>Вид съёмки:</b> {$h($service)}\n"
        . ($message !== '' ? "<b>Комментарий:</b> {$h($message)}\n" : '')
        . "<b>Страница:</b> {$h($page)}\n"
        . "<i>Согласие на обработку ПД: да, " . date('d.m.Y H:i') . "</i>";
    foreach (array_filter(array_map('trim', explode(',', (string) $config['telegram_chat_id']))) as $chatId) {
        $ch = curl_init('https://api.telegram.org/bot' . $config['telegram_bot_token'] . '/sendMessage');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => ['chat_id' => $chatId, 'text' => $html, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 'true'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $res = curl_exec($ch);
        $ok = $res !== false && (json_decode((string) $res, true)['ok'] ?? false);
        if (!$ok) error_log('send.php: telegram ' . $chatId . ': ' . ($res === false ? curl_error($ch) : $res));
        $sent = $ok || $sent;
        curl_close($ch);
    }
}

$sent ? reply(200, ['ok' => true]) : reply(500, ['ok' => false, 'error' => 'send']);
