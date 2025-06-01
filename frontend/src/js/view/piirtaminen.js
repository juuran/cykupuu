import { Cykupuu as Cyk } from "../cykupuu.js";
import { haeHenkilonRyhma } from "../model/henkilo.js";

/**
 * Tänne piirtämiseen ja näyttämiseen liittyvät algoritmit.
 */


function asetaGraafinPositiot(solmut, suhdeData) {
    let suhteenLapsistaPiirretty = new Map();   // montako suhteen lapsista piirretty, esim. ({key: suhde1, value: 3}, {key: suhde2, value: 1})
    let suhteenAikuisistaPiirretty = new Map();  // sama periaate, mutta juurisolmuille (koska heillä ei ole vanhempia, mutta on lapset, muutoin ei olisi heitä ollut tarpeen sukupuuhun lisäilläkään... saati edes mahdollista)

    for (const solmu of solmut) {

        if (solmu.scratch()._itse.henkilo) {  // piirretään henkilo-solmut

            const henkilo = solmu.scratch()._itse.henkilo;

            const pystyPiste = henkilo.syvyys * 100;
            let vaakaPiste;
            const vanhempiSuhdeLiitos = henkilo.vanhempiSuhteet[0];
            let monesko;  // eli kuinka mones sisaruskatraan lapsista kyseessä
            let monesta;  // kuinka monta sisarusta yhteensä
            if (vanhempiSuhdeLiitos) {
                // jos henkilöllä on vanhemmat, kuvio selkeä: hän on niin mones piirrettävä kuin mitä sisaruksista on piirretty
                const vanhempiSuhdeId = vanhempiSuhdeLiitos.id.suhdeId;

                if (suhteenLapsistaPiirretty.has(vanhempiSuhdeId)) {
                    monesko = suhteenLapsistaPiirretty.get(vanhempiSuhdeId);  // monesko indeksoidaan 0:sta lähtien (piirtoteknisistä syistä)
                    suhteenLapsistaPiirretty.set(vanhempiSuhdeId, monesko + 1);
                }
                else {
                    monesko = 0;
                    suhteenLapsistaPiirretty.set(vanhempiSuhdeId, 1);
                }

                // "monesta" määritys kys. (vanhempi)suhteen lasten lkm mukaan
                monesta = suhdeData[vanhempiSuhdeId].alavirtaLiitokset.length;
            }
            else {
                // jos ei vanhempia (juurisolmu), piirretään ensisijaisesti yhdessä olevan suhteen mukaan tai sitten ensimmäisen suhteen
                let pariSuhdeId = null;
                for (const pariSuhdeLiitos of henkilo.pariSuhteet) {
                    const pariSuhde = suhdeData[pariSuhdeLiitos.id.suhdeId];
                    if (pariSuhde.onkoYhdessa) {
                        pariSuhdeId = pariSuhde.id;
                        break;
                    }
                }
                if (pariSuhdeId === null) {
                    pariSuhdeId = henkilo.pariSuhteet[0].id.suhdeId;  // (jos ei löydy, valitaan 1. pariSuhde piirtämisjärjestyksen perusteeksi)
                }

                if (suhteenAikuisistaPiirretty.has(pariSuhdeId)) {
                    monesko = suhteenAikuisistaPiirretty.get(pariSuhdeId);
                    suhteenAikuisistaPiirretty.set(pariSuhdeId, monesko + 1);
                }
                else {
                    monesko = 0;
                    suhteenAikuisistaPiirretty.set(pariSuhdeId, 1);
                }

                // "monesta" määritys kun ei vanhempia
                for (const pariSuhdeLiitos of henkilo.pariSuhteet) {
                    const pariSuhde = suhdeData[pariSuhdeLiitos.id.suhdeId];
                    if (pariSuhde.onkoYhdessa) {
                        monesta = pariSuhde.ylavirtaLiitokset.length;
                    }
                }
            }

            let henkilonVaakaPiste;
            const randomLeveys = Math.floor(Math.random() * 17);
            try {
                const kerroin = monesko / (monesta + 1);  // monesko == min. 0, monesta == max. x-1 ettei piirretä yli oman alueen
                henkilonVaakaPiste = (kerroin * (Cyk.NAYTON_LEVEYS / Cyk.NO_OF_GROUPS));
                var ryhmanVaakaPiste = laskeRyhmanVaakaPiste(haeHenkilonRyhma(henkilo));
                vaakaPiste = ryhmanVaakaPiste + henkilonVaakaPiste + randomLeveys;
            } catch (e) {
                vaakaPiste = ryhmanVaakaPiste + (monesko * 10);
            }

            // console.dir("solmun jeison ennen: " + JSON.stringify(solmu.json()));
            solmu.json({
                position: {
                    x: vaakaPiste + Cyk.SIVU_MARGIN,
                    y: pystyPiste
                }
            });
            // console.dir("solmun jeison jälkeen: " + JSON.stringify(solmu.json()));

        } else if (solmu.scratch()._itse.suhde != null) {  // piirretään suhde-solmut

            const suhde = solmu.scratch()._itse.suhde;

            const vanhempiSuhdeId = suhde.ylavirtaLiitokset[0].id.suhdeId;
            let pystyPiste = (suhdeData[vanhempiSuhdeId].syvyys * 100) + Cyk.SUHTEEN_MARGIN;
            if (!pystyPiste) { pystyPiste = 1; } // TODO: POISTA TÄMÄ PASKA!!!
            let vaakaKeskiPiste = laskeRyhmanKeskimmainenVaakaPiste(suhde.ryhma);
            if (!vaakaKeskiPiste) { vaakaKeskiPiste = 1; } // TODO: POISTA TÄMÄ PASKA!!!

            solmu.json({
                position: {
                    x: vaakaKeskiPiste + Cyk.SIVU_MARGIN,
                    y: pystyPiste
                }
            });

        }
    }
}

function laskeRyhmanVaakaPiste(ryhma) {
    return (Cyk.NAYTON_LEVEYS / Cyk.NO_OF_GROUPS) * (ryhma - 1);
}

function laskeRyhmanKeskimmainenVaakaPiste(ryhma) {  // TODO: Tee joskus tästä fiksumpi!
    return laskeRyhmanVaakaPiste(ryhma) + ((Cyk.NAYTON_LEVEYS / Cyk.NO_OF_GROUPS) * 0.18);
}

export { asetaGraafinPositiot };
