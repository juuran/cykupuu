class Suhde {

    constructor(suhdeId, suhdetyyppi, onkoYhdessa, onkoNaimisissa, vanhempienSuhdeLiitokset, lastenSuhdeLiitokset, ryhma) {
        this.id = suhdeId;
        this.suhdetyyppi = suhdetyyppi;
        this.onkoYhdessa = onkoYhdessa;
        this.onkoNaimisissa = onkoNaimisissa;
        this.ylavirtaLiitokset = vanhempienSuhdeLiitokset;
        this.alavirtaLiitokset = lastenSuhdeLiitokset;
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
        let tempSuhdeId = suhde.suhdeTyyppi.nimike + " (" + suhde.id + ")";
        const ryhmani = suhde.ryhma ? suhde.ryhma : 1;  // TODO: Poista tämä väliaikainen tukirakenne!!!

        suhts.push({
            group: 'nodes',
            data: {
                id: tempSuhdeId,
                weight: ryhmani
            },
            scratch: {
                _itse: {
                    suhde: suhde,
                    toString: () => suhde.toString() + `(r=${ryhmani})`,
                }
            }
        });

        // luo **kaaret** suhteen "vanhemmista" suhde-solmuun
        for (const vanhemmanSuhdeLiitos of suhde.ylavirtaLiitokset) {
            const vanhempiId = vanhemmanSuhdeLiitos.id.henkiloId;
            suhts.push({
                group: 'edges',
                data: {
                    id: vanhempiId + tempSuhdeId,  // (kenttä ei näy missään
                    source: vanhempiId,
                    target: tempSuhdeId
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
                    id: tempSuhdeId + lapsiId,  // (kenttä ei näy missään)
                    source: tempSuhdeId,
                    target: lapsiId
                },
                classes: 'round-taxi'
            });
        }
    }

    return suhts;
}

export { Suhde, luoSuhdeSolmutJaKaaret };
