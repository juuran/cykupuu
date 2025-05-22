package com.juuran.cykupuu.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

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
     * Tämä kenttä koskeaa todellisuudessa lapsen suhdetta. Graafiteoriassa lapsen <em>kaarta</em> (<em>"edge"</em>)
     * suhde-silmuun (<em>"node"</em>). Vain heidän kohdallaan mahdollinen <strong><em>true</em></strong> arvo.
     * Puhuttaessa aikuisten välisistä parisuhteista käytetään <strong><em>nullia</em></strong>.
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

    @Override
    public String toString() {
        String tuloste;
        if ( onkoBiologinen == null ) {  // parisuhde:  henkilö->suhde
            tuloste = "(%d->%d)".formatted(henkilo.getId(), suhde.getId());
        }
        else {  // vanhempisuhde:  suhde->henkilö
            tuloste = "(%d->%d, biol?=%s)".formatted(suhde.getId(), henkilo.getId(), onkoBiologinen);
        }
        return tuloste;
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

    public Boolean getOnkoBiologinen() {
        return onkoBiologinen;
    }

    public void setOnkoBiologinen(Boolean onkoBiologinen) {
        this.onkoBiologinen = onkoBiologinen;
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

    public Suhde getSuhde() {
        return suhde;
    }

    public void setSuhde(Suhde suhde) {
        this.suhde = suhde;
    }

    @Transient
    public String getSelite() {
        if ( onkoBiologinen == null ) {
            return "PARISUHDE";
        }
        else {
            return "LAPSISUHDE";
        }
    }

}
