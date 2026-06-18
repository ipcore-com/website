<?php
// IPCore configuration TEMPLATE (safe to commit — contains no real secrets).
//
// SETUP, per server:
//   1. Copy this file to the PARENT directory of the web root and rename it:
//        cp /var/www/html/ipcore-config.sample.php /var/www/ipcore-config.php
//   2. Fill in the real values below.
//   3. Lock it down:
//        sudo chown www-data:www-data /var/www/ipcore-config.php
//        sudo chmod 600 /var/www/ipcore-config.php
//
// The real ipcore-config.php must NEVER be committed to git, and must live
// OUTSIDE the web root so it can't be served even if PHP stops executing.
// _function.php loads it from dirname(web root)/ipcore-config.php.

define('MAILGUN_API_KEY',      'api:YOUR-MAILGUN-PRIVATE-API-KEY');
define('RECAPTCHA_SECRET_KEY', 'YOUR-RECAPTCHA-SECRET-KEY');
