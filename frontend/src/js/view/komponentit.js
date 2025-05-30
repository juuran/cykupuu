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
    _underlyingElement;
    #listenerFunction;
    #listenerKeyword;
    #containingElement;

    constructor(listener, listenerKeyword, containingElement) {
        if (!(listener && listenerKeyword && containingElement)) {
            throw Error("All of the fields must contain relevant values in ElementAry constructor.");
        }

        this._underlyingElement = null;
        this.#listenerFunction = listener;
        this.#listenerKeyword = listenerKeyword;
        this.#containingElement = containingElement;
    }

    _attach(html) {
        this._underlyingElement = htmlToNode(html);
        this.#containingElement.appendChild(this._underlyingElement);
        this._underlyingElement.addEventListener(this.#listenerKeyword, this.#listenerFunction);
    }

    _detach() {
        this._underlyingElement.removeEventListener(this.#listenerKeyword, this.#listenerFunction);
        this.#containingElement.removeChild(this._underlyingElement);
        this._underlyingElement.remove();

        // tyhjätään muut paitsi containing element, koska tähän kytkeydytään taas _attachissa
        this._underlyingElement = null;
        this.#listenerFunction = null;
        this.#listenerKeyword = null;
    }

    _isUp() {
        if (this._underlyingElement) {
            return true;
        }
        return false;
    }
}

class inputHakuKentta extends ElementAry {
    up() {
        if (this._isUp()) { // jos jo olemassa, niin oikeasti halutaan vain focus siihen
            this._underlyingElement.focus();
            return;
        }

        // muussa tapauksessa luodaan
        this._attach('<input id="hakukentta" placeholder="Hae henkilöä nimeltä"/>');
        this._underlyingElement.focus();
        kytkeNappaimenKuuntelija(false);  // muut näppäinkuuntelijat pois
    }

    down() {
        if (this._isUp()) {
            this._detach();
            kytkeNappaimenKuuntelija(true);  // muut näppäinkuuntelijat takaisin
        }
    }
}

export { inputHakuKentta };
