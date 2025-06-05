/**
 * Kokoelma piirrettäviä ja logiikkaa sisältäviä komponentteja. Logiikka tosin ei kuulu tänne, vaan toteutetaan kuuntelijan avulla. Funktio
 * htmlToNode löytyi täältä:
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 */

import { Henkilo } from "../model/henkilo.js";
import { kytkeNappaimenKuuntelija } from "../main.js";

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

    /**
     * @param {EventListener} listener 
     * @param {String} listenerKeyword 
     * @param {Element} containingElement 
     */
    constructor(listener, listenerKeyword, containingElement) {
        if (!(listener && listenerKeyword && containingElement)) {
            throw Error("All of the fields must contain relevant values in ElementAry constructor.");
        }

        this.underlyingElement = null;
        this.#listenerFunction = listener;
        this.#listenerKeyword = listenerKeyword;
        this.#containingElement = containingElement;
    }

    _attach(html) {
        this.underlyingElement = htmlToNode(html);
        this.#containingElement.appendChild(this.underlyingElement);
        this.underlyingElement.addEventListener(this.#listenerKeyword, this.#listenerFunction);
    }

    #detach() {
        this.underlyingElement.removeEventListener(this.#listenerKeyword, this.#listenerFunction);
        this.#containingElement.removeChild(this.underlyingElement);
        this.underlyingElement.remove();

        // tyhjätään muut paitsi containing element, koska tähän kytkeydytään taas _attachissa
        this.underlyingElement = null;
        this.#listenerFunction = null;
        this.#listenerKeyword = null;
    }

    isUp() {
        if (this.underlyingElement) {
            return true;
        }
        return false;
    }

    down() {
        if (this.isUp()) {
            this.#detach();
        }

        this.downSupplement();
    }

    /**
     * Ylikirjoita minut, jos tarve ylimääräiselle sulkemiselogiikalle.
     */
    downSupplement() {
    }
}

class InputHakuKentta extends ElementAry {
    up() {
        if (this.isUp()) { // jos jo olemassa, niin oikeasti halutaan vain focus siihen
            this.underlyingElement.focus();
            return;
        }

        // muussa tapauksessa luodaan
        const html = '<input id="hakukentta" placeholder="Hae henkilöä nimeltä" autocomplete=off name=haku />';
        this._attach(html);
        this.underlyingElement.focus();
        kytkeNappaimenKuuntelija(false);  // muut näppäinkuuntelijat pois
    }

    downSupplement() {
        kytkeNappaimenKuuntelija(true);  // muut näppäinkuuntelijat takaisin
    }
}

class ButtonUusiAikuinen extends ElementAry {
    up(teksti) {
        if (this.isUp()) { // jos jo olemassa, niin oikeasti halutaan vain focus siihen
            return;
        }

        // muussa tapauksessa luodaan
        const html = `<button id="uusiAikuinen">${teksti}</button>`;
        this._attach(html);
    }
}

class ButtonUusiLapsi extends ElementAry {
    up(teksti) {
        if (this.isUp()) { // jos jo olemassa, niin oikeasti halutaan vain focus siihen
            return;
        }

        // muussa tapauksessa luodaan
        const html = `<button id="uusiLapsi">${teksti}</button>`;
        this._attach(html);
    }
}

export { InputHakuKentta, ButtonUusiAikuinen, ButtonUusiLapsi };
