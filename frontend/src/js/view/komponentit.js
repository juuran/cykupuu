/**
 * Kokoelma piirrettäviä ja logiikkaa sisältäviä komponentteja. Logiikka tosin ei kuulu tänne, vaan toteutetaan kuuntelijan avulla. Funktio
 * htmlToNode löytyi täältä:
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 */

import { kytkeNappaimienKuuntelija } from "../main.js";
import * as Util from "../util.js";

/**
 * @param {String} HTML representing a single node (which might be an Element,
                   a text node, or a comment).
 * @return {Node}
 */
function htmlToNode(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const nNodes = template.content.childNodes.length;
    if (nNodes !== 1) {
        throw new Error(
            `html parameter must represent a single node; got ${nNodes}. ` +
            'Note that leading or trailing spaces around an element in your ' +
            'HTML, like " <img/> ", get parsed as text nodes neighbouring ' +
            'the element; call .trim() on your input to avoid this.'
        );
    }
    return template.content.firstChild;
}

class ElementAry {
    underlyingElement;
    #listenerFunction;
    #listenerKeyword;
    #containingElement;
    #isBeingAnimated;

    /**
     * @param {EventListener} listener 
     * @param {String} listenerKeyword 
     * @param {Element} containingElement 
     */
    constructor(listener, listenerKeyword, containingElement) {
        if (!containingElement) {
            throw Error("Konstruktorille pitää antaa containingElement mihin kiinnittyä.");
        }

        this.underlyingElement = null;  // "nollataan" aluksi ja aina alas mennessä
        this.#listenerFunction = listener;
        this.#listenerKeyword = listenerKeyword;
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
        this.#containingElement.appendChild(this.underlyingElement);
        if (this.#listenerFunction) {
            this.underlyingElement.addEventListener(this.#listenerKeyword, this.#listenerFunction);
        }

        this.underlyingElement.classList.remove("olemassa");  // ei saa olla olemassa vielä!
        this.underlyingElement.classList.add("komponentti");
        this.#animateBirth();
    }

    async #animateBirth() {  // Tehtävä pienellä viiveellä, tai ei alkaisi animoida,
        await Util.sleep(0.01);  // koska transitio ei ymmärrä olevansa käynnissä.
        this.underlyingElement.classList.add("olemassa");

        this.underlyingElement.addEventListener("transitionend", e => {
            this.#isBeingAnimated = false;
        });
    }

    #detach() {
        if (this._isBeingAnimated()) {
            return;
        }

        this.#isBeingAnimated = true;
        this.underlyingElement.classList.remove("olemassa");

        this.underlyingElement.addEventListener("transitionend", e => {
            this.#removeInstantly();
        }, { once: true });
    }

    #removeInstantly() {
        console.log(`removeInstantly was called for ${this.underlyingElement} contained within ${this.#containingElement}`);
        this.#isBeingAnimated = false;

        if (this.#listenerFunction) {
            this.underlyingElement.removeEventListener(this.#listenerKeyword, this.#listenerFunction);
        }
        this.#containingElement.removeChild(this.underlyingElement);
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
    down(removeImmediately = false) {
        if (!this.isUp()) {
            return;
        }

        if (removeImmediately) {
            this._downSupplement(true);
            this.#removeInstantly();
            return;
        }

        this._downSupplement();
        this.#detach();
    }

    /**
     * Ylikirjoita jos, tarvetta ylimääräiselle sulkemislogiikalle.
     * @param {Boolean} forceRemove voidaan käyttää määrittämään tilanne, että suljetaan joka tapauksessa
     */
    _downSupplement(forceRemove = false) {
    }
}

class InputHakuKentta extends ElementAry {
    up() {
        if (this.isUp()) { // jos jo olemassa, niin oikeasti halutaan vain focus siihen
            this.underlyingElement.focus();
            return;
        }

        // muussa tapauksessa luodaan
        const html = '<input id="hakukentta" placeholder="Hae henkilöä nimeltä" autocomplete=off name=haku/>';
        this._attach(html);
        this.underlyingElement.focus();
        kytkeNappaimienKuuntelija(false);  // muut näppäinkuuntelijat pois
    }

    _downSupplement() {
        kytkeNappaimienKuuntelija(true);  // muut näppäinkuuntelijat takaisin
    }
}

class ButtPainike extends ElementAry {

    static nro = 1;

    up(teksti) {
        if (this.isUp()) {
            return;
        }

        const html = `<button id="buttPainike${ButtPainike.nro++}">${teksti}</button>`;
        this._attach(html);
    }
}

export { InputHakuKentta, ButtPainike, htmlToNode };
