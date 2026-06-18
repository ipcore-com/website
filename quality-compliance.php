<?php head($lang == 'es' ? "Calidad y Cumplimiento" : "Quality & Compliance", $lang); ?>

<body>
    <?php main_menu("quality-compliance", $lang); ?>

    <div class="ip-wrapper ip-card">
        <div class="container py-5">
            <div class="row d-flex align-items-center px-3 px-lg-0">
                                <div class="col-auto">
                                    <img src="/assets/img/svg/3764213-200.png" style="width: 28px;">
                                </div>
                                <div class="col ps-0">
                                    <h2 class="text-primary display-6 fw-bold lh-1 mb-0 mt-2" >
                                        <?php if($lang == 'es') {echo("Calidad y Cumplimiento");} else {echo ("Quality & Compliance");} ?>
                                    </h2>
                                </div>
            </div>
                            <h2 class="display-3 fw-bold lh-1 mb-3 pt-5 pb-5 px-3 px-lg-0">
                                <?php if($lang == 'es') {echo("Sistema Integrado de Gestión");} else {echo ("Integrated Management System");} ?>
                            </h2>
            <section class="px-3 px-lg-0">
                <?php if($lang == 'es') {echo("
                <p>Este documento describe el Sistema Integrado de Gestión (SIG) de IPCore Datacenters SL, operador de un data center carrier neutral en Madrid. Nuestro SIG está implantado conforme a las normas ISO 9001 (Calidad), ISO 14001 (Medio Ambiente) e ISO 50001 (Energía) para la prestación de nuestros servicios de Co-location, Cloud privada y virtualización, y Disaster Recovery Planning.</p>
                <p>Para prestar este servicio nos apoyamos en un personal competente y cualificado, que se anticipa a las necesidades de los clientes y proporciona un alto nivel de calidad y seguridad, cumpliendo con los requisitos legales, reglamentarios y técnicos aplicables a la operación de un centro de datos.</p>
                <p>Nuestro sistema de gestión se basa en los siguientes compromisos operativos:</p>
                <p>
                </p>
                <ul class='simple-p-text'>
                    <li>Calidad (ISO 9001): mantener la calidad, seguridad y disponibilidad del servicio para satisfacer los requisitos de nuestros clientes y demás partes interesadas.</li>
                    <li>Gestión ambiental (ISO 14001): gestionar los aspectos ambientales operativos de la actividad del centro de datos &mdash;consumo de energía, residuos de equipos, emisiones y vertidos&mdash; mediante la evaluación continua de nuestro desempeño ambiental.</li>
                    <li>Eficiencia energética (ISO 50001): identificar, medir y optimizar el consumo energético de nuestras instalaciones, favoreciendo equipos y diseños energéticamente eficientes.</li>
                    <li>Mejora continua: mediante la formación del personal y la disponibilidad de los recursos necesarios para mejorar nuestro desempeño en calidad, medio ambiente y energía.</li>
                </ul>
                <p></p>
                <p>Este documento, aprobado por la Dirección, se revisa periódicamente para asegurar su adecuación, está a disposición del público y constituye el marco para la definición de nuestros objetivos operativos.</p>
                <br>
                <p><strong>Director</strong></p>
                <p>14 de febrero de 2023</p>");} else {echo ("
                    <p>This document describes the corporate Integrated Management System (IMS) of IPCore Datacenters SL, operator of a carrier-neutral data center in Madrid. Our IMS is implemented in line with the ISO 9001 (Quality), ISO 14001 (Environment) and ISO 50001 (Energy) standards for the operation of our Co-location, Private and Virtual Cloud, and Disaster Recovery services.</p>
                    <p>To deliver this service we rely on competent, qualified personnel who anticipate our clients' needs and provide a high standard of quality and security, while complying with the legal, regulatory and technical requirements applicable to data center operations.</p>
                    <p>Our management system is based on the following operational commitments:</p>
                    <p>
                    </p>
                    <ul class='simple-p-text'>
                        <li>Quality (ISO 9001): maintaining the quality, security and availability of our service to meet the requirements of our clients and other interested parties.</li>
                        <li>Environmental management (ISO 14001): managing the operational environmental aspects of running the facility &mdash;energy use, equipment waste, emissions and discharges&mdash; through continuous evaluation of our environmental performance.</li>
                        <li>Energy efficiency (ISO 50001): identifying, measuring and optimizing the energy consumption of our facility, and favoring energy-efficient equipment and design.</li>
                        <li>Continuous improvement: through staff training and the allocation of the resources needed to improve our quality, environmental and energy performance.</li>
                    </ul>
                    <p></p>
                    <p>This document is approved by the Director, reviewed periodically to ensure its continued suitability, made available to the public, and serves as the framework for defining our operational objectives.</p>
                    <br>
                    <p><strong>Director</strong></p>
                    <p>February 14, 2023</p>");} ?>
            </section>
        </div>
    </div>

    <?php footer($lang); ?>
</body>

</html>