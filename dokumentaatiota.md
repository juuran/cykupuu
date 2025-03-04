# Yleistä dokumentaatiota
jotain jotain jotain


# Solmujen sijoittelu-algoritmi
## Taustaa
- solmut sijoitetaan aina järjestyksessä ylhäältä alas: vanhemmat -> suhde -> lapset
- sijoittelun määrää *leveys* ja *korkeus*, tarkoituksena ryhmittää perhekunnat selkeästi
- *korkeuden* määrittää *syvyys*
    - syvyys ilmaisee sitä, miten matalalla ollaan juurisolmusta (s=1) katsoen
- *leveyden* määrittää *ryhmä*
    - tämän määrittämiseen tarvitaan suhdetta, suhteiden määrää samalla korkeudella


## Ongelma
- käytettäessä cytoscape.js:n erinomaisia hakualgoritmeja, juuret eivät tiedä millä korkeudella ne ovat
- jokainen luulee aloittavansa 0:sta
    - joka tosin tässä korjattu ykköseksi
        - toisin sanoen sekä syvyys että ryhmä indeksoidaan ykkösestä alkaen eli ne alkavat "1, 2, 3, ...." eivätkä "0, 1, 2, ..."
- tämän takia määäritettävä ensin syvimmät juuret ja käsiteltävä niitä eri tavalla kuin muita juuria
    - jos taas haettaisiin pelkistä syvimmistä juurista käsin, ei saataisi tietoa välitettyä kaikkiin sopukoihin
        - (tosin tämä saattaa muuttua algoritmin, erityisesti "u"-solmu asioiden kehittyessä, pitäisi testata)


## Algoritmi: "määritäSyvyys"
- jos ollaan syvin juuri, asetetaan *todellinenSyvyys* arvo jokaiselle vastaantulevalle solmulle käyttäen (kirjaston tarjoamaa valmista) breadthFirst tai depthFirst hakua
    - (tätä ennen ollaan toki määritetty syvimmät juuret käyttäen omaa nopeaa hakuaan)
    - (ryhmä määritetään sen tiedon perusteella, montako suhdesolmua on samalla syvyydellä - voi olla, että tämä on mahdollista vasta syvyyden määrittämisen jälkeen, että tieto on lopullista)
    - tämän jälkeen jatketaan alavirtaan niin kauan kuin solmuja riittää
- jos ollaan tavallinen juuri, jatketaan matkaa alas (samassa haussa kuin syvinkin - esim. silmukassa), kunnes jostakin suhde-solmusta löytyy *todellinenSyvyys*
    - kun se löytyy, lähdetään korjaamaan syvyys-arvoja ylävirtaan
        - ei kuitenkaan lähdetä "tyhmästi" korjaamaan kaikkia ("incomers"), vaan hyödynnetään tietoa, että saavuttiin solmusta, joka ei ollut juurisolmu ja siirrytään kirjaston hakualgoritmin tarjoamaan "u"-solmuun eli edelliseen solmuun
        - jos korjataan vain ylävirtaan niin saavuttaessa korjattavaan suhde-solmuun muut lapset kuin "u" eivät korjaantuisi
            - ratkaisu: kirjoitetaan *todellinenSyvyys* suhde-solmuun ikään kuin oltaisiin syvin juuri
                - tehdään muista lapsista kuin "u" solmusta syvimpiä juuria ja lähetetään kukin niistä matkaan korjaamaan alavirtaan, aivan samaan tapaan kuin oltaisiin syvin juuri – tämä toimii, koska niillä on tieto todellisesta syvyydestä


## Algoritmi: "määritäLeveys"
- leveys määritetään sen perusteella montako suhdetta (suhde-solmua) sijaitsee samalla syvyydellä
    - voidaan luotettavasti suorittaa vasta syvyyksien määrittelyn jälkeen
- TODO: miten ratkaistaan ongelma, joka tulee tällä hetkellä hlö11 piirtämisessä...? Pitäisikö ryhmittely katsoa sittenkin yllä olevan suhdemäärän perusteella eikä alla (vanhemmat vs lapset tms) perusteella...?
