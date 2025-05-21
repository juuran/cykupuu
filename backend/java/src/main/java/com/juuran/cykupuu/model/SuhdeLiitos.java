package com.juuran.cykupuu.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "suhdeliitokset")
public class SuhdeLiitos {

    @EmbeddedId
    SuhdeLiitosKey id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("henkiloId") // määrittää, mihin @Embeddable luokan kenttään viitataan ja että on FK n..1 suhteessa
    @JoinColumn(name = "henkilo_id") // määrittää tietokannan sarakkeen mihin viitataan
    @JsonBackReference
    Henkilo henkilo;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("suhdeId")
    @JoinColumn(name = "suhde_id")
    @JsonBackReference
    Suhde suhde;

    /**
     * Tämä kenttä koskeaa todellisuudessa vain lapsen <em>kaarta</em> (<em>"edge"</em>) suhteeseen. Vain heidän
     * kohdallaan mahdollinen <strong>true</strong> arvo. Jos kuvataan muuta kuin lapsen suhdetta, käytetään
     * <strong>nullia</strong>, esim. puhuttaessa aikuisten välisistä parisuhteista.
     */
    Boolean onkoBiologinen; // oikaistu ja annettu kaikille vaikka tuleekin nullia - ORM mäppäys näin 100 × helpompaa!

    @Override
    public boolean equals(Object o) {
        if ( this == o ) {
            return true;
        }
        if ( !(o instanceof SuhdeLiitos suhdeLiitos) ) {
            return false;
        }
        return id != null && id.equals(suhdeLiitos.getId());
    }

    @Override
    public int hashCode() { // hashCode must be a constant value for equality to follow all entity state transitions
        return getClass().hashCode();
    }

    /*
     * .........................................................................................
     * Tästä alas ei mitään kiinnostavaa – vain generoidut (konstruktori, getterit, setterit...)
     *
     * */

    protected SuhdeLiitos() { /* vain JPA:lle, ei käytetä */ }

    public SuhdeLiitos(Boolean onkoBiologinen, Suhde suhde, Henkilo henkilo) {
        this.onkoBiologinen = onkoBiologinen;
        this.suhde = suhde;
        this.henkilo = henkilo;
        this.id = new SuhdeLiitosKey(henkilo.getId(), suhde.getId());
    }

    public Suhde getSuhde() {
        return suhde;
    }

    public void setSuhde(Suhde suhde) {
        this.suhde = suhde;
    }

    public SuhdeLiitosKey getId() {
        return id;
    }

    public void setId(SuhdeLiitosKey id) {
        this.id = id;
    }

    public Henkilo getHenkilo() {
        return henkilo;
    }

    public void setHenkilo(Henkilo henkilo) {
        this.henkilo = henkilo;
    }

    public Boolean getOnkoBiologinen() {
        return onkoBiologinen;
    }

    public void setOnkoBiologinen(Boolean onkoBiologinen) {
        this.onkoBiologinen = onkoBiologinen;
    }

    @Override
    public String toString() {
        String tuloste;
        if ( onkoBiologinen == null ) {  // parisuhde:  henkilö->suhde
            tuloste = "(" + henkilo.getId() + "->" + suhde.getId() + ')';
        }
        else {  // vanhempisuhde:  suhde->henkilö
            tuloste = "(" + suhde.getId() + "->" + henkilo.getId() + ", biol? " + onkoBiologinen + ')';
        }
        return tuloste;
    }
}
