package com.juuran.cykupuu.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Suhde {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "suh")
    @SequenceGenerator(name = "suh", sequenceName = "suh", initialValue = 101)
    Long id;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "suhde", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("onko_biologinen IS NULL")
    @JsonManagedReference
    List<SuhdeLiitos> ylavirtaLiitokset = new ArrayList<>();

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "suhde", cascade = CascadeType.ALL, orphanRemoval = true)
    @SQLRestriction("onko_biologinen IS NOT NULL")
    @JsonManagedReference
    List<SuhdeLiitos> alavirtaLiitokset = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "suhdetyyppi_id")
    @JsonManagedReference
    SuhdeTyyppi suhdeTyyppi;

    Boolean onkoYhdessa;

    Boolean onkoNaimisissa;

    @Override
    public String toString() {
        return "Suhde{id=%d, ylavirtaLiitokset=%s, alavirtaLiitokset=%s, suhdTyyppi=%s, yhdessa?=%s, naimisissa?=%s}".formatted(
                id, ylavirtaLiitokset, alavirtaLiitokset, suhdeTyyppi, onkoYhdessa, onkoNaimisissa);
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

        public Builder ylavirtaLiitokset(List<SuhdeLiitos> pariSuhdeLiitokset) {
            this.builtSuhde.ylavirtaLiitokset = pariSuhdeLiitokset;
            return this;
        }

        public Builder addYlavirtaLiitos(SuhdeLiitos parisuhdeLiitos) {
            this.builtSuhde.ylavirtaLiitokset.add(parisuhdeLiitos);
            parisuhdeLiitos.setSuhde(this.builtSuhde);
            return this;
        }

        public Builder alavirtaLiitokset(List<SuhdeLiitos> vanhempiSuhdeLiitokset) {
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

    public SuhdeTyyppi getSuhdeTyyppi() {
        return suhdeTyyppi;
    }

    public void setSuhdeTyyppi(SuhdeTyyppi suhdeTyyppi) {
        this.suhdeTyyppi = suhdeTyyppi;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<SuhdeLiitos> getYlavirtaLiitokset() {
        return ylavirtaLiitokset;
    }

    public void setYlavirtaLiitokset(List<SuhdeLiitos> ylavirtaLiitokset) {
        this.ylavirtaLiitokset = ylavirtaLiitokset;
    }

    public List<SuhdeLiitos> getAlavirtaLiitokset() {
        return alavirtaLiitokset;
    }

    public void setAlavirtaLiitokset(List<SuhdeLiitos> alavirtaLiitokset) {
        this.alavirtaLiitokset = alavirtaLiitokset;
    }

    public Boolean getOnkoYhdessa() {
        return onkoYhdessa;
    }

    public void setOnkoYhdessa(Boolean onkoYhdessa) {
        this.onkoYhdessa = onkoYhdessa;
    }

    public Boolean getOnkoNaimisissa() {
        return onkoNaimisissa;
    }

    public void setOnkoNaimisissa(Boolean onkoNaimisissa) {
        this.onkoNaimisissa = onkoNaimisissa;
    }

}
