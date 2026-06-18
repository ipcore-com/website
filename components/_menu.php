<nav  class="navbar navbar-expand-lg navbar-light fixed-top ip-main-menu px-3 px-lg-0">
    <div class="container">
        <a class="navbar-brand ip-logo-background" href="/"></a>
        <button class="navbar-toggler pe-0" type="button" data-bs-toggle="collapse" data-bs-target="#ip-main-menu" data-bs-dismiss="collapse" aria-controls="ip-main-menu" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="ip-main-menu">
            <ul class="navbar-nav ip-nav ms-auto mb-2 mb-lg-0">
                <li  >
                    <a href="/<?php echo ($lang); ?>/#home" class="nav-link px-2 active fw-bold">
                        <span data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                            <?php if($lang == 'es') {echo("Inicio");} else {echo ("Home");} ?>
                        </span>
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/#about" class="nav-link px-2 active fw-bold">
                        <span data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                            <?php if($lang == 'es') {echo("Nosotros");} else {echo("About");} ?>
                        </span>
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/#colocation" class="nav-link px-2 active fw-bold">
                        <span data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                            <?php if($lang == 'es') {echo("Colocación");} else {echo("Colocation");} ?>
                        </span>
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/#networking" class="nav-link px-2 active fw-bold">
                        <span data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                            <?php if($lang == 'es') {echo("Conexión");} else {echo("Networking");} ?>
                        </span>    
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/#support" class="nav-link px-2 active fw-bold">
                        <span data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                            <?php if($lang == 'es') {echo("Soporte");} else {echo("Support");} ?>
                        </span> 
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/#facility" class="nav-link px-2 active fw-bold">
                        <span data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                            <?php if($lang == 'es') {echo("Infraestructura");} else {echo("Facility");} ?>
                        </span>    
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/quality-compliance" class="nav-link px-2 active fw-bold">
                    <?php if($lang == 'es') {echo("Calidad y Cumplimiento");} else {echo("Quality &amp; Compliance");} ?>
                    </a>
                </li>
                <li>
                    <a href="/<?php echo ($lang); ?>/contact" class="nav-link px-2 active fw-bold">
                        <?php if($lang == 'es') {echo("Contacto");} else {echo("Contact");} ?>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>