import { htmlToNode } from "./komponentit.js";
import { kytkeNappaimienKuuntelija } from "../main.js";
import { Cykupuu as Cyk } from "../cykupuu.js";
import * as Util from "../util.js";

/**
 * Hyvin yksinkertainen ja monistettava kenttä formien tms sisään.
 */
class InputKentta {

    underlyingElement;
    #listenerFunction;
    #listenerKeyword;
    #containingElement;
    static nro = 1;

    constructor(listener, listenerKeyword, containingElement) {
        if (!listener || !listenerKeyword || !containingElement) {
            throw Error("Konstruktorille pitää antaa järkevät kentät.");
        }
        this.underlyingElement = null;  // "nollataan" aluksi ja aina alas mennessä
        this.#listenerFunction = listener;
        this.#listenerKeyword = listenerKeyword;
        this.#containingElement = containingElement;
    }

    up(name, className, value) {
        const html = `<input name=${name} id="kentta${InputKentta.nro++}" autocomplete=off class="${className}" value="${value}"/>`;
        this.underlyingElement = htmlToNode(html);
        this.underlyingElement.addEventListener(this.#listenerKeyword, this.#listenerFunction);
        this.#containingElement.appendChild(this.underlyingElement);
    }

    down() {
        if (!this.underlyingElement) {
            return;
        }
        this.underlyingElement.removeEventListener(this.#listenerKeyword, this.#listenerFunction);
        this.#containingElement.removeChild(this.underlyingElement);
        this.underlyingElement.remove();
        this.underlyingElement = null;
    }
}

/**
 * Hyvin yksinkertainen ja monistettava nappula formien tms sisään.
 */
class InputNappula {

    underlyingElement;
    #listenerFunction;
    #listenerKeyword;
    #containingElement;
    static nro = 1;

    constructor(listener, listenerKeyword, containingElement) {
        if (!listener || !listenerKeyword || !containingElement) {
            throw Error("Konstruktorille pitää antaa järkevät kentät.");
        }
        this.underlyingElement = null;  // "nollataan" aluksi ja aina alas mennessä
        this.#listenerFunction = listener;
        this.#listenerKeyword = listenerKeyword;
        this.#containingElement = containingElement;
    }

    up(text, className, name) {
        const html = `<button id="nappi${InputNappula.nro++}" name="${name}" class="${className}" type="button">${text}</button>`;
        this.underlyingElement = htmlToNode(html);
        this.underlyingElement.addEventListener(this.#listenerKeyword, this.#listenerFunction);
        this.#containingElement.appendChild(this.underlyingElement);
    }

    down() {
        if (!this.underlyingElement) {
            return;
        }
        this.underlyingElement.removeEventListener(this.#listenerKeyword, this.#listenerFunction);
        this.#containingElement.removeChild(this.underlyingElement);
        this.underlyingElement.remove();
        this.underlyingElement = null;
    }
}

class BaseFormi {
    underlyingElement;
    destroyerFunction;  // jätetään undefinediksi ja käytetään, jos määritetty
    #containingElement;
    #isBeingAnimated;

    /**
     * @param {Element} containingElement 
     */
    constructor(containingElement) {
        if (!containingElement) {
            throw Error("Konstruktorille pitää antaa containingElement mihin kiinnittyä.");
        }

        this.underlyingElement = null;  // "nollataan" aluksi ja aina alas mennessä
        this.#containingElement = containingElement;
        this.#isBeingAnimated = false;
    }

    _isBeingAnimated() {
        if (this.#isBeingAnimated) {
            return true;
        }
        return false;
    }

    _attach(html) {
        if (this._isBeingAnimated()) {
            return;
        }

        this.#isBeingAnimated = true;
        this.underlyingElement = htmlToNode(html);
        this.#containingElement.appendChild(this.underlyingElement);  // istutetaan paikalleen

        this.underlyingElement.classList.add("popup");  // ainoa mikä saa olla tässä kohtaa on "popup"
        this.underlyingElement.classList.add("syntynyt");  // on heti syntynyt

        (async () => {
            console.log(`${Date.now()}: odotetaan hetki, sitten todetaan animoinnin loppuneen`);
            await Util.sleep(Cyk.ANIMAATIO_PITUUS_SYNTYMA);
            this.#isBeingAnimated = false;
            console.log(`${Date.now()}: animointi on loppunut`);
        })();
    }

    #detach(hyvaksymisTeksti) {
        if (this._isBeingAnimated()) {
            return;
        }

        this.#isBeingAnimated = true;
        this.underlyingElement.classList.remove("syntynyt");

        if (hyvaksymisTeksti === "hyvaksyttiin") {
            this.underlyingElement.classList.add("hyvaksy");
        } else if (hyvaksymisTeksti === "kumottiin") {
            this.underlyingElement.classList.add("kumoa");
        }

        (async () => {
            await Util.sleep(Cyk.ANIMAATIO_PITUUS_KUOLEMA);
            // tuhotaan perivän koodissa määritetty osuus tai sitten ei voida periä ollenkaan...
            if (this.destroyerFunction) {
                this.destroyerFunction();
            }
            this.#removeInstantly();
        })();
    }

    #removeInstantly() {
        console.log(`removeInstantly was called for ${this.underlyingElement} contained within ${this.#containingElement}`);
        this.#isBeingAnimated = false;

        this.#containingElement.removeChild(this.underlyingElement);  // nykäistään irti
        this.underlyingElement.remove();

        // tyhjätään pohjalla oleva DOM olio, koska luodaan aina uusi
        this.underlyingElement = null;
    }

    isUp() {
        if (this.underlyingElement) {
            return true;
        }
        return false;
    }

    /**
     * Komponentin "ylös nostamisen" logiikka. (Metodissa on kutsuttava "perittyä" _attach metodia järjellisellä html tekstillä.)
     */
    up() {
        throw Error("Määrittele minut!");
    }

    /**
     * Komponentin laskemisen logiikka. (Metodia ei kirjoiteta itse, vaan ylimääräinen logiikka sijoitetaan _downSupplement():in alle, joka suoritetaan aina ennen kuin komponentti laitetaan alas.)
     */
    down(hyvaksymisTeksti, removeImmediately = false) {
        if (!this.isUp()) {
            return;
        }

        if (removeImmediately) {
            this._downSupplement(true);
            this.#removeInstantly();
            return;
        }

        this._downSupplement();
        this.#detach(hyvaksymisTeksti);
    }

    /**
     * Ylikirjoita jos, tarvetta ylimääräiselle sulkemislogiikalle.
     * @param {Boolean} forceRemove voidaan käyttää määrittämään tilanne, että suljetaan joka tapauksessa
     */
    _downSupplement(forceRemove = false) {
    }
}


class FormHenkiloa extends BaseFormi {

    #inputListener;
    #buttonListener;
    etunimetKentta;
    sukuNimetKentta;
    tallennaNappi;
    kumoaNappi;

    /**
     * 
     * @param {EventListener} inputListener 
     * @param {EventListener} buttonListener
     * @param {Element} containingElement 
     */
    constructor(inputListener, buttonListener, containingElement) {
        super(containingElement);
        this.#inputListener = inputListener;
        this.#buttonListener = buttonListener;
        this.etunimetKentta = null;
        this.sukuNimetKentta = null;
    }

    up(itseOlio) {
        if (this.isUp()) {
            return;
        }

        this.destroyerFunction = null;  // tätä ei tarvita nyt
        document.getElementById("tietojenMuokkaus").classList.remove("piilossa");

        const html =
            '<form class="ikkuna" action="">' +
            '    <label class="forminRivi" id="labelForEtun" for="etun">Etunimet:</label>' +
            '    <label class="forminRivi" id="labelForSukun" for="sukun">Sukunimet:</label>' +
            '    <span class="forminRivi" id="spanForTallennaKumoa" />' +
            '</form>';
        this._attach(html);

        this.etunimetKentta = new InputKentta(this.#inputListener, "input", document.getElementById("labelForEtun"));
        this.sukuNimetKentta = new InputKentta(this.#inputListener, "input", document.getElementById("labelForSukun"));
        this.tallennaNappi = new InputNappula(this.#buttonListener, "click", document.getElementById("spanForTallennaKumoa"));
        this.kumoaNappi = new InputNappula(this.#buttonListener, "click", document.getElementById("spanForTallennaKumoa"));
        this.etunimetKentta.up("etun", "forminKentta", itseOlio.etunimet);
        this.sukuNimetKentta.up("sukun", "forminKentta", itseOlio.sukunimet);
        this.tallennaNappi.up("Tallenna", "forminNappi", "tallennaHenkilo");
        this.kumoaNappi.up("Kumoa", "forminNappi", "kumoaHenkilo");

        kytkeNappaimienKuuntelija(false);  // muut näppäinkuuntelijat pois, koska syötetään nimiä yms
    }

    _downSupplement(forceRemove = false) {
        if (this._isBeingAnimated() && forceRemove === false) {  // poistutaan, koska pääsulkumetodikin tekee niin
            return;
        }

        this.etunimetKentta.down();
        this.sukuNimetKentta.down();
        this.tallennaNappi.down();
        this.kumoaNappi.down();

        this.etunimetKentta = null;
        this.sukuNimetKentta = null;
        this.tallennaNappi = null;
        this.kumoaNappi = null;

        document.getElementById("labelForEtun").remove();
        document.getElementById("labelForSukun").remove();
        document.getElementById("spanForTallennaKumoa").remove();

        kytkeNappaimienKuuntelija(true);  // muut näppäinkuuntelijat taas sallittuja

        this.destroyerFunction = () => {
            document.getElementById("tietojenMuokkaus").classList.add("piilossa");
        };
    }
}

class FormSuhdetta extends BaseFormi {
    // implement tuon toisen jälkeen!
}

export { FormHenkiloa, FormSuhdetta };
