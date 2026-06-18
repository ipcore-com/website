// Parallax
//const parallaxElements = document.getElementsByClassName('ip-parallax');
//new simpleParallax(parallaxElements, { scale: 1.5 });

// Popovers
let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
let popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
});

// Cookies and settings
const cookiesSettingsEl = document.getElementById('cookiesSettingsModal');
const cookiesSettingsModal = new bootstrap.Modal(cookiesSettingsEl, {});
let cookie = readCookie('seen-cookie-message');

// get lang from pathname
let lang = 'en';
if(window.location.pathname.startsWith('/es/')){
    lang = 'es';
}

// Cookies management
let preference_cookies_enabled = true;
let analytics_cookies_enabled = true;

var cookiesModal;

function createCookie(name, value, days, path) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=" + path;
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function showCookiesPanel() {
    cookiesModal.show();
}

function hideCookiesPanel() {
    cookie = readCookie('seen-cookie-message');
    if (cookie == null || cookie != 'yes') {
        return;
    }      
    cookiesModal.hide();
}

function acceptCookies() {
    if(preference_cookies_enabled || analytics_cookies_enabled){
        createCookie('seen-cookie-message', 'yes', 30, '/');
        if(preference_cookies_enabled){
            createCookie('preferences-enabled', 'yes', 30, '/');
        }
        if(analytics_cookies_enabled){
            createCookie('analytics-enabled', 'yes', 30, '/');
        }
        hideCookiesPanel();
        cookiesSettingsModal.hide();
        // Reload so the server re-renders with the consented analytics/marketing scripts
        window.location.reload();
    }
}

function rejectCookies() {
    window.location.reload();
}

function cookiesSettings() {
    hideCookiesPanel();
    cookiesSettingsModal.show();
}

function changeCookiesSettings(el, event) {
    el.checked = true;
    event.preventDefault();
    if(lang == 'es'){
        alert('Estas cookies son estrictamente necesarias para este sitio web. ' +
            'No puedes desactivar esta categoría de cookies. ¡Gracias por tu comprensión!');
    }
    else{
        alert('These cookies are strictly necessary for this website. ' +
            'You cannot deactivate this category of cookies. Thanks for your understanding!');
    }
    return false;
}

function renderConsentRadio(triggerEl) {
    const sufix = Math.floor(Math.random() * 100);
    const name = triggerEl.getAttribute('data-ip-cookie-item');
    const div = document.createElement("div");
    div.classList.add("btn-group");
    div.setAttribute("role", "group");
    div.setAttribute("aria-label", "Basic radio toggle button group");
    if(lang == 'es'){
        div.innerHTML = `
            <div class="btn-group ip-consent-radio" role="group" aria-label="">
                <input type="radio" class="btn-check" name="${name}-radio" value="rechazar" id="${name}-rechazar-${sufix}" autocomplete="off" onchange="cookiesRadioChanged();">
                <label class="btn btn-outline-danger" for="${name}-rechazar-${sufix}">Rechazar</label>
            
                <input type="radio" class="btn-check" name="${name}-radio" value="aceptar" id="${name}-aceptar-${sufix}" autocomplete="off" onchange="cookiesRadioChanged();">
                <label class="btn btn-outline-success" for="${name}-aceptar-${sufix}">Aceptar</label>
            </div>
            `;
    }
    else{
        div.innerHTML = `
        <div class="btn-group ip-consent-radio" role="group" aria-label="">
            <input type="radio" class="btn-check" name="${name}-radio" value="rechazar" id="${name}-rechazar-${sufix}" autocomplete="off" onchange="cookiesRadioChanged();">
            <label class="btn btn-outline-danger" for="${name}-rechazar-${sufix}">Reject</label>
        
            <input type="radio" class="btn-check" name="${name}-radio" value="aceptar" id="${name}-aceptar-${sufix}" autocomplete="off" onchange="cookiesRadioChanged();">
            <label class="btn btn-outline-success" for="${name}-aceptar-${sufix}">Accept</label>
        </div>
        `;
    }
    triggerEl.appendChild(div);
    return div;
}

let consentRadioTriggerList = [].slice.call(document.querySelectorAll('[data-ip-cookie-item]'));
let consentRadioList = consentRadioTriggerList.map(function(consentRadioTriggerEl) {
    return renderConsentRadio(consentRadioTriggerEl);
});

let cookiesCollapsibles = document.querySelectorAll('.ip-cookies .accordion-item')
cookiesCollapsibles.forEach(el => {
    el.addEventListener('show.bs.collapse', function() {
        el.classList.remove('justify-content-between');
        el.classList.remove('align-items-center');
        el.classList.add('flex-column');
    });
    el.addEventListener('hide.bs.collapse', function() {
        el.classList.remove('flex-column');
        el.classList.add('justify-content-between');
        el.classList.add('align-items-center');
    });
});

function cookiesRadioChanged() {
    console.log("in cookies changed");
    const buttonsDefault = document.getElementById('ip-cookies-buttons-default');
    const buttonsChanged = document.getElementById('ip-cookies-buttons-changes');
    buttonsDefault.classList.add('d-none');
    buttonsChanged.classList.remove('d-none');

    if(document.getElementsByName('almacenaje-radio')[0].checked){
        preference_cookies_enabled = false;
    }
    else if(!document.getElementsByName('almacenaje-radio')[0].checked && !document.getElementsByName('almacenaje-radio')[1].checked){
        preference_cookies_enabled = false;
    }
    else{
        preference_cookies_enabled = true;
    }

    if(document.getElementsByName('analytics-radio')[0].checked){
        analytics_cookies_enabled = false;
    }
    else if(!document.getElementsByName('analytics-radio')[0].checked && !document.getElementsByName('analytics-radio')[1].checked){
        analytics_cookies_enabled = false;
    }
    else{
        analytics_cookies_enabled = true;
    }
}


window.onload = function() {
    if (cookie == null || cookie != 'yes') {
        cookiesModal = new bootstrap.Modal(document.getElementById('cookieModal'), {
            backdrop: 'static', 
            keyboard: false
        });
        showCookiesPanel();
    }
}