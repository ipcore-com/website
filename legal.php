<?php head($lang == 'es' ? "Aviso Legal" : "Legal Notice", $lang); ?>

<body>
    <?php main_menu("legal", $lang); ?>

    <div class="ip-wrapper ip-card">
        <div class="container py-5">
            <div class="row d-flex align-items-center px-3 px-lg-0">
                                <div class="col-auto">
                                    <img src="/assets/img/svg/3764213-200.png" style="width: 28px;">
                                </div>
                                <div class="col ps-0">
                                    <h2 class="text-primary display-6 fw-bold lh-1 mb-0 mt-2" >
                                        <?php if($lang == 'es') {echo("Información Legal");} else {echo ("Legal Information");} ?>
                                    </h2>
                                </div>
            </div>
                            <h2 class="display-3 fw-bold lh-1 mb-3 pt-5 pb-5 px-3 px-lg-0">
                                <?php if($lang == 'es') {echo("Aviso Legal");} else {echo ("Legal Notice");} ?>
                            </h2>
            <section class="px-3 px-lg-0">
                <?php if($lang == 'es') {echo("
                <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos identificativos del titular de este sitio web:</p>
                <ul class='simple-p-text'>
                    <li><strong>Titular:</strong> IPCore Datacenters SL</li>
                    <li><strong>N.I.F.:</strong> B86088945</li>
                    <li><strong>Domicilio:</strong> Calle Marzo 16, 28022 Madrid, España</li>
                    <li><strong>Datos registrales:</strong> inscrita en el Registro Mercantil de Madrid, Tomo 29127, Folio 153, Sección 8, Hoja M-524446, Inscripción 1ª</li>
                    <li><strong>Teléfono:</strong> +34 91 2901 868</li>
                    <li><strong>Correo electrónico:</strong> info@ipcore.com</li>
                    <li><strong>Delegado de Protección de Datos:</strong> dpo@ipcore.com</li>
                </ul>
                <p><strong>Objeto.</strong> Este sitio web tiene por objeto ofrecer información sobre los servicios de centro de datos carrier neutral que IPCore Datacenters SL presta en Madrid, incluyendo colocation, conectividad y servicios asociados.</p>
                <p><strong>Condiciones de uso.</strong> El acceso y la navegación por este sitio web implican la aceptación del presente Aviso Legal. El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas o contrarias a la buena fe.</p>
                <p><strong>Propiedad intelectual e industrial.</strong> Los contenidos de este sitio (textos, imágenes, marcas, logotipos y diseño) son titularidad de IPCore Datacenters SL o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o transformación sin autorización.</p>
                <p><strong>Responsabilidad.</strong> IPCore Datacenters SL no se hace responsable del uso incorrecto de los contenidos ni de los posibles daños derivados de la indisponibilidad temporal del sitio web. Los enlaces a sitios de terceros se ofrecen únicamente a título informativo.</p>
                <p><strong>Protección de datos y cookies.</strong> El tratamiento de datos personales y el uso de cookies se rigen por el <a href=\"/es/cookies\">Aviso de Cookies</a>.</p>
                <p><strong>Legislación aplicable.</strong> El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid, salvo que la normativa aplicable disponga otro fuero.</p>
                ");} else {echo ("
                    <p>In compliance with article 10 of Spanish Law 34/2002, of 11 July, on Information Society Services and Electronic Commerce (LSSI-CE), the following identifying details of the owner of this website are provided:</p>
                    <ul class='simple-p-text'>
                        <li><strong>Owner:</strong> IPCore Datacenters SL</li>
                        <li><strong>Tax ID (N.I.F.):</strong> B86088945</li>
                        <li><strong>Registered address:</strong> Calle Marzo 16, 28022 Madrid, Spain</li>
                        <li><strong>Registry details:</strong> registered in the Commercial Registry of Madrid, Volume 29127, Folio 153, Section 8, Sheet M-524446, Entry 1</li>
                        <li><strong>Phone:</strong> +34 91 2901 868</li>
                        <li><strong>Email:</strong> info@ipcore.com</li>
                        <li><strong>Data Protection Officer:</strong> dpo@ipcore.com</li>
                    </ul>
                    <p><strong>Purpose.</strong> This website provides information about the carrier-neutral data center services that IPCore Datacenters SL offers in Madrid, including colocation, connectivity and related services.</p>
                    <p><strong>Terms of use.</strong> Accessing and browsing this website implies acceptance of this Legal Notice. The user agrees to make appropriate use of the content and not to use it for unlawful purposes or purposes contrary to good faith.</p>
                    <p><strong>Intellectual and industrial property.</strong> The content of this site (text, images, trademarks, logos and design) belongs to IPCore Datacenters SL or to third parties who have authorized its use, and is protected by intellectual and industrial property law. Its reproduction, distribution or transformation without authorization is prohibited.</p>
                    <p><strong>Liability.</strong> IPCore Datacenters SL is not responsible for the improper use of the content or for any damage arising from the temporary unavailability of the website. Links to third-party sites are provided for information purposes only.</p>
                    <p><strong>Data protection and cookies.</strong> The processing of personal data and the use of cookies are governed by the <a href=\"/en/cookies\">Cookie Notice</a>.</p>
                    <p><strong>Applicable law.</strong> This Legal Notice is governed by Spanish law. For the resolution of any dispute, the parties submit to the Courts and Tribunals of Madrid, unless applicable law provides otherwise.</p>
                ");} ?>
            </section>
        </div>
    </div>

    <?php footer($lang); ?>
</body>

</html>
