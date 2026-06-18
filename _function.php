<?php

// Load secrets from OUTSIDE the web root (never committed to version control).
// On each server: copy ipcore-config.sample.php to the PARENT of the web root,
// rename it ipcore-config.php, and fill in the real values.
$ip_config_file = dirname(__DIR__) . '/ipcore-config.php';
if (is_readable($ip_config_file)) {
    require_once $ip_config_file;
}
if (!defined('MAILGUN_API_KEY'))      { define('MAILGUN_API_KEY', ''); }
if (!defined('RECAPTCHA_SECRET_KEY')) { define('RECAPTCHA_SECRET_KEY', ''); }

function head($title, $lang)
{
    if ($title) {
        $title = $title . " | ipcore Madrid Data Center";
    } else {
        $title = ($lang == 'es') ? "ipcore Madrid | Data center Carrier Neutral" : "ipcore Madrid | Data Center Carrier Neutral";
    }

    include("components/_head.php");
}

function footer($lang)
{
    include("components/_footer.php");
}

function main_menu($current, $lang)
{
    include("components/_menu.php");
}

function section($section_name, $lang)
{
    include("sections/_" . $section_name . ".php");
}

function get_landing_main_text($landing_main_texts){
    $idx_en = rand(0, count($landing_main_texts['en']) - 1);
    $idx_es = rand(0, count($landing_main_texts['es']) - 1);
    $main_text = array(
        'en' => array(
            'title' => $landing_main_texts['en'][$idx_en]['title'],
            'subtitle' => $landing_main_texts['en'][$idx_en]['subtitle']
        ),
        'es' => array(
            'title' => $landing_main_texts['es'][$idx_es]['title'],
            'subtitle' => $landing_main_texts['es'][$idx_es]['subtitle']
        )
    );

    return $main_text;
}

// aset language preference.
function set_language($lang){

    if($lang == 'es' || $lang == 'en'){
        // set lang as cookie here if necessary.
        if($_COOKIE['lang'] != $lang){
            if (isset($_COOKIE["preferences-enabled"])) {
                if($_COOKIE["preferences-enabled"] == "yes"){
                    setcookie('lang', $lang, time()+3600*24*7*4,'/');
                }
            }
        }
        return $lang;
    }
    return 'en';
}

// get language preference based on cookies.
function get_language(){
    // check query param lang first.
    if( isset($_SERVER['QUERY_STRING'])){
        $queries = array();
        parse_str($_SERVER['QUERY_STRING'], $queries);
        foreach( $queries as $query => $value){
            if($query == 'lang'){
                if($value == 'es' || $value == 'en'){
                    // set lang as cookie here if necessary.
                    if (isset($_COOKIE["preferences-enabled"])) {
                        if($_COOKIE["preferences-enabled"] == "yes"){
                            if($_COOKIE['lang'] != $value){
                                setcookie('lang', $value, time()+3600*24*7*4,'/');
                            }
                        }
                    }
                    return $value;
                }
            }
        }
    }
    // check language in cookie
    if(isset($_COOKIE['lang'])){
        if($_COOKIE['lang'] == 'es' || $_COOKIE['lang'] == 'en'){
            return $_COOKIE['lang'];
        }
    }
    // if query param lang is not set, then use HTTP_ACCEPT_LANGUAGE
    $langs = explode( ',', $_SERVER['HTTP_ACCEPT_LANGUAGE'] );
    foreach ( $langs as $lang) {
        $value = substr( $lang, 0,2 );
        if($value == 'es' || $value == 'en'){
            // set lang as cookie here if necessary.
            if (isset($_COOKIE["preferences-enabled"])) {
                if($_COOKIE["preferences-enabled"] == "yes"){
                    if($_COOKIE['lang'] != $value){
                        setcookie('lang', $value, time()+3600*24*7*4,'/');
                    }
                }
            }
            return $value;
        }
    }
    return 'en';
}