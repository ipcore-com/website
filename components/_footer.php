<div class="ip-footer bg-dark text-white px-3 px-lg-0">
    <div class="container py-5">
        <footer class="row row-cols-2 py-5 pe-2">
            <div class="col">
                <a href="/" class="d-flex align-items-center link-dark text-decoration-none">
                    <img src="/assets/img/logo-inverse-new.svg" alt="IPCore" width="168">
                </a>
                <span class="text-rights"><?php if($lang == 'es') {echo("Todos los derechos reservados");} else {echo ("All rights reserved");} ?> <?php echo date('Y'); ?></span>
                <a href="/<?php echo ($lang); ?>/locale" class="d-flex align-items-center text-decoration-none copy">
                    <img src="/assets/img/icons/earth-americas_gray.svg" alt="IPCore" width="16" height="16"> <u><?php if($lang == 'es') {echo("Español (ES)");} else {echo("English (EN)");} ?></u>
                </a>
                <div class="pt-2 text-rights">
                    <a href="/<?php echo ($lang); ?>/legal" class="text-decoration-none copy"><u><?php if($lang == 'es') {echo("Aviso Legal");} else {echo("Legal Notice");} ?></u></a>
                    &middot;
                    <a href="/<?php echo ($lang); ?>/cookies" class="text-decoration-none copy"><u><?php if($lang == 'es') {echo("Aviso de Cookies");} else {echo("Cookie Notice");} ?></u></a>
                </div>
            </div>

            <div class="col pt-2">
                <ul class="list-unstyled text-end">
                    <li class="py-1">
                        <a href="/<?php echo ($lang); ?>/contact">
                            <u><?php if($lang == 'es') {echo("Contáctanos");} else {echo ("Contact us");} ?></u>
                            <img src="/assets/img/icons/user.svg" alt="Contact us" class="ms-2" width="15" height="15">
                        </a>
                    </li>
                    <li class="py-1">
                        <a href="tel:+34912901868">
                            +34 91 2901 868
                            <img src="/assets/img/icons/phone.svg" alt="Teléfono" class="ms-2" width="15" height="15">
                        </a>
                    </li>
                    <li class="py-1">
                        <a href="mailto:info@ipcore.com">
                            info@ipcore.com
                            <img src="/assets/img/icons/mail.svg" alt="E-mail" class="ms-2" width="15" height="15">
                        </a>
                    </li>
                    <li class="py-1">
                        IPCore Datacenters SL, Calle Marzo 16, 28022, Madrid - <?php if($lang == 'es') {echo("España");} else {echo("Spain");} ?>
                        <img src="/assets/img/icons/location.svg" alt="Dirección" class="ms-2" width="15" height="15">
                    </li>
                </ul>
            </div>
        </footer>
    </div>
</div>

<?php section('cookies', $lang) ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
<!--<script src="/assets/js/simpleParallax.min.js"></script>-->
<script src="/assets/js/ipcore.js"></script>