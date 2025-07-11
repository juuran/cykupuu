import { getHenkilot } from "../main.js";

/**
 * Suhdetta kuvaava ja pitkälti tietokantaa vastaava luokka.
 */
class Suhde {

    id;
    suhdeTyyppi;
    onkoYhdessa;
    onkoNaimisissa;
    ylavirtaLiitokset;
    alavirtaLiitokset;
    ryhma;
    /**
     * 
     * @param {Number} suhdeId 
     * @param {SuhdeTyyppi} suhdeTyyppi 
     * @param {Boolean} onkoYhdessa 
     * @param {Boolean} onkoNaimisissa 
     * @param {SuhdeLiitos} vanhempienSuhdeLiitokset 
     * @param {SuhdeLiitos} lastenSuhdeLiitokset 
     */
    constructor(suhdeId, suhdeTyyppi, onkoYhdessa, onkoNaimisissa, vanhempienSuhdeLiitokset, lastenSuhdeLiitokset) {
        this.id = suhdeId;
        this.suhdeTyyppi = suhdeTyyppi;
        this.onkoYhdessa = onkoYhdessa;
        this.onkoNaimisissa = onkoNaimisissa;
        this.ylavirtaLiitokset = vanhempienSuhdeLiitokset;
        this.alavirtaLiitokset = lastenSuhdeLiitokset;
    }

    toString() {
        const henkilot = getHenkilot();

        let vanhTeksti = "{";
        if (this.ylavirtaLiitokset.length > 0) {
            for (const vanhempi of this.ylavirtaLiitokset) {
                const henkId = vanhempi.id.henkiloId;  // henkilön tunniste henkilot "mapissa" (perus object)
                const vanhemmanEkaEtunimi = henkilot[henkId].etunimet.split(" ")[0];
                vanhTeksti = vanhTeksti + vanhemmanEkaEtunimi + ", ";
            }
            vanhTeksti = vanhTeksti.substring(0, vanhTeksti.length - 2);
            vanhTeksti = vanhTeksti + "}";
        } else {
            vanhTeksti += "?}";
        }

        let lapsTeksti = "{";
        if (this.alavirtaLiitokset.length > 0) {
            for (const lapsi of this.alavirtaLiitokset) {
                const henkId = lapsi.id.henkiloId;
                const lapsenEkaEtunimi = henkilot[henkId].etunimet.split(" ")[0];
                lapsTeksti = lapsTeksti + lapsenEkaEtunimi + ", ";
            }
            lapsTeksti = lapsTeksti.substring(0, lapsTeksti.length - 2);
            lapsTeksti = lapsTeksti + "}";
        } else {
            lapsTeksti = null;
        }

        return lapsTeksti ? `${vanhTeksti}-->${lapsTeksti}` : `${vanhTeksti}`;
    }

    getNakyvaNimi() {
        if (this.suhdeTyyppi.nimike === "avioliitto") {
            return "❤️⛪";
        }
        else if (this.suhdeTyyppi.nimike === "avoliitto") {
            return "❤️";
        }
        else if (this.suhdeTyyppi.nimike === "eronnut") {
            return "💔";
        }
        else if (this.suhdeTyyppi.nimike === "polygamia") {
            return "💕";
        }
        else if (this.suhdeTyyppi.nimike === "") {
            return "💕";
        }
        else {
            return `${this.suhdeTyyppi.nimike} (${this.id})`;
        }
    }

    static reviver(key, value) {  // kaikki nämä tunnistetaan "muotonsa" perusteella eli key:llä ei väliä - se on liian häilyvä
        // 2.1) id‐pair -> SuhdeLiitos
        if (
            value &&
            typeof value === 'object' &&
            'id' in value &&
            'onkoBiologinen' in value &&
            'selite' in value  // TODO: Muista poistaa tämä, jos poistat selitteen, muuten hajoaa!
        ) {
            return new SuhdeLiitos(value.id.henkiloId, value.id.suhdeId, value.onkoBiologinen);
        }

        // 2.2) suhdeTyyppi -> SuhdeTyyppi
        if (
            value &&
            typeof value === 'object' &&
            'nimike' in value &&
            Object.keys(value).length === 1) {  // tämä vain sanoo, ettei muita kenttiä kuin "nimike"
            return new SuhdeTyyppi(value.nimike);
        }

        // 2.3) full Suhde object
        if (
            value &&
            typeof value === 'object' &&
            'id' in value &&
            'onkoNaimisissa' in value &&
            'onkoYhdessa' in value &&
            Array.isArray(value.ylavirtaLiitokset) &&
            Array.isArray(value.alavirtaLiitokset)
        ) {
            return new Suhde(value.id, value.suhdeTyyppi, value.onkoYhdessa, value.onkoNaimisissa, value.ylavirtaLiitokset, value.alavirtaLiitokset);
        }

        // kaikki muu on primitiivejä tai muuta roskaa (ja sitä on muuten paljon), niihin ei kosketa!
        return value;
    }

}

class SuhdeLiitos {

    constructor(henkiloId, suhdeId, onkoBiologinen) {
        this.id = {};
        this.id.henkiloId = henkiloId;
        this.id.suhdeId = suhdeId;
        this.onkoBiologinen = onkoBiologinen;
    }

    toString() {
        return "moro!";
    }

}

class SuhdeTyyppi {

    constructor(nimike) {
        this.nimike = nimike;
    }

}

function luoSuhdeSolmutJaKaaret(suhteet) {
    let suhts = [];

    for (const suhde of Object.values(suhteet)) {
        // luo **solmut** suhteille
        const id = suhde.id;
        const nakyvaNimi = suhde.getNakyvaNimi();

        suhts.push({
            group: 'nodes',
            data: {
                id: id,
                label: `${nakyvaNimi}`
            },
            scratch: {
                _itse: {
                    suhde: suhde,
                    toString: () => suhde.toString()
                }
            }
        });

        // luo **kaaret** suhteen "vanhemmista" suhde-solmuun
        for (const vanhemmanSuhdeLiitos of suhde.ylavirtaLiitokset) {
            const vanhempiId = vanhemmanSuhdeLiitos.id.henkiloId;
            suhts.push({
                group: 'edges',
                data: {
                    id: `${vanhempiId}_${id}`,  // (kenttä ei näy missään
                    source: vanhempiId,
                    target: id
                },
                classes: 'round-taxi'
            });
        }

        // luo **kaaret** suhde-solmusta lapsiin
        for (const lapsenSuhdeLiitos of suhde.alavirtaLiitokset) {
            const lapsiId = lapsenSuhdeLiitos.id.henkiloId;
            suhts.push({
                group: 'edges',
                data: {
                    id: `${id}_${lapsiId}`,  // (kenttä ei näy missään)
                    source: id,
                    target: lapsiId
                },
                classes: 'round-taxi'
            });
        }
    }

    return suhts;
}

export { Suhde, luoSuhdeSolmutJaKaaret };
