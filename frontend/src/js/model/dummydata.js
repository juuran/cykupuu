import { Henkilo } from "./henkilo";
import { Suhde } from "./suhde";

const henkilodata = [
    new Henkilo("hlö0", "hlö0", "", [], [], 1),      // 0    (Tässä esimerkissä nyt nimi on yksilöivä kuin id)
    new Henkilo("hlö1", "hlö1", "", [], [], 1),      // 1
    new Henkilo("hlö2", "hlö2", "", [], [], 3),      // 2
    new Henkilo("hlö3", "hlö3", "", [], [], 3),      // 3
    new Henkilo("hlö4", "hlö4", "", [], [], 3),      // 4
    new Henkilo("hlö5", "hlö5", "", [], [], 3),      // 5
    new Henkilo("hlö6", "hlö6", "", [], [], 3),      // 6
    new Henkilo("hlö7", "hlö7", "", [], [], 5),      // 7
    new Henkilo("hlö8", "hlö8", "", [], [], 5),      // 8
    new Henkilo("hlö9", "hlö9", "", [], [], 1),      // 9
    new Henkilo("hlö10", "hlö10", "", [], [], 1),     // 10
    new Henkilo("hlö11", "hlö11", "", [], [], 5),     // 11
    new Henkilo("hlö12", "hlö12", "", [], [], 7),     // 12
    new Henkilo("hlö13", "hlö13", "", [], [], 7),     // 13
    new Henkilo("hlö14", "hlö14", "", [], [], 7),     // 14
    new Henkilo("hlö15", "hlö15", "", [], [], 7),     // 15
    new Henkilo("hlö16", "hlö16", "", [], [], 3),     // 16
    new Henkilo("hlö17", "hlö17", "", [], [], 5),     // 17
    new Henkilo("hlö18", "hlö18", "", [], [], 5),     // 18
    new Henkilo("hlö19", "hlö19", "", [], [], 5),     // 19
    new Henkilo("hlö20", "hlö20", "", [], [], 1),     // 20
    new Henkilo("hlö21", "hlö21", "", [], [], 1),     // 21
    new Henkilo("hlö22", "hlö22", "", [], [], 3),     // 22
    new Henkilo("hlö23", "hlö23", "", [], [], 3),     // 23
];

const suhdeData = [
    // yksi olio on yksittäinen suhde - suhdetyypit: "avoliitto", "avioliitto", "eronnut", "monisuhde"
    new Suhde(
        100, "avioliitto", true, true,
        [henkilodata[0], henkilodata[1]],
        [henkilodata[2], henkilodata[3], henkilodata[4], henkilodata[5]]),
    new Suhde(
        101, "avioliitto (eronnut)", false, true,
        [henkilodata[5], henkilodata[6]],
        [henkilodata[7], henkilodata[8]]),
    new Suhde(
        102, "avioliitto", true, true,
        [henkilodata[9], henkilodata[10]],
        [henkilodata[6]]),
    new Suhde(
        103, "avoliitto", true, false,
        [henkilodata[7], henkilodata[11]],
        [henkilodata[12], henkilodata[13], henkilodata[14], henkilodata[15]]),
    new Suhde(
        104, "avioliitto", true, true,
        [henkilodata[6], henkilodata[16]],
        [henkilodata[17], henkilodata[18], henkilodata[19]]),
    new Suhde(
        105, "avioliitto", true, true,
        [henkilodata[20], henkilodata[21]],
        [henkilodata[16], henkilodata[22], henkilodata[23]])
];

henkilodata[0].vanhempiSuhteet.push(null); /*               */ henkilodata[0].lapsiSuhteet.push(suhdeData[0]);
henkilodata[1].vanhempiSuhteet.push(null); /*               */ henkilodata[1].lapsiSuhteet.push(suhdeData[0]);
henkilodata[2].vanhempiSuhteet.push(suhdeData[0]);
henkilodata[3].vanhempiSuhteet.push(suhdeData[0]);
henkilodata[4].vanhempiSuhteet.push(suhdeData[0]);
henkilodata[5].vanhempiSuhteet.push(suhdeData[0]); /*       */ henkilodata[5].lapsiSuhteet.push(suhdeData[1]);
henkilodata[6].vanhempiSuhteet.push(suhdeData[2]); /*       */ henkilodata[6].lapsiSuhteet.push(suhdeData[1], suhdeData[4]);
henkilodata[7].vanhempiSuhteet.push(suhdeData[1]); /*       */ henkilodata[7].lapsiSuhteet.push(suhdeData[3]);
henkilodata[8].vanhempiSuhteet.push(suhdeData[1]);
henkilodata[9].vanhempiSuhteet.push(null); /*               */ henkilodata[9].lapsiSuhteet.push(suhdeData[2]);
henkilodata[10].vanhempiSuhteet.push(null); /*              */ henkilodata[10].lapsiSuhteet.push(suhdeData[2]);
henkilodata[11].vanhempiSuhteet.push(null); /*              */ henkilodata[11].lapsiSuhteet.push(suhdeData[3]);
henkilodata[12].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[13].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[14].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[15].vanhempiSuhteet.push(suhdeData[3]);
henkilodata[16].vanhempiSuhteet.push(suhdeData[5]); /*      */ henkilodata[16].lapsiSuhteet.push(suhdeData[4]);
henkilodata[17].vanhempiSuhteet.push(suhdeData[4]);
henkilodata[18].vanhempiSuhteet.push(suhdeData[4]);
henkilodata[19].vanhempiSuhteet.push(suhdeData[4]);
henkilodata[20].vanhempiSuhteet.push(null); /*              */ henkilodata[20].lapsiSuhteet.push(suhdeData[5]);
henkilodata[21].vanhempiSuhteet.push(null); /*              */ henkilodata[21].lapsiSuhteet.push(suhdeData[5]);
henkilodata[22].vanhempiSuhteet.push(suhdeData[5]);
henkilodata[23].vanhempiSuhteet.push(suhdeData[5]);
