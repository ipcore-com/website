<?php
require($_SERVER['DOCUMENT_ROOT']."/landing_main_text.php");
$main_text = get_landing_main_text($landing_main_texts);
?>
<div class="ip-bg ip-portada ip-parallax bg-dark">
</div>

<div class="ip-overlay ip-jumbotron text-white d-flex align-items-center">
    <div class="container pb-5">
        <div class="row px-3 px-lg-0">
            <div class="col-lg mt-0 text-center">
                <h1 class="d-none d-xl-block display-5 lh-1 mb-1">
                    <?php echo $main_text[$lang]['title']; ?><br>
                    <?php echo $main_text[$lang]['subtitle']; ?>
                </h1>
                <h1 class="d-xl-none display-5 lh-1 mb-1">
                    <?php echo $main_text[$lang]['title']; echo ' '; ?>
                    <?php echo $main_text[$lang]['subtitle']; ?>
                </h1>
            </div>
        </div>
        <div class="row flex-lg-row-reverse align-items-bottom pt-1  py-5">
            <div class="col-10 col-sm-8 col-lg-6">
            </div>
            <div class="d-none d-lg-block col-lg-12 position-absolute bottom-0 end-0 mt-0 bg-partners text-center pt-4 pb-4 ps-3 pe-3">
                <div class="container ps-4 pe-4 pt-2 pb-2">
                <div class="row">
                    <div class="col">
                        <h4 class="partners-text"><?php if($lang == 'es') { echo ("Proveedores de conectividad");} else { echo ("Connectivity solutions");} ?></h4>
                    </div>
                </div>
                <div class="row">
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://www.cogentco.com/es/" target="_blank"><img src="/assets/img/svg/cogentlogo.svg" width="90" ></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://www.colt.net/es/" target="_blank"><img src="/assets/img/svg/colttelecomlogo.svg" width="70"></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://correostelecom.es" target="_blank"><img src="/assets/img/svg/correostelecomlogo.svg" width="90"></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://www.vodafone.es/c/particulares/es/" target="_blank"><img src="/assets/img/svg/vodafone.svg" width="40"></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="http://www.adamo.es" target="_blank"><img src="/assets/img/svg/adamologo.svg" width="90" ></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="http://www.airenetworks.es" target="_blank"><img src="/assets/img/svg/airenetworkslogo.svg" width="90"></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://gtdespana.com" target="_blank"><img src="/assets/img/svg/gtdlogo.svg" width="60"></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://www.lyntia.com" target="_blank"><img src="/assets/img/svg/lyntia.svg" width="90"></a>
                    </div>
                    <div class="col d-flex align-items-center justify-content-center">
                        <a href="https://nearip.com" target="_blank"><img src="/assets/img/svg/nearip.svg" width="90"></a>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="d-lg-none container-fluid">
    <div class="row">
        <div class=" col-lg-12 mt-0 bg-partners text-center pt-4 pb-4 ps-3 pe-3">
                    <div class="container ps-4 pe-4 pt-2 pb-2">
                    <div class="row">
                        <div class="col">
                            <h4 class="partners-text"><?php if($lang == 'es') { echo ("Proveedores de conectividad");} else { echo ("Connectivity solutions");} ?></h4>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://www.cogentco.com/es/" target="_blank"><img src="/assets/img/svg/cogentlogo.svg" width="90" ></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://www.colt.net/es/" target="_blank"><img src="/assets/img/svg/colttelecomlogo.svg" width="70"></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://correostelecom.es" target="_blank"><img src="/assets/img/svg/correostelecomlogo.svg" width="90"></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://www.vodafone.es/c/particulares/es/" target="_blank"><img src="/assets/img/svg/vodafone.svg" width="40"></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="http://www.adamo.es" target="_blank"><img src="/assets/img/svg/adamologo.svg" width="90" ></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="http://www.airenetworks.es" target="_blank"><img src="/assets/img/svg/airenetworkslogo.svg" width="90"></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://gtdespana.com" target="_blank"><img src="/assets/img/svg/gtdlogo.svg" width="60"></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://www.lyntia.com" target="_blank"><img src="/assets/img/svg/lyntia.svg" width="90"></a>
                        </div>
                        <div class="col d-flex align-items-center justify-content-center">
                            <a href="https://nearip.com" target="_blank"><img src="/assets/img/svg/nearip.svg" width="90"></a>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
    </div>
</div>