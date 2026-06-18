<?php 
    $translation = "404";
    if($lang == 'es'){
        $translation = "404";
    }
?>
<?php head($translation, $lang); ?>

<body>
    <?php main_menu("404", $lang); ?>

    <div class="ip-wrapper ip-card">
        <div class="container py-5">
        <div class="row d-flex align-items-center px-3 px-lg-0">
                                <div class="col-auto">
                                    <img src="/assets/img/svg/face-frown.svg" style="width: 28px;">
                                </div>
                                <div class="col ps-0">
                                    <h2 class="text-primary display-6 fw-bold lh-1 mb-0 mt-2" >
                                    <?php if($lang == 'es') {echo("¡Ups!");} else {echo ("Oops!");} ?>
                                    </h2>
                                </div>
            </div>
                            <h2 class="display-3 fw-bold lh-1 mb-3 pt-3 pt-xl-5 pb-3 pb-xl-5 px-3 px-lg-0">
                                <?php if($lang == 'es') {echo("404 - Página no encontrada");} else {echo ("404 - Page not found");} ?>
                            </h2>
            
            <section>
                <p><a href="/<?php echo($lang); ?>" class="link-dark"><?php if($lang == 'es') {echo("Ip a la página de inicio");} else {echo ("Go to homepage");} ?></a></p>
            </section>
        </div>
    </div>

    <?php footer($lang); ?>
</body>

</html>