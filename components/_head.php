<!doctype html>
<html lang="<?php echo($lang);?>">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,900" rel="stylesheet">
    <link href="/assets/css/ipcore.css" rel="stylesheet">

    <title><?php echo $title; ?></title>
    <meta name="description" content="<?php echo ($lang == 'es') ? 'ipcore es un centro de datos carrier neutral en Madrid: colocation, cross-connects a más de 10 operadores, soporte 24x7 e infraestructura redundante (2N). Certificado ISO 9001, 14001 y 50001.' : 'ipcore is a carrier-neutral data center in Madrid: colocation, cross-connects to 10+ carriers, 24x7 on-site support and redundant (2N) infrastructure. ISO 9001, 14001 and 50001 certified.'; ?>">
    <meta name="robots" content="index,follow">
<?php
    $ip_path = strtok($_SERVER['REQUEST_URI'], '?');
    $ip_canonical = 'https://www.ipcore.com' . $ip_path;
    $ip_en = preg_replace('#^/es(/|$)#', '/en$1', $ip_path);
    $ip_es = preg_replace('#^/en(/|$)#', '/es$1', $ip_path);
?>
    <link rel="canonical" href="<?php echo $ip_canonical; ?>">
    <link rel="alternate" hreflang="en" href="https://www.ipcore.com<?php echo $ip_en; ?>">
    <link rel="alternate" hreflang="es" href="https://www.ipcore.com<?php echo $ip_es; ?>">
    <link rel="alternate" hreflang="x-default" href="https://www.ipcore.com<?php echo $ip_en; ?>">
    <meta property="og:title" content="<?php echo $title; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo $ip_canonical; ?>">
    <meta property="og:image" content="https://www.ipcore.com/assets/img/pictures/portada-horizontal.jpg">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "IPCore Datacenters SL",
      "alternateName": "ipcore",
      "url": "https://www.ipcore.com/",
      "logo": "https://www.ipcore.com/assets/img/logo.svg",
      "image": "https://www.ipcore.com/assets/img/pictures/portada-horizontal.jpg",
      "description": "<?php echo ($lang == 'es') ? 'Centro de datos carrier neutral en Madrid: colocation, cross-connects a más de 10 operadores, soporte 24x7 e infraestructura redundante (2N). Certificado ISO 9001, 14001 y 50001.' : 'Carrier-neutral data center in Madrid: colocation, cross-connects to 10+ carriers, 24x7 on-site support and redundant (2N) infrastructure. ISO 9001, 14001 and 50001 certified.'; ?>",
      "vatID": "B86088945",
      "telephone": "+34 91 2901 868",
      "email": "info@ipcore.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Calle Marzo 16",
        "postalCode": "28022",
        "addressLocality": "Madrid",
        "addressCountry": "ES"
      }
    }
    </script>

<?php if (isset($_COOKIE['analytics-enabled']) && $_COOKIE['analytics-enabled'] === 'yes') { ?>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16510474208"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'AW-16510474208');
    </script>
    <script> (function(ss,ex){ window.ldfdr=window.ldfdr||function(){(ldfdr._q=ldfdr._q||[]).push([].slice.call(arguments));}; (function(d,s){ fs=d.getElementsByTagName(s)[0]; function ce(src){ var cs=d.createElement(s); cs.src=src; cs.async=1; fs.parentNode.insertBefore(cs,fs); }; ce('https://sc.lfeeder.com/lftracker_v1_'+ss+(ex?'_'+ex:'')+'.js'); })(document,'script'); })('JMvZ8gnrkGPa2pOd'); </script>
    <script>(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"187211958", enableAutoSpaTracking: true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");</script>
<?php } ?>
</head>
