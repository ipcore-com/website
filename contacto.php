<?php head($lang == 'es' ? "Contacto" : "Contact", $lang); ?>

<?php
    require($_SERVER['DOCUMENT_ROOT']."/mailgun.php");
    $empty_captcha = false;
    $valid_captcha = true;
    $captcha = "";
    if(isset($_POST['g-recaptcha-response'])){
        $captcha=$_POST['g-recaptcha-response'];
        if(!$captcha){
            $empty_captcha = true;
        }
    }
    else{
        if(isset($_POST['name']))
        {
            $full_name = $_POST['name'];
            if(!empty($full_name)){
                $empty_captcha = true;
                $captcha = "";
            }
        }
    }
    if($captcha){
        $secretKey = RECAPTCHA_SECRET_KEY;
        // post request to server
        $url = 'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secretKey) .  '&response=' . urlencode($captcha);
        $response = file_get_contents($url);
        $responseKeys = json_decode($response,true);
        // should return JSON with success as true
        if(!$responseKeys["success"]) {
            $valid_captcha = false;
        }
    
    }
    
    $full_name = "";
    $org_name = "";
    $email = "";
    $phone_number = "";
    $tell_us = "";
    if(isset($_POST)){
        if(isset($_POST['name'])
            && isset($_POST['company_name'])
            && isset($_POST['email'])){
                
                $full_name = $_POST['name'];
                $org_name = $_POST['company_name'];
                $email = $_POST['email'];
                $phone_number = "";
                $tell_us = "";
                if(isset($_POST['phone'])){
                    $phone_number = $_POST['phone'];
                }
                if(isset($_POST['about_project'])){
                    $tell_us = $_POST['about_project'];
                }
                if($full_name
                    && $org_name
                    && $email
                    && $valid_captcha
                    && !$empty_captcha){
                    // resend contact's data to our staff
                    send_contact_mail_to_staff($full_name, 
                    $org_name, $email, 
                    $phone_number,$tell_us);
                    // send reply to contact
                    send_contact_mail_reply($email, $full_name, $lang);
                    header("Location: /".$lang."/contact/?success=true");
                }
        }
    }
?>

<body>
    <?php main_menu("contacto", $lang); ?>

    <div class="ip-wrapper ip-card">
        <div class="container py-5">
            <div class="row ">
                <div class="col-md pb-5">
                    <div class="row d-flex align-items-center px-3 px-lg-0">
                                <div class="col-auto">
                                    <img src="/assets/img/svg/4845488-200.png" style="width: 28px;">
                                </div>
                                <div class="col ps-0">
                                    <h2 class="text-primary display-6 fw-bold lh-1 mb-0 mt-2" >
                                        <?php if($lang == 'es') {echo("Contacto");} else {echo("Contact");} ?>
                                    </h2>
                                </div>
                    </div>
                            <h2 class="display-3 fw-bold lh-1 mb-3 pt-5 pb-5 px-3 px-lg-0">
                            <?php if($lang == 'es') {echo("Si necesitas información");} else {echo("If you need information");} ?>
                            </h2>
                            <p class="px-3 px-lg-0"><?php if($lang == 'es') {echo("
                            Sobre nuestro nuevo centro de datos y los servicios que ofrecemos, no dudes en contactar con nosotros para exponernos tus dudas, inquietudes, ideas y sugerencias. Nos pondremos en contacto contigo muy pronto.");} 
                            else {echo("About our data center and the services we offer, do not hesitate to contact us and tell us your doubts, concerns, ideas and suggestions and we will contact you very soon.<br><br>");} ?></p>
                </div>
                
            </div>
            <div class="row pb-5">
                <div class="col-md-6 pb-5">
                    <section>
                        <form id="contact-form" class="ip-form px-3 px-lg-0" action="/<?php echo ($lang); ?>/contact/" method="post">
                            <div class="card bg-white">
                                <div class="card-body m-3 mb-0">
                                    <div class="row mb-3">
                                        <label for="contacto-nombre" class="col-lg-2 px-0 col-form-label contact-form-label"><?php if($lang == 'es') {echo("Nombre");} else {echo("Full Name");} ?>*</label>
                                        <div class="col-lg-10">
                                            <input type="text" class="form-control" id="contacto-nombre" name="name" required="" value="<?php echo $full_name;?>">
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <label for="contacto-empresa" class="col-lg-2 px-0 col-form-label contact-form-label"><?php if($lang == 'es') {echo("Empresa");} else {echo("Company");} ?>*</label>
                                        <div class="col-lg-10">
                                            <input type="text" class="form-control" id="contacto-empresa" name="company_name" required="" value="<?php echo $org_name;?>">
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <label for="contacto-telefono" class="col-lg-2 px-0 col-form-label contact-form-label"><?php if($lang == 'es') {echo("Teléfono");} else {echo("Phonenumber");} ?></label>
                                        <div class="col-lg-10">
                                            <input type="text" class="form-control" id="contacto-telefono" name="phone" value="<?php echo $phone_number;?>">
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <label for="contacto-correo" class="col-lg-2 px-0 col-form-label contact-form-label"><?php if($lang == 'es') {echo("Correo");} else {echo("Email");} ?>*</label>
                                        <div class="col-lg-10">
                                            <input type="text" class="form-control" id="contacto-correo" name="email" required="" value="<?php echo $email;?>">
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <label for="contacto-mensaje" class="col-lg-2 px-0 col-form-label contact-form-label"><?php if($lang == 'es') {echo("Mensaje");} else {echo("Message");} ?></label>
                                        <div class="col-lg-10">
                                            <textarea type="text" class="form-control" id="contacto-mensaje" name="about_project"><?php echo $tell_us;?></textarea>
                                        </div>
                                    </div>
                                    <?php if (isset($_GET["success"]) && $_GET["success"] == "true") {?>
                                    <div class="row mb-3">
                                        <div class="col-lg-2 px-0"></div>
                                        <div class="col-lg-10">
                                            <span class="pl-2 bmd-help text-success"><?php echo ($lang == 'en') ? 'Thank you! We will contact you as soon as we can.' : '¡Gracias! Te responderemos tan pronto como sea posible.'; ?></span>
                                        </div>
                                    </div>
                                    <?php } ?>
                                    <div class="row mb-4">
                                        <div class="col-lg-2 px-0"></div>
                                        <div class="col-lg-10">
                                            <div class="g-recaptcha" data-sitekey="6LftR4AkAAAAABnVD3zESlvZOf80LLLTiOk90IFL"></div> 
                                            <?php if($empty_captcha){ ?>
                                                <span class="pl-2 bmd-help text-danger"><?php echo ($lang == 'en') ? 'Please check the captcha.' : 'Favor resuelva el captcha'; ?></span>
                                            <?php } else if (!$valid_captcha) {?>
                                            <span class="pl-2 bmd-help text-danger">Invalid captcha.</span>
                                            <?php } ?>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end pt-2">
                                        <button type="submit" class="btn btn-lg pe-0">
                                            Enviar
                                            <img src="/assets/img/icons/arrow-next.svg" width="25" height="25" class="ms-1">
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
                <div class="col-md-6 pb-5">
                    <div class="card px-3 px-lg-0 border-0" style="height:100%;">
                        <iframe style="height:100%;" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3036.324626694042!2d-3.5722814848968802!3d40.44595146178621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42303ac3db0287%3A0xdddc27f312554e3!2sIPCore!5e0!3m2!1ses!2spy!4v1637294653235!5m2!1ses!2spy" allowfullscreen="" loading="lazy"></iframe>
                    </div>
                    <div class="mt-3 px-3 px-lg-0">
                        <p class="h6 text-end">
                            <img src="/assets/img/icons/location-red.svg" width="25" height="25">
                            IPCore Datacenters SL, Calle Marzo 16, 28022<br>
                            Madrid - <?php if($lang == 'es') {echo("España");} else {echo("Spain");} ?>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php footer($lang); ?>
    <!-- recaptcha js -->
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <?php if (isset($_GET['success']) && $_GET['success'] == 'true' && isset($_COOKIE['analytics-enabled']) && $_COOKIE['analytics-enabled'] === 'yes') { ?>
    <!-- Google Ads: contact-form conversion — fires only on successful submission, with consent. gtag is loaded in _head.php when analytics consent is given. -->
    <script>
        gtag('event', 'conversion', {'send_to': 'AW-16510474208/N3EOCJfPwMoZEOCv58A9'});
    </script>
    <?php } ?>
</body>

</html>