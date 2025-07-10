import { getHenkilot, getSuhteet } from "../main.js";

class Henkilo {
    id;
    etunimet;
    sukunimet;
    vanhempiSuhteet;
    pariSuhteet;
    syvyys;
    /**
     * 
     * @param {Number} henkiloId 
     * @param {String} etunimet 
     * @param {String} sukunimet 
     * @param {SuhdeLiitos} vanhempiSuhdeLiitokset 
     * @param {SuhdeLiitos} pariSuhdeLiitokset 
     */
    constructor(henkiloId, etunimet, sukunimet, vanhempiSuhdeLiitokset, pariSuhdeLiitokset) {
        this.id = henkiloId;
        this.etunimet = etunimet;
        this.sukunimet = sukunimet;
        this.vanhempiSuhteet = vanhempiSuhdeLiitokset;
        this.pariSuhteet = pariSuhdeLiitokset;
    }

    toString() {
        // TODO: Tee tämä joskus! Tehtäisiin jotenkin näin, mutta en nyt jaksa ajatella.
        // if (this.vanhempiSuhteet.length >= 1) {
        //     const suhteet = getSuhteet();
        //     const vs = suhteet[this.vanhempiSuhteet.id.suhdeId];
        // }
        // if (this.pariSuhteet.length >= 1) {
        //     const suhteet = getSuhteet();
        //     let teksti = "";
        //     for (suhde : this.pariSuhteet) {
        //         teksti = tesksti + suhteet[suhde.id.suhdeId].toString();
        //     }
        // }
        return `[ Nimi: ${this.id}. VanhempiSuhteet: (${this.vanhempiSuhteet}). PariSuhteet: (${this.pariSuhteet}). (s=${this.syvyys}) ]`;
    }

    // tällä parsitaan saatu data suoraan tähän muotoon
    static reviver(key, value) {
        if (
            value &&
            typeof value === 'object' &&
            'id' in value &&
            'etunimet' in value &&
            'sukunimet' in value &&
            'vanhempiSuhteet' in value &&
            'pariSuhteet' in value
        ) {
            return new Henkilo(value.id, value.etunimet, value.sukunimet, value.vanhempiSuhteet, value.pariSuhteet);
        }

        return value;  // muihin ei halutakaan koskea (primitiivejä yms)
    }

}

function luoHenkiloSolmut(henkilot, suhteet, suhteitaPerSyvyys) {
    let henks = [];

    // luo solmut henkilöille
    for (const henkilo of Object.values(henkilot)) {

        henks.push({
            group: 'nodes',
            data: {
                id: henkilo.id,
                label: `${henkilo.etunimet}\n${henkilo.sukunimet}`  // tämä sallii monirivisen tekstin
            },
            classes: 'multiline-manual',
            scratch: {
                _itse: {
                    henkilo: henkilo,
                    toString: () => henkilo.toString()
                }
            }
        });

    }

    return henks;
}

function haeHenkilonRyhma(henkilo, suhdeData, suhteitaPerSyvyys) {  // TODO: Siisti tämä funktio!
    const henkilonSyvyys = henkilo.syvyys;
    const pariSuhteenId = henkilo.pariSuhteet[0].id.suhdeId;

    if (henkilo.vanhempiSuhteet[0]) {  // paras oletus hakea vanhemman ryhmä...
        const vanhempiSuhteenId = henkilo.vanhempiSuhteet[0].id.suhdeId;  // TODO: Muista korvata nämä lopulta biologisen ja sosiaalisen vanhemman valinnalla!
        return suhdeData[vanhempiSuhteenId].ryhma;
    }
    else if (suhteitaPerSyvyys.size > 0) {  // ... toiseksi paras hakea tieto mapista ...
        if (henkilonSyvyys === 1) {  // juurisolmuille oma käsittely, jossa katsotaan lapsia sisältävä (s + 1) suhde
            let suhdeIdTaulukko = suhteitaPerSyvyys.get(henkilonSyvyys + 1);
            for (const suhdeId of suhdeIdTaulukko) {
                if (suhdeId === pariSuhteenId) { //henkilo.lapsiSuhteet[0].suhdeId
                    const suhteenIndex = suhdeIdTaulukko.findIndex(alkio => alkio === suhdeId);
                    return suhteenIndex + 1;
                }
            }
        }
        return suhteitaPerSyvyys.get(henkilonSyvyys - 1).length + 1;  // jos ei vanhempaa, haetaan yllä olevien (s - 1) suhteiden määrä + 1    
    }
    else {
        if (henkilo.pariSuhteet[0]) {  // ... muutoin parisuhteen perusteella
            return suhdeData[pariSuhteenId].ryhma;
        }
    }
}

export { Henkilo, luoHenkiloSolmut, haeHenkilonRyhma };
