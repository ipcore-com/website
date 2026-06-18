<?php head(null, $lang); ?>
<body id="home">
    <?php main_menu("index", $lang); ?>


    <?php section('principal', $lang); ?>
    <?php section('servicios', $lang); ?>

    <!--<div class="ip-bg ip-datacenter ip-parallax half-page">
        <div class="ip-overlay"></div>
    </div>-->
    <?php section('datacenter', $lang); ?>
    <?php footer($lang); ?>
</body>

</html>