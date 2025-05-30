import { cy } from "../cykupuu.js";
import * as Util from '../util.js'

let unsafeSyvinSyvyys = -1;
let pathsForVisualizing = [];

function maaritaSyvyydetSolmustaAlavirtaan(juuri, isDeepestVaikkeiOlisikaan, lisaSyvyys = 0) {
    cy.elements().breadthFirstSearch({
        roots: juuri,
        visit: function (v, e, u, i, depth) {  // v=nykyinen solmu,  u=edellinen solmu,  i=perus i
            pathsForVisualizing.push(v);
            let syvyys = depth + 1 + lisaSyvyys;

            if (syvyys % 2 === 0) {  // käsitellään suhde-solmut

                if (juuri.scratch()._itse.henkilo.syvinSolmu || isDeepestVaikkeiOlisikaan) {
                    // kun juuri on syvin, täytetään tieto suhteen todellisesta syvyydestä
                    v.scratch()._itse.suhde.todellinenSyvyys = syvyys;
                    return;
                }

                // kun juuri ei ole syvin, ei voida täyttää tietoa vaan levitettävä tieto suhteen vanhemmalle
                const todellinenSyvyys = v.scratch()._itse.suhde.todellinenSyvyys;
                if (Util.isNumber(todellinenSyvyys)) {
                    korjaaSyvyydetYlavirtaan(u, todellinenSyvyys - 1);
                    // FIXME:  Bugi! Haku pitää pystyä lopettamaan tähän jollain tavalla!
                    //         Muussa tapauksessa palatessaan kutsusta levittää väärää tietoa.
                    // return true tai false saattaa toimia... dokumentaatio on tässä sekava!!!
                }

            }
            else {  // käsitellään henkilo solmut
                v.scratch()._itse.henkilo.syvyys = syvyys;
            }
        },
        directed: true
    });
}

function korjaaSyvyydetYlavirtaan(v, todellinenSyvyys) {  // v=nykyinen solmu, vaikka tultiinkin tänne u:na (edellinen solmu)
    pathsForVisualizing.push(v);
    v.scratch()._itse.henkilo.syvyys = todellinenSyvyys;

    const incomers = v.incomers().nodes();
    if (incomers == null || incomers.length === 0) {  // poistutaan, jos tällä ei ole suhdesolmua
        return;
    }

    const suhdeSolmu = incomers[0];  // vain ensimmäinen alkio järkevä, koska kaari tulee suhdesolmusta
    const suhdeSolmunSyvyys = todellinenSyvyys - 1;  // suhde-solmun korkeus nykyistä (v) korkeampi yhdellä
    suhdeSolmu.scratch()._itse.suhde.todellinenSyvyys = suhdeSolmunSyvyys;
    pathsForVisualizing.push(suhdeSolmu);

    for (const lapsi of suhdeSolmu.outgoers().nodes()) {
        if (lapsi === v) {
            continue;  // ei korjata itsestä alas: mentäisiin sinne, mistä on tultu!
        }

        maaritaSyvyydetSolmustaAlavirtaan(lapsi, true, suhdeSolmunSyvyys);  // syvyys suhteen perusteella, koska syvyyteen lisätään aina 1 aloittaessa
    }

    const veenVanhemmat = suhdeSolmu.incomers().nodes();
    for (const veenVanhempi of veenVanhemmat) {
        korjaaSyvyydetYlavirtaan(veenVanhempi, suhdeSolmunSyvyys - 1);  // vanhempien korkeus on vielä yksi suhteesta ylöspäin
    }
}

/**
 * Tämän algoritmin pitää määrittää suhteen "leveys" eli ryhmä. Käytännössä se tehdään katsomalla onko samalla korkeudella jo muita suhdesolmuja ja määrittämällä oikea määrä sen perusteella.
 */
function maaritaLeveydetSolmustaAlavirtaan(juuri, suhteitaPerSyvyys) {
    //suhteitaPerSyvyys (Map) tallentaa avaimena syvyyden ja arvona tulukon suhteita, esim.
    //      (   { key: 2, value: ["205", "605"]},   { key: 4, value: ["953", "200"]}   )
    cy.elements().breadthFirstSearch({
        roots: juuri,
        visit: function (v, e, u, i, depth) {
            // pathsForVisualising.push(v);
            let syvyys = depth + 1;

            // vain parilliset eli suhde-solmut kiinnostavia "leveyden" eli ryhmien näkökulmasta
            if (syvyys % 2 !== 0) {
                return;
            }

            const todellinenSyvyys = v.scratch()._itse.suhde.todellinenSyvyys;
            if (Util.isNumber(todellinenSyvyys)) {
                syvyys = todellinenSyvyys;
            } else {
                console.log("Todellista syvyyttä ei voitu löytää!")
            }

            let suhdeId = v.scratch()._itse.suhde.id;

            if (suhteitaPerSyvyys.get(syvyys) != null) {  // tässä syvyydessä jo käyty jos mapin taulukko sillä kohdalla jo olemassa
                var suhteetTaulukko = suhteitaPerSyvyys.get(syvyys);
                let suhteenI = suhteetTaulukko.findIndex(e => e === suhdeId);
                if (suhteenI === -1) {
                    suhteetTaulukko.push(suhdeId);
                    var suhteenRyhma = suhteetTaulukko.length;
                } else {
                    suhteenRyhma = suhteenI + 1;  // aloitetaan ryhmittely ykkösestä
                }
            }
            else {
                suhteitaPerSyvyys.set(syvyys, [suhdeId]);
                suhteenRyhma = 1;
            }
            v.scratch()._itse.suhde.ryhma = suhteenRyhma;
            v.scratch()._itse.suhde.todellinenSyvyys = syvyys;
        },
        directed: true
    });
}

function getSyvinSyvyys() {
    if (unsafeSyvinSyvyys === -1) {
        unsafeSyvinSyvyys = etsiSyvinSyvyys();
    }
    return unsafeSyvinSyvyys;
}

function etsiSyvinSyvyys() {
    let syvinSyvyys = -1;

    const results = cy.elements().depthFirstSearch({
        roots: cy.nodes().roots(),
        visit: function (v, e, u, i, depth) {
            let syvyys = depth + 1;

            if (syvyys > syvinSyvyys) {
                syvinSyvyys = syvyys;
            }
        },
        directed: true
    });

    if (syvinSyvyys === -1) {
        throw Error("Syvyyden hakeminen epäonnistui!");
    }

    return syvinSyvyys;
}

function asetaAutoritatiivisetJuuret() {
    for (const juuri of cy.nodes().roots()) {
        const results = cy.elements().depthFirstSearch({
            roots: juuri,
            visit: function (v, e, u, i, depth) {
                let syvyys = depth + 1;

                if (syvyys === getSyvinSyvyys()) {
                    juuri.scratch()._itse.henkilo.syvinSolmu = true;
                }
            },
            directed: true
        });
    }
}

// TODO: Debug funktio, poista kun ei enää tarvita!
async function animoiPolut() {
    for (const polku of pathsForVisualizing) {
        let speed = 0.01;
        cy.nodes().unselect();
        for (const askel of polku) {
            askel.select();
            speed = speed * 0.25;
            await Util.sleep(speed);
        }
        await Util.sleep(0.1);
    }
}


function juusoSearch(suhteitaPerSyvyys) {
    // kirjoitaStatusbar('Painettu näppäintä "J" (Juuso): juuso juuso');  // TODO: Poista
    asetaAutoritatiivisetJuuret();
    const valitutJuuret = cy.nodes(":selected");
    if (valitutJuuret.length === 0) {
        // kirjoitaStatusbar('Painettu näppäintä "J" (Juuso): Tyhjä valinta! Joku solmu tai joukko solmuja vaaditaan.'); // TODO: Poista
        return;
    }

    pathsForVisualizing = [];
    for (const juuri of valitutJuuret) {
        maaritaSyvyydetSolmustaAlavirtaan(juuri);
    }

    suhteitaPerSyvyys = new Map();  // määritäLeveydetSolmustaAlavirtaan() käyttää tätä, joten tyhjätään ettei vanhaa dataa!
    for (const juuri of valitutJuuret) {
        maaritaLeveydetSolmustaAlavirtaan(juuri, suhteitaPerSyvyys);
    }
}

export { maaritaSyvyydetSolmustaAlavirtaan, korjaaSyvyydetYlavirtaan, maaritaLeveydetSolmustaAlavirtaan, etsiSyvinSyvyys, asetaAutoritatiivisetJuuret, juusoSearch, animoiPolut };
