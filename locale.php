<?php 
    $translation = "Idioma";
    if($lang != 'es'){
        $translation = "Language";
    }
?>
<?php head($translation, $lang); ?>

<body>
    <?php main_menu("locale", $lang); ?>
    
    <div  class="ip-wrapper ip-card">
        <div class="container py-5">
            <div class="row d-flex align-items-center px-3 px-lg-0">
                                <div class="col-auto">
                                    <img src="/assets/img/svg/3325015-200.png" style="width: 28px;">
                                </div>
                                <div class="col ps-0">
                                    <h2 class="text-primary display-6 fw-bold lh-1 mb-0 mt-2" >
                                    <?php if($lang == 'es') {echo("Idioma");} else {echo ("Language");} ?>
                                    </h2>
                                </div>
            </div>
                            <h2 class="display-3 fw-bold lh-1 mb-3 pt-3 pt-xl-5 pb-3 pb-xl-5 px-3 px-lg-0">
                                <?php if($lang == 'es') {echo("El sitio en otro idioma:");} else {echo ("Website in another language:");} ?>
                            </h2>
            <section class="px-3 px-lg-0">
                <p><a href="/es" class="link-dark">Español (ES)</a></p>
                <p><a href="/en" class="link-dark">English (EN)</a></p>
            </section>
        </div>
    </div>

    <?php footer($lang); ?>
</body>

</html>