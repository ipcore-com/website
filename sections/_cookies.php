<div id="cookiesToast" class="ip-cookies ip-panel d-none">
    <div class="container">
        <div class="d-md-flex align-items-center px-3 px-lg-0">
            <span class="mb-0 text-cookies-small">
                <?php if($lang == 'es') {echo("
                Utilizamos cookies propias y de terceros para adaptar tu visita a tus hábitos de navegación.
                Puedes aceptar todas las cookies pulsando sobre Aceptar o configurar
                y/o rechazar algunas pulsando sobre Configurar.");} else {echo ("
                    We use own and third-party cookies to improve your browsing experience. You can accept all cookies by clicking on Accept or configure and reject some by clicking on Settings.");} ?>
                
            </span>
            <div class="d-flex justify-content-end pt-2 pt-md-0">
                <button type="button" class="btn btn-success mx-1" onClick="acceptCookies();"><?php if($lang == 'es') {echo("Aceptar");} else {echo ("Accept");} ?></button>
                <button type="button" class="btn btn-config-cookies mx-1" onClick="cookiesSettings();"><?php if($lang == 'es') {echo("Configurar");} else {echo ("Settings");} ?></button>
            </div>
        </div>
    </div>
</div>

<!-- Cookies modal-->
<div class="modal fade" id="cookieModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog cookies-dialog m-0" role="document">
        <div class="modal-content">
            <div class="modal-body cookies-panel">
                <div class="container">
                    <div class="d-md-flex align-items-center px-3 px-lg-0">
                        <span class="mb-0 text-cookies-small text-white">
                            <?php if($lang == 'es') {echo("
                            Utilizamos cookies propias y de terceros para adaptar tu visita a tus hábitos de navegación.
                            Puedes aceptar todas las cookies pulsando sobre Aceptar o configurar
                            y/o rechazar algunas pulsando sobre Configurar.");} else {echo ("
                                We use own and third-party cookies to improve your browsing experience. You can accept all cookies by clicking on Accept or configure and reject some by clicking on Settings.");} ?>
                            
                        </span>
                        <div class="d-flex justify-content-end pt-2 pt-md-0">
                            <button type="button" class="btn btn-primary mx-1" onClick="acceptCookies();"><?php if($lang == 'es') {echo("Aceptar");} else {echo ("Accept");} ?></button>
                            <button type="button" class="btn btn-config-cookies mx-1" onClick="cookiesSettings();"><?php if($lang == 'es') {echo("Configurar");} else {echo ("Settings");} ?></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="cookiesSettingsModal" class="modal ip-cookies" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content rounded">
            <div class="modal-header border-bottom-0 pb-0">
                <h3 class="modal-title text-uppercase">
                    <?php if($lang == 'es') {echo("¿Para qué finalidades se utiliza mi información y quiénes la utilizan?");} else {echo ("For what purposes is my information used and who uses it?");} ?>
                </h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div>
                    <p>
                        <?php if($lang == 'es') {echo("
                        Este Sitio Web utiliza cookies propias y de otras entidades, para poder acceder y
                        usar su información para las finalidades que se indican a continuación. Si no está
                        de acuerdo con alguna de estas finalidades, podrá personalizar sus opciones a través
                        de esta pantalla.");} else {echo ("
                            This Website uses its own cookies and those of other entities, in order to access and
                            use your information for the purposes indicated below. if it is not
                            in accordance with any of these purposes, you can personalize your options through
                            of this screen.");} ?>
                    </p>
                    <p>
                        <?php if($lang == 'es') {echo("
                        Nosotros y las empresas que colaboran con nosotros, tales como anunciantes,
                        operadores publicitarios e intermediarios, usaremos su información obtenida a través
                        de las cookies. Puede configurar sus preferencias de consentimiento por separado
                        para cada uno de los socios mencionados.
                        ");} else {echo ("
                            We and companies that collaborate with us, such as advertisers,
                            advertising operators and intermediaries, we will use your information obtained through
                            of cookies. You can set your consent preferences separately
                            for each of the mentioned partners.");} ?>
                        
                    </p>
                    <p>
                        <strong><?php if($lang == 'es') {echo("Información adicional:");} else {echo ("Additional Information:");} ?></strong>
                        <?php if($lang == 'es') {echo("
                        Puede conocer la información completa sobre el uso de las cookies, su configuración,
                        origen, finalidades y derechos en nuestra");} else {echo ("
                            You can know the complete information about the use of cookies, their configuration,
                            origin, purposes and rights in our");} ?>
                        <a href="/<?php echo ($lang); ?>/cookies" target="_blank"><?php if($lang == 'es') {echo("Aviso de Cookies");} else {echo ("Cookie Notice");} ?></a>.
                    </p>
                    <p>
                        <?php if($lang == 'es') {echo("Usted permite el uso de las cookies para las siguientes finalidades:");} else {echo ("You allow the use of cookies for the following purposes:");} ?>
                    </p>
                    <div class="accordion accordion-flush" id="accordionFlushExample">
                        <div class="accordion-item d-flex justify-content-between align-items-center">
                            <h2 class="accordion-header flex-grow-1" id="flush-headingOne">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                                <?php if($lang == 'es') {echo("Almacenar o acceder a información en un dispositivo");} else {echo ("Store or access information on a device");} ?>
                                </button>
                            </h2>
                            <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                                <div class="accordion-body">
                                    <p>
                                        <?php if($lang == 'es') {echo("
                                        Se puede almacenar o acceder a cookies, identificadores de dispositivo
                                        u otra información en su dispositivo para las finalidades que se le
                                        presentan.");} else {echo ("
                                            Store or access cookies, device identifiers
                                            or other information on your device for the purposes for which it is
                                            present.");} ?>
                                        <span data-bs-toggle="popover" data-bs-html="true" data-bs-content="<p><?php if($lang == 'es') {echo("Los proveedores pueden:");} else {echo ("Providers can:");} ?></p><ul><li><?php if($lang == 'es') {echo("Almacenar y/o acceder a información en el dispositivo a través de cookies e identificadores de dispositivo ejecutados/instalados en el equipo del usuario.");} else {echo ("Store and/or access information on the device through cookies and device identifiers executed/installed on the user's computer.");} ?></li></ul>" tabindex="0">
                                            <svg class="didomi-icon" width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" fill="#333"></path>
                                            </svg>
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="ip-collapse-alert alert alert-secondary">
                                <div class="d-flex justify-content-between align-items-center">
                                    <p class="mb-0"><?php if($lang == 'es') {echo("Consentimiento");} else {echo ("Consent");} ?></p>
                                    <div data-ip-cookie-item="almacenaje"></div>
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item d-flex justify-content-between align-items-center">
                            <h2 class="accordion-header flex-grow-1" id="flush-headingTwo">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                                    Google Analytics
                                </button>
                            </h2>
                            <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFlushExample">
                                <div class="accordion-body">
                                    <p>
                                        <?php if($lang == 'es') {echo("
                                        Estas cookies permiten a ambas empresas medir el número de visitas,
                                        analizar la forma en la que los visitantes utilizan el sitio web y
                                        cómo han llegado a él.");} else {echo ("
                                            These cookies allow both companies to measure the number of visits,
                                            analyze the way in which visitors use the website and
                                            how did they get to it");} ?>
                                    </p>
                                </div>
                            </div>
                            <div class="ip-collapse-alert alert alert-secondary">
                                <div class="d-flex justify-content-between align-items-center">
                                    <p class="mb-0"><?php if($lang == 'es') {echo("Consentimiento");} else {echo ("Consent");} ?></p>
                                    <div data-ip-cookie-item="analytics"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer pb-0">
                    <div id="ip-cookies-buttons-default">
                        <button type="button" class="btn btn-light border" onClick="rejectCookies();">
                            <?php if($lang == 'es') {echo("Rechazar todo");} else {echo ("Reject all");} ?>
                        </button>
                        <button type="button" class="btn btn-primary" onClick="acceptCookies();">
                            <?php if($lang == 'es') {echo("Aceptar todo");} else {echo ("Accept all");} ?>
                        </button>
                    </div>
                    <div id="ip-cookies-buttons-changes" class="d-none">
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="mb-0 me-2">
                                <?php if($lang == 'es') {echo("Guardar todas las preferencias y continuar");} else {echo ("Save all preferences and continue");} ?>
                            </p>
                            <button type="button" class="btn btn-secondary" onClick="acceptCookies();">
                                <?php if($lang == 'es') {echo("Guardar");} else {echo ("Save");} ?>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>