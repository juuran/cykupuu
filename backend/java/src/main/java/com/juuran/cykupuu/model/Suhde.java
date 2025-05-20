package com.juuran.cykupuu.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Suhde {

    @Id
    @GeneratedValue
    Long id;

    @OneToMany(fetch = jakarta.persistence.FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    List<SuhdeLiitos> ylavirtaLiitokset = new ArrayList<>();

    @OneToMany(fetch = jakarta.persistence.FetchType.EAGER)
    List<SuhdeLiitos> alavirtaLiitokset = new ArrayList<>();

    @ManyToOne()
    @JoinColumn(name = "suhdetyyppi_id")
    SuhdeTyyppi suhdeTyyppi;

    Boolean onkoYhdessa;
    Boolean onkoNaimisissa;

    /*
     * =====================================
     * Itse tehty staattinen builderi luokka
     *
     */

    public static Builder builder() {
        return new Builder();
    }

    @Override
    public String toString() {
        return "Suhde{" + "id=" + id + ", ylavirtaLiitokset=" + ylavirtaLiitokset + ", alavirtaLiitokset=" + alavirtaLiitokset + ", suhdeTyyppi=" + suhdeTyyppi + ", onkoYhdessa=" + onkoYhdessa + ", onkoNaimisissa=" + onkoNaimisissa + '}';
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

    public Suhde(Boolean onkoYhdessa, Long id, List<SuhdeLiitos> ylavirtaLiitokset, List<SuhdeLiitos> alavirtaLiitokset,
            SuhdeTyyppi suhdeTyyppi, Boolean onkoNaimisissa) {
        this.onkoYhdessa = onkoYhdessa;
        this.id = id;
        this.ylavirtaLiitokset = ylavirtaLiitokset;
        this.alavirtaLiitokset = alavirtaLiitokset;
        this.suhdeTyyppi = suhdeTyyppi;
        this.onkoNaimisissa = onkoNaimisissa;
    }

    public List<SuhdeLiitos> getAlavirtaLiitokset() {
        return alavirtaLiitokset;
    }

    public void setAlavirtaLiitokset(List<SuhdeLiitos> alavirtaLiitokset) {
        this.alavirtaLiitokset = alavirtaLiitokset;
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

    public SuhdeTyyppi getSuhdeTyyppi() {
        return suhdeTyyppi;
    }

    public void setSuhdeTyyppi(SuhdeTyyppi suhdeTyyppi) {
        this.suhdeTyyppi = suhdeTyyppi;
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
