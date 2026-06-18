<?php head($lang == 'es' ? "Aviso de Cookies" : "Cookie Notice", $lang); ?>

<body>
    <?php main_menu("cookie-notice", $lang); ?>

    <div class="ip-wrapper ip-card">
        <div class="container py-5">
            <h2 class="display-3 fw-bold lh-1 mb-3 pt-5 pb-5">
                <?php if($lang == 'es') {echo("
                    Aviso de Cookies. Alcance, Responsable y Configuración de Cookies");} else {echo (
                        "Cookie Notice. Scope, Responsible and Configuration of Cookies");} ?>
                            </h2>

            <section>
                <p>
                    <?php if($lang == 'es') {echo("
                    Este Aviso de Cookies será de aplicación a las páginas web, a determinados accesos
                    optimizados para dispositivos móviles (Accelerated Mobile Pages, en adelante AMP) y/o a
                    aplicaciones móviles (en adelante, de forma conjunta, los Servicios) gestionados
                    por el Responsable indicado a continuación. El responsable es IPCore Datacenters SL, con domicilio en Calle Marzo 16, 28022 Madrid, con número de N.I.F: B86088945, inscrita en el Registro Mercantil de Madrid, Tomo 29127, Folio 153, Sección 8, Hoja M-524446, Inscripción 1ª
                    (en adelante, el Responsable). Correo electrónico del Delegado de Protección de Datos: dpo@ipcore.com. Asimismo, le informamos
                    de que el usuario en cualquier momento podrá rechazar o configurar el uso de Cookies, 
                    a través de los siguientes tipos de configuración dependiendo de la forma de navegación 
                    que el usuario realiza:");} else {echo ("
                        This Cookie Notice will apply to web pages, to certain accesses
                        optimized for mobile devices (Accelerated Mobile Pages, hereinafter AMP) and/or to
                        mobile applications (hereinafter, collectively, the Services) managed
                        by the person in charge indicated below. The person in charge is IPCore Datacenters SL, with address at Calle Marzo 16, 28022 Madrid, Spain, with N.I.F number: B86088945, registered in the Commercial Registry of Madrid, Volume 29127, Folio 153, Section 8, Sheet M-524446, Entry 1
                        (hereinafter, the Responsible). Email of the Data Protection Officer: dpo@ipcore.com. We also inform you
                        that the user at any time may reject or configure the use of Cookies,
                        through the following types of configuration depending on the way of navigation
                        What the user does:
");} ?>
                </p>
                <ul>
                    <li>
                        <?php if($lang == 'es') {echo("
                            Navegación por el Sitio Web utilizando un ordenador o dispositivos móviles: El usuario podrá acceder a la configuración clicando en el siguiente enlace:");} else {echo ("
                                Browsing the Website using a computer or mobile devices: The user can access the configuration by clicking on the following link:");} ?>
                        <br>
                        <button onclick="cookiesSettings()" class="btn btn-primary"> <?php if($lang == 'es') {echo("Configuración");} else {echo ("Settings");} ?></button>
                    </li>
                    <li>
                        <?php if($lang == 'es') {echo("
                            Navegación por el Sitio Web AMP: El usuario podrá configurar el uso de Cookies accediendo al Aviso de Cookies a través del enlace en el pie de sitio web.");} else {echo ("
                                Browsing the AMP Website: The user can configure the use of Cookies by accessing the Cookie Notice through the link in the footer of the website.");} ?>
                        
                    </li>
                    <li>
                        <?php if($lang == 'es') {echo("
                            Uso de aplicaciones móviles del Responsable: El usuario podrá configurar el uso de cookies accediendo al apartado de Ajustes/Configuración de Cookies de la aplicación.");} else {echo ("
                                Use of mobile applications of the Responsible Party: The user may configure the use of cookies by accessing the Settings/Cookie Configuration section of the application.");} ?>
                        
                    </li>
                </ul>
                <div class="row">
                    <div class="col-sm-12 " id="paginaMain">
                        <div class="paginaTXT">
                            <?php if($lang == 'es') {echo("
                            <p><strong>¿QUÉ SON LAS COOKIES?</strong></p>
                            <p>Las Cookies, y otras técnicas similares, son ficheros de texto, imagen o rutinas que el Servicio al que se accede instala o ejecuta en el equipo o dispositivo (PC, Smartphone, Tablet, etc.) del usuario para registrar la actividad de su navegación a través de las páginas y secciones de los Servicios.</p>
                            <p>Las Cookies se asocian únicamente a un código (ID) que identifica el dispositivo y/o el navegador que utiliza en cada visita, por lo que no proporcionan referencias que permitan deducir otros datos personales del usuario.</p>
                            <p></p>
                            <p><strong>¿PARA QUÉ UTILIZAN LAS COOKIES LOS SERVICIOS?</strong></p>
                            <p>Los Servicios del Responsable utilizan Cookies:</p>
                            <p>a) con el objetivo de ofrecer al usuario contenidos e información más adecuados a sus intereses y facilitar su navegación a través de nuestros Servicios,</p>
                            <p>b) para registrar las preferencias del usuario y proporcionarle un acceso más rápido,</p>
                            <p>c) personalizar los Servicios que ofrecemos, facilitando y ofreciendo a cada usuario información que es de su interés o que puede ser de su interés, basándose para ello en el uso que realiza de estos Servicios,</p>
                            <p>d) conocer todos los Servicios solicitados por los usuarios, de forma que podrán facilitar u ofrecer información adecuada a los gustos y preferencias de cada usuario y</p>
                            <p>e) personalizar los anuncios que se insertan en los Servicios basándose en las preferencias e intereses del usuario, sean seleccionados por el Responsable o por los propios anunciantes o sus representantes a través de los intermediarios y operadores publicitarios.</p>
                            <p>Además, los usuarios que se registren, o que inicien sesión y naveguen autenticados podrán beneficiarse de unos Servicios más personalizados y orientados a su perfil. Dichos usuarios autorizan expresamente el uso de la información de registro con esta finalidad, sin perjuicio de su derecho a rechazar o deshabilitar el uso de Cookies. Toda la información será tratada conforme a lo indicado en el Aviso o Cláusula de Privacidad que haya aceptado el usuario al registrarse, y conforme a lo indicado en el presente Aviso de Cookies.</p>
                            <p></p>
                            <p><strong>¿QUÉ TIPOS DE COOKIES HAY EN LOS SERVICIOS Y CUÁLES SON SUS FINALIDADES?</strong></p>
                            <p>En función de su duración, las Cookies pueden dividirse en:</p>
                            <ul>
                                <li>Cookies de sesión: Estas expiran cuando el usuario cierra el navegador y se borran del ordenador o dispositivo en ese momento.</li>
                                <li>Cookies persistentes: Expiran en función de cuando se cumpla el objetivo para el que sirven (por ejemplo, para que el usuario se mantenga identificado en los Servicios) o bien cuando se borran manualmente.</li>
                            </ul>
                            <p>En función de quién crea la Cookie se clasifican en:</p>
                            <ul>
                                <li>Cookies propias: Son las que envían al ordenador o dispositivo del usuario, nuestros Servicios y son gestionadas exclusivamente por el Responsable.</li>
                                <li>Cookies de terceros: Aquellas que son enviadas por entidades ajenas al Responsable y que se activan cuando se accede desde nuestros Servicios a redes sociales, a visualizar videos o al acceder a anuncios publicitarios.</li>
                            </ul>
                            <p></p>
                            <p><strong>¿QUÉ COOKIES SE PUEDEN INSTALAR EN LOS SERVICIOS?</strong></p>
                            <p>El acceso a los Servicios implica que se puedan instalar las Cookies, propias y/o de terceros, que se detallan en el siguiente cuadro:</p>
                            ");} else {echo ("
                                <p><strong>WHAT ARE COOKIES?</strong></p>
                                <p>Cookies, and other similar techniques, are text files, images or routines that the Service accessed installs or runs on the user's computer or device (PC, Smartphone, Tablet, etc.) to record browsing activity. through the pages and sections of the Services.</p>
                                <p>Cookies are only associated with a code (ID) that identifies the device and/or browser used on each visit, so they do not provide references that allow deducing other personal data of the user.</p>
                                <p></p>
                                <p><strong>WHAT DO THE SERVICES USE COOKIES FOR?</strong></p>
                                <p>The Responsible Services use Cookies:</p>
                                <p>a) with the aim of offering the user content and information more appropriate to their interests and facilitating their navigation through our Services,</p>
                                <p>b) to record user preferences and provide faster access,</p>
                                <p>c) personalize the Services we offer, facilitating and offering each user information that is of interest to them or that may be of interest to them, based on their use of these Services,</p>
                                <p>d) know all the Services requested by users, so that they can provide or offer information appropriate to the tastes and preferences of each user and</p>
                                <p>e) personalize the ads that are inserted in the Services based on the preferences and interests of the user, whether they are selected by the Controller or by the advertisers themselves or their representatives through intermediaries and advertising operators.</p>
                                <p>In addition, users who register, or who log in and browse authenticated will be able to benefit from more personalized Services and oriented to their profile. Said users expressly authorize the use of registration information for this purpose, without prejudice to their right to reject or disable the use of Cookies. All information will be treated in accordance with what is indicated in the Privacy Notice or Clause that the user has accepted when registering, and in accordance with what is indicated in this Cookie Notice.</p>
                                <p></p>
                                <p><strong>WHAT TYPES OF COOKIES ARE THERE IN THE SERVICES AND WHAT ARE THEIR PURPOSES?</strong></p>
                                <p>Depending on their duration, Cookies can be divided into:</p>
                                <ul>
                                    <li>Session cookies: These expire when the user closes the browser and are deleted from the computer or device at that time.</li>
                                    <li>Persistent cookies: They expire depending on when the purpose for which they serve is fulfilled (for example, so that the user remains identified in the Services) or when they are manually deleted.</li>
                                </ul>
                                <p>Depending on who creates the Cookie, they are classified as:</p>
                                <ul>
                                    <li>Own cookies: These are those that are sent to the user's computer or device by our Services and are managed exclusively by the Responsible Party.</li>
                                    <li>Third-party cookies: Those that are sent by entities unrelated to the Responsible and that are activated when accessing social networks from our Services, viewing videos or accessing advertisements.</li>
                                </ul>
                                <p></p>
                                <p><strong>WHAT COOKIES CAN BE INSTALLED IN THE SERVICES?</strong></p>
                                <p>Access to the Services implies that Cookies, own and/or third-party, can be installed, which are detailed in the following table:</p>");} ?>
                            <table class="table-bordered">
                                <tbody>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Tipo de Cookies");} else {echo ("Cookie Type");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Descripción");} else {echo ("Description");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Finalidad / información");} else {echo ("Purpose / information");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Plazo de tratamiento");} else {echo ("Treatment period");} ?></strong></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Rendimiento");} else {echo ("Performance");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Estas Cookies se utilizan para mejorar la navegación y optimizar el funcionamiento de nuestros Servicios. Almacenan configuraciones de Servicios para que no tenga que reconfigurarlos cada vez que nos visite.");} else {echo ("These Cookies are used to improve navigation and optimize the operation of our Services. They store Service settings so that you do not have to reconfigure them each time you visit us.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Ajustes de volumen de reproductores de vídeo o sonido; las velocidades de transmisión de vídeo que sean compatibles con su navegador; los objetos guardados en el “carrito de la compra” en los Servicios de E-commerce; etc.");} else {echo ("Volume adjustments of video or sound players; video transmission speeds that are supported by your browser; the objects saved in the “shopping cart” in the E-commerce Services; etc");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Persistentes");} else {echo ("Persistent");} ?></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Analíticas");} else {echo ("Analytics");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Cada vez que un usuario visita un Servicio, una herramienta de un proveedor externo genera una Cookie analítica en el ordenador del usuario. Esta Cookie, que sólo se genera en la visita, servirá en próximas visitas a los Servicios para identificar de forma anónima al visitante.");} else {echo ("Each time a user visits a Service, a tool from a third-party provider generates an analytical Cookie on the user's computer. This Cookie, which is only generated during the visit, will be used on future visits to the Services to anonymously identify the visitor.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Permitir la identificación anónima de los usuarios navegantes a través de la \“Cookie\” (identifica navegadores y dispositivos, no personas) y por lo tanto la contabilización aproximada del número de visitantes y su tendencia en el tiempo. Identificar de forma anónima los contenidos más visitados y más atractivos para los usuarios. Saber si el usuario que está accediendo es nuevo o repite visita. Salvo que el usuario decida registrarse en un servicio del Responsable, la \“Cookie\” nunca irá asociada a ningún dato de carácter personal que pueda identificarle directamente. Dichas Cookies sólo serán utilizadas con propósitos estadísticos que ayuden a la optimización y mejora de la experiencia de los usuarios en el Servicio.");} else {echo ("Allow the anonymous identification of browsing users through the \"Cookie\" (identifies browsers and devices, not people) and therefore the approximate counting of the number of visitors and their trend over time. Identify anonymously the most visited and most attractive content for users. Know if the user who is accessing is new or repeat visit. Unless the user decides to register in a Responsible service, the \"Cookie\" will never be associated with any personal data that can directly identify him. Said Cookies will only be used for statistical purposes that help to optimize and improve the user experience in the Service.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Persistentes");} else {echo ("Persistent");} ?></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Publicidad propia");} else {echo ("Own advertising");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Este tipo de Cookies permiten ampliar la información de los anuncios mostrados a cada usuario anónimo en los Servicios.");} else {echo ("This type of Cookies allow to expand the information of the advertisements shown to each anonymous user in the Services.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Entre otros, se almacena la duración o frecuencia de visualización de posiciones publicitarias, la interacción con las mismas, o los patrones de navegación y/o comportamientos del usuario ya que ayudan a conformar un perfil de interés publicitario. De este modo, permiten ofrecer publicidad afín a los intereses del usuario.");} else {echo ("Among others, the duration or frequency of display of advertising positions, the interaction with them, or the browsing patterns and/or user behaviors are stored, since they help to form a profile of advertising interest. In this way, they allow offering advertising related to the interests of the user.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Persistentes");} else {echo ("Persistent");} ?></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Publicidad de terceros");} else {echo ("Third Party Advertising");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Además de la publicidad gestionada por los Servicios propios, el Responsable ofrece a sus anunciantes la opción de servir anuncios a través de terceros (“Ad-Servers”).");} else {echo ("In addition to the advertising managed by its own Services, the Controller offers its advertisers the option of serving ads through third parties (“Ad-Servers”).");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("De este modo, anunciantes, operadores publicitarios y otros intermediarios pueden almacenar Cookies a través de los Servicios en los navegadores o aplicaciones de los usuarios, así como acceder a los datos que en ellas se guardan. Las empresas que generan estas Cookies tienen sus propios avisos de privacidad.");} else {echo ("In this way, advertisers, advertising operators and other intermediaries can store Cookies through the Services in users browsers or applications, as well as access the data stored in them. The companies that generate these Cookies have their own privacy notices.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Persistentes");} else {echo ("Persistent");} ?></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Publicidad comportamental");} else {echo ("behavioral advertising");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Modelo publicitario basado en el comportamiento del consumidor para el cual una Cookie recaba información anónima sobre hábitos de navegación.");} else {echo ("Advertising model based on consumer behavior for which a Cookie collects anonymous information on browsing habits.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("La finalidad es ofrecer al usuario publicidad acorde con sus intereses.");} else {echo ("The purpose is to offer the user advertising according to their interests.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Persistentes");} else {echo ("Persistent");} ?></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Registro");} else {echo ("Registration");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Las Cookies de registro se generan una vez que el usuario se ha registrado o posteriormente ha abierto su sesión, y se utilizan para identificarle en los Servicios.");} else {echo ("Registration Cookies are generated once the user has registered or has subsequently opened their session, and are used to identify them in the Services.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Mantener al usuario identificado, incluso si cierra nuestro sitio o el navegador, de modo que cuando vuelva a entrar en el mismo sitio seguirá identificado. Si el usuario cierra la sesión, se eliminará esta Cookie y la próxima vez que entre en el Servicio tendrá que iniciar sesión para estar identificado. Comprobar si el usuario está autorizado para acceder a ciertos Servicios, por ejemplo, para participar en un concurso. Adicionalmente, algunos Servicios pueden utilizar conectores con redes sociales tales como Facebook o Twitter. Cuando el usuario se registra en un Servicio con credenciales de una red social, autoriza a la red social a guardar una Cookie persistente que recuerda su identidad y le garantiza acceso a los Servicios hasta que expira. El usuario puede borrar esta Cookie y revocar el acceso a los Servicios mediante redes sociales actualizando sus preferencias en la red social que específica.");} else {echo ("Keep the user identified, even if he closes our site or the browser, so that when he returns to the same site, he will continue to be identified. If the user closes the session, this Cookie will be deleted and the next time they enter the Service they will have to log in to be identified. Check if the user is authorized to access certain Services, for example, to participate in a contest. Additionally, some Services may use connectors with social networks such as Facebook or Twitter. When the user registers in a Service with social network credentials, they authorize the social network to save a persistent Cookie that remembers their identity and guarantees access to the Services until it expires. The user can delete this Cookie and revoke access to the Services through social networks by updating their preferences in the specific social network.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Persistentes");} else {echo ("Persistent");} ?></p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p><strong><?php if($lang == 'es') {echo("Geolocalización");} else {echo ("Geolocation");} ?></strong></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Estas Cookies son totalmente anónimas y sólo se utiliza para ayudar a orientar el contenido a su ubicación.");} else {echo ("These Cookies are completely anonymous and are only used to help target content to your location.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("Estas Cookies son utilizadas para averiguar en qué país se encuentra cuando se solicita un Servicio.");} else {echo ("These Cookies are used to find out which country you are in when you request a Service.");} ?></p>
                                        </td>
                                        <td>
                                            <p><?php if($lang == 'es') {echo("De sesión");} else {echo ("Session");} ?></p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <p></p>
                            <?php if($lang == 'es') {echo("
                            <p><strong>¿CÓMO SE DESHABILITAN LAS COOKIES?</strong></p>
                            <p>Tal y como se indica en el apartado 1 del presente Aviso, al acceder al Servicio, el usuario verá un aviso de Cookies en el que se le informará de la forma en la que puede prestar o rechazar su consentimiento a instalar las Cookies.</p>
                            <p>Asimismo, el usuario puede oponerse al uso de determinadas Cookies mediante los siguientes servicios:</p>
                            <ul>
                                <li><a href=\"https://www.criteo.com/es/privacy/disable-criteo-services-on-internet-browsers/\" target=\"_blank\">https://www.criteo.com/es/privacy/disable-criteo-services-on-internet-browsers/</a></li>
                                <li><a href=\"https://youronlinechoices.eu/\" target=\"_blank\"><span>https://youronlinechoices.eu/</span></a></li>
                                <li><a href=\"https://www.networkadvertising.org/choices/\" target=\"_blank\"><span>https://www.networkadvertising.org/choices/</span></a></li>
                                <li><a href=\"https://www.aboutads.info/choices/\" target=\"_blank\"><span>https://www.aboutads.info/choices/</span></a></li>
                            </ul>
                            <p>Por otro lado, el usuario, en todo momento, podrá deshabilitar o eliminar las Cookies a través de la configuración del navegador que utilice en su dispositivo o terminal. A continuación, le facilitamos el acceso a páginas informativas de los principales navegadores de internet para la configuración de Cookies:</p>
                            <ul>
                                <li><a href=\"https://support.google.com/chrome/answer/95647?hl=es\" target=\"_blank\"><span>Configuración de cookies para Google Chrome</span></a></li>
                                <li><a href=\"https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-?redirectlocale=en-US&amp;redirectslug=Cookies\" target=\"_blank\">Configuración de cookies para Mozilla Firefox</a></li>
                                <li><a href=\"https://support.microsoft.com/es-es/help/278835/how-to-delete-cookie-files-in-internet-explorer\" target=\"_blank\">Configuración de cookies para Internet Explorer</a></li>
                                <li><a href=\"https://support.apple.com/es-es/HT201265\" target=\"_blank\">Configuración de cookies para Safari</a></li>
                            </ul>
                            <p></p>
                            <p><strong>¿QUÉ OCURRE SI SE DESHABILITAN LAS COOKIES?</strong></p>
                            <p>En caso de que se deshabiliten las Cookies, no podremos mantener sus preferencias y algunas funcionalidades de los Servicios podrían quedar inoperativas, no pudiendo ofrecerle servicios personalizados.</p>
                            <p></p>
                            <p><strong>¿QUIÉNES SON LOS DESTINATARIOS DE LA INFORMACIÓN Y CÓMO EL USO DE COOKIES AFECTA A LA PROTECCIÓN DE MIS DATOS PERSONALES?</strong></p>
                            <p>La información obtenida a través de las Cookies de los Servicios la conocerán las empresas colaboradoras, así como anunciantes, y otros operadores, como intermediarios y agentes publicitarios, con las finalidades descritas en este Aviso.</p>
                            <p>Para conocer las empresas colaboradoras que incorporan sus Cookies en nuestros Servicios y qué hace cada empresa, qué datos recopila y cómo los usa, acceda al botón de <strong>Ver nuestros socios</strong> en la pantalla de <span>Configuración</span> correspondiente.</p>
                            <p>La mayoría de las Cookies recopilan información anónima, que no permite obtener la identidad del usuario, si bien algunos de los códigos que se incluyen sirven para singularizar o individualizar al navegador o aplicación de su dispositivo utilizado, pudiendo ser de aplicación la normativa en materia de protección de datos personales. Por ello, le informamos de que la información que se obtiene por medio de las Cookies será tratada con las finalidades indicadas en el presente Aviso de Cookies.</p>
                            <p>Asimismo, esta información también será tratada por aquellas empresas que proveen Cookies con las finalidades indicadas en sus respectivos avisos de privacidad, accesibles a través del botón <strong>Ver nuestros socios</strong> de la pantalla de Configuración correspondiente.</p>
                            <p>No obstante, teniendo en cuenta que estos códigos no permiten la identificación del usuario, no serán aplicables los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad reconocidos en la normativa de protección de datos, salvo que el usuario sea capaz de aportar información adicional que permita vincular su identidad con los códigos identificativos de sus Cookies.</p>
                            <p>En caso de considerar vulnerado su derecho a la protección de datos, el usuario podrá interponer una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es) o ante el delegado de protección de datos del Responsable (<span><a href=\"mailto:dpo@ipcore.com\">dpo@ipcore.com</a></span>).</p>
                            <p>Por otro lado, le informamos que algunos de nuestros proveedores, socios y colaboradores,&nbsp;así como los anunciantes,&nbsp;operadores&nbsp;y agentes publicitarios mencionados,&nbsp;pueden estar ubicados en Estados Unidos u otros países cuya legislación no ofrece un nivel de protección de datos equivalente al europeo. Al consentir el uso de cookies y la compartición de datos, consiente la transferencia de sus datos personales.</p>
                            <p></p>
                            <p><strong>ACTUALIZACIONES Y CAMBIOS EN EL AVISO DE PRIVACIDAD/COOKIES:</strong></p>
                            <p>El Responsable puede modificar este Aviso de Cookies en función de exigencias legislativas, reglamentarias, o con la finalidad de adaptar dicho Aviso a las instrucciones dictadas por la Agencia Española de Protección de Datos, por ello se aconseja a los usuarios que lo visiten periódicamente.</p>
                            ");} else {echo ("
                                <p><strong>HOW ARE COOKIES DISABLED?</strong></p>
                                <p>As indicated in section 1 of this Notice, when accessing the Service, the user will see a Cookie notice in which they will be informed of the way in which they can give or refuse their consent to install Cookies.</p>
                                <p>Likewise, the user can oppose the use of certain Cookies through the following services:</p>
                                <ul>
                                    <li><a href=\"https://www.criteo.com/es/privacy/disable-criteo-services-on-internet-browsers/\" target=\"_blank\">https://www.criteo.com/es/privacy/disable-criteo-services-on-internet-browsers/</a></li>
                                    <li><a href=\"https://youronlinechoices.eu/\" target=\"_blank\"><span>https://youronlinechoices.eu/</span></a></li>
                                    <li><a href=\"https://www.networkadvertising.org/choices/\" target=\"_blank\"><span>https://www.networkadvertising.org/choices/</span></a></li>
                                    <li><a href=\"https://www.aboutads.info/choices/\" target=\"_blank\"><span>https://www.aboutads.info/choices/</span></a></li>
                                </ul>
                                <p>On the other hand, the user, at any time, may disable or eliminate Cookies through the settings of the browser used on their device or terminal. Next, we provide you with access to informative pages of the main internet browsers for the configuration of Cookies:</p>
                                <ul>
                                    <li><a href=\"https://support.google.com/chrome/answer/95647?hl=es\" target=\"_blank\"><span>Configuración de cookies para Google Chrome</span></a></li>
                                    <li><a href=\"https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-?redirectlocale=en-US&amp;redirectslug=Cookies\" target=\"_blank\">Configuración de cookies para Mozilla Firefox</a></li>
                                    <li><a href=\"https://support.microsoft.com/es-es/help/278835/how-to-delete-cookie-files-in-internet-explorer\" target=\"_blank\">Configuración de cookies para Internet Explorer</a></li>
                                    <li><a href=\"https://support.apple.com/es-es/HT201265\" target=\"_blank\">Configuración de cookies para Safari</a></li>
                                </ul>
                                <p></p>
                                <p><strong>WHAT HAPPENS IF COOKIES ARE DISABLED?</strong></p>
                                <p>In the event that Cookies are disabled, we will not be able to maintain your preferences and some features of the Services may become inoperative, not being able to offer you personalized services.</p>
                                <p></p>
                                <p><strong>WHO ARE THE RECIPIENTS OF THE INFORMATION AND HOW DOES THE USE OF COOKIES AFFECT THE PROTECTION OF MY PERSONAL DATA?</strong></p>
                                <p>The information obtained through the Cookies of the Services will be known by the collaborating companies, as well as advertisers, and other operators, such as intermediaries and advertising agents, for the purposes described in this Notice.</p>
                                <p>To find out about the collaborating companies that incorporate their Cookies into our Services and what each company does, what data it collects and how it uses it, access the <strong>See our partners</strong> button on the <span>Settings</span> screen. corresponding.</p>
                                <p>Most Cookies collect anonymous information, which does not allow the user's identity to be obtained, although some of the codes that are included serve to single out or individualize the browser or application on the device used, and the regulations on privacy may apply. personal data protection. Therefore, we inform you that the information obtained through Cookies will be processed for the purposes indicated in this Cookie Notice.</p>
                                <p>Likewise, this information will also be processed by those companies that provide Cookies for the purposes indicated in their respective privacy notices, accessible through the <strong>See our partners</strong> button on the corresponding Configuration screen.</p>
                                <p>However, taking into account that these codes do not allow the identification of the user, the rights of access, rectification, deletion, opposition, limitation and portability recognized in the data protection regulations will not be applicable, unless the user is able to provide Additional information that allows you to link your identity with the identification codes of your Cookies.</p>
                                <p>If you consider your right to data protection violated, the user may file a claim with the Spanish Agency for Data Protection (www.aepd.es) or with the data protection delegate of the Responsible (<span><a href=\"mailto:dpo@ipcore.com\">dpo@ipcore.com</a></span>).</p>
                                <p>On the other hand, we inform you that some of our suppliers, partners and collaborators,&nbsp;as well as the advertisers,&nbsp;operators&nbsp;and advertising agents mentioned,&nbsp;may be located in the United States or other countries whose legislation does not offer a level of data protection equivalent to the European one. By consenting to the use of cookies and data sharing, you consent to the transfer of your personal data.</p>
                                <p></p>
                                <p><strong>UPDATES AND CHANGES IN THE PRIVACY / COOKIES NOTICE:</strong></p>
                                <p>The Responsible may modify this Cookie Notice based on legislative or regulatory requirements, or with the purpose of adapting said Notice to the instructions issued by the Spanish Agency for Data Protection, therefore users are advised to visit it periodically.</p>");} ?>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <?php footer($lang); ?>
</body>

</html>