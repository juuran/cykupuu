package com.juuran.cykupuu.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.util.Set;

@Entity
public class Suhde {

    @Id
    @GeneratedValue
    Long id;

    @OneToMany
    @JoinColumn(name = "henkilo_id")
    Set<SuhdeLiitos> ylavirtaLiitokset;

    @OneToMany
    @JoinColumn(name = "henkilo_id")
    Set<SuhdeLiitos> alavirtaLiitokset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suhdetyyppi_id")
    SuhdeTyyppi suhdeTyyppi;

    Boolean onkoYhdessa;
    Boolean onkoNaimisissa;

    @Override
    public boolean equals(Object o) {
        if ( !(o instanceof Suhde suhde) ) {
            return false;
        }
        return id != null && id.equals(suhde.getId());
    }

    @Override
    public int hashCode() { // hashCode must be a constant value for equality to follow all entity state transitions
        return getClass().hashCode();
    }

    /*
     * =====================================
     * Itse tehty staattinen builderi luokka
     *
     */

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private Suhde builtSuhde;

        private Builder() {
            this.builtSuhde = new Suhde();
        }

        public Suhde build() {
            Suhde uusiSuhde = this.builtSuhde;
            this.builtSuhde = null;
            return uusiSuhde;
        }

        public Builder id(Long id) {
            this.builtSuhde.id = id;
            return this;
        }

        public Builder onkoNaimisissa(boolean onkoNaimisissa) {
            this.builtSuhde.onkoNaimisissa = onkoNaimisissa;
            return this;
        }

        public Builder onkoYhdessa(boolean onkoYhdessa) {
            this.builtSuhde.onkoYhdessa = onkoYhdessa;
            return this;
        }

        public Builder suhdeTyyppi(SuhdeTyyppi suhdeTyyppi) {
            this.builtSuhde.suhdeTyyppi = suhdeTyyppi;
            return this;
        }

        public Builder ylavirtaLiitokset(Set<SuhdeLiitos> pariSuhdeLiitokset) {
            this.builtSuhde.ylavirtaLiitokset = pariSuhdeLiitokset;
            return this;
        }

        public Builder addYlavirtaLiitos(SuhdeLiitos parisuhdeLiitos) {
            this.builtSuhde.ylavirtaLiitokset.add(parisuhdeLiitos);
            parisuhdeLiitos.setSuhde(this.builtSuhde);
            return this;
        }

        public Builder alavirtaLiitokset(Set<SuhdeLiitos> vanhempiSuhdeLiitokset) {
            this.builtSuhde.alavirtaLiitokset = vanhempiSuhdeLiitokset;
            return this;
        }

        public Builder addAlavirtaLiitos(SuhdeLiitos vanhempiSuhdeLiitos) {
            this.builtSuhde.ylavirtaLiitokset.add(vanhempiSuhdeLiitos);
            vanhempiSuhdeLiitos.setSuhde(this.builtSuhde);
            return this;
        }

    }

    /*
     *
     * Itse tehty staattinen builderi luokka
     * =====================================
     */


    /*
     * .........................................................................................
     * Tästä alas ei mitään kiinnostavaa – vain generoidut (konstruktori, getterit, setterit...)
     *
     * */

    protected Suhde() { /* vain JPA:lle, ei käytetä */ }

    public Suhde(SuhdeTyyppi suhdeTyyppi, Long id, Set<SuhdeLiitos> ylavirtaLiitokset,
            Set<SuhdeLiitos> alavirtaLiitokset, Boolean onkoYhdessa, Boolean onkoNaimisissa) {
        this.suhdeTyyppi = suhdeTyyppi;
        this.id = id;
        this.ylavirtaLiitokset = ylavirtaLiitokset;
        this.alavirtaLiitokset = alavirtaLiitokset;
        this.onkoYhdessa = onkoYhdessa;
        this.onkoNaimisissa = onkoNaimisissa;
    }

    public Boolean getOnkoYhdessa() {
        return onkoYhdessa;
    }

    public void setOnkoYhdessa(Boolean onkoYhdessa) {
        this.onkoYhdessa = onkoYhdessa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<SuhdeLiitos> getYlavirtaLiitokset() {
        return ylavirtaLiitokset;
    }

    public void setYlavirtaLiitokset(Set<SuhdeLiitos> ylavirtaLiitokset) {
        this.ylavirtaLiitokset = ylavirtaLiitokset;
    }

    public Set<SuhdeLiitos> getAlavirtaLiitokset() {
        return alavirtaLiitokset;
    }

    public void setAlavirtaLiitokset(Set<SuhdeLiitos> alavirtaLiitokset) {
        this.alavirtaLiitokset = alavirtaLiitokset;
    }

    public SuhdeTyyppi getSuhdeTyyppi() {
        return suhdeTyyppi;
    }

    public void setSuhdeTyyppi(SuhdeTyyppi suhdeTyyppi) {
        this.suhdeTyyppi = suhdeTyyppi;
    }

    public Boolean getOnkoNaimisissa() {
        return onkoNaimisissa;
    }

    public void setOnkoNaimisissa(Boolean onkoNaimisissa) {
        this.onkoNaimisissa = onkoNaimisissa;
    }

}
