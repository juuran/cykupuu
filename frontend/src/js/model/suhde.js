class Suhde {

    /**
     * 
     * @param {Number} suhdeId 
     * @param {Object} suhdeTyyppi 
     * @param {Boolean} onkoYhdessa 
     * @param {Boolean} onkoNaimisissa 
     * @param {SuhdeLiitos} vanhempienSuhdeLiitokset 
     * @param {SuhdeLiitos} lastenSuhdeLiitokset 
     */
    constructor(suhdeId, suhdeTyyppi, onkoYhdessa, onkoNaimisissa, vanhempienSuhdeLiitokset, lastenSuhdeLiitokset) {
        this.id = suhdeId;
        this.suhdetyyppi.nimike = suhdeTyyppi;
        this.onkoYhdessa = onkoYhdessa;
        this.onkoNaimisissa = onkoNaimisissa;
        this.ylavirtaLiitokset = vanhempienSuhdeLiitokset;
        this.alavirtaLiitokset = lastenSuhdeLiitokset;

        // tästä alas suhteen metatietoja (piirtämiseen jne)
        this.ryhma = ryhma;
    }

    toString() {
        let vanhTeksti = "{";
        for (const vanhempi of this.ylavirtaLiitokset) {
            vanhTeksti = vanhTeksti + " " + vanhempi.etunimet + "; ";
        }
        vanhTeksti = vanhTeksti + "}";
        let lapsTeksti = "{ ";
        for (const lapsi of this.alavirtaLiitokset) {
            lapsTeksti = lapsTeksti + " " + lapsi.etunimet + "; ";
        }
        lapsTeksti = lapsTeksti + "}";

        return `${vanhTeksti} --> ${lapsTeksti}`;
    }

}

function luoSuhdeSolmutJaKaaret(suhteet) {
    let suhts = [];

    for (const suhde of Object.values(suhteet)) {
        // luo **solmut** suhteille
        const id = suhde.id;

        suhts.push({
            group: 'nodes',
            data: {
                id: id,
                label: `${suhde.suhdeTyyppi.nimike} (${id})`
            },
            scratch: {
                _itse: {
                    suhde: suhde,
                    toString: () => suhde.toString() + (suhde.ryhma ? `(r=${suhde.ryhma})` : "")
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
