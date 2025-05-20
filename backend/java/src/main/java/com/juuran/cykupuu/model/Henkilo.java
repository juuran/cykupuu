package com.juuran.cykupuu.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import org.springframework.lang.NonNull;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Henkilo {

    @Id
    @GeneratedValue
    Long id;

    @NonNull
    String etunimet;

    @NonNull
    String sukunimet;

    @OneToMany(mappedBy = "henkilo", cascade = CascadeType.ALL, orphanRemoval = true)
    List<SuhdeLiitos> vanhempiSuhteet = new ArrayList<>();

    @OneToMany(mappedBy = "henkilo", cascade = CascadeType.ALL, orphanRemoval = true)
    List<SuhdeLiitos> pariSuhteet = new ArrayList<>();

    /*
     * =====================================
     * Itse tehty staattinen builderi luokka
     *
     */

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private Henkilo builtHenkilo;

        private Builder() {
            this.builtHenkilo = new Henkilo();
        }

        public Henkilo build() {
            Henkilo uusiHenkilo = this.builtHenkilo;
            this.builtHenkilo = null;
            return uusiHenkilo;
        }

        public Builder id(Long id) {
            this.builtHenkilo.id = id;
            return this;
        }

        public Builder etunimet(String etunimet) {
            this.builtHenkilo.etunimet = etunimet;
            return this;
        }

        public Builder sukunimet(String sukunimet) {
            this.builtHenkilo.sukunimet = sukunimet;
            return this;
        }

        public Builder vanhempisuhteet(List<SuhdeLiitos> vanhempiSuhteet) {
            this.builtHenkilo.vanhempiSuhteet = vanhempiSuhteet;
            return this;
        }

        public Builder addVanhempiSuhde(SuhdeLiitos vanhempiSuhde) {
            this.builtHenkilo.vanhempiSuhteet.add(vanhempiSuhde);
            vanhempiSuhde.setHenkilo(this.builtHenkilo);
            return this;
        }

        public Builder pariSuhteet(List<SuhdeLiitos> pariSuhteet) {
            this.builtHenkilo.pariSuhteet = pariSuhteet;
            return this;
        }

        public Builder addPariSuhde(SuhdeLiitos pariSuhde) {
            this.builtHenkilo.pariSuhteet.add(pariSuhde);
            pariSuhde.setHenkilo(this.builtHenkilo);
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

    protected Henkilo() { /* vain JPA:lle, ei käytetä */ }

    public Henkilo(@NonNull String etunimet, @NonNull String sukunimet) {
        this.etunimet = etunimet;
        this.sukunimet = sukunimet;
    }

    public Henkilo(List<SuhdeLiitos> pariSuhteet, Long id, List<SuhdeLiitos> vanhempiSuhteet, String etunimet,
            String sukunimet) {
        this.pariSuhteet = pariSuhteet;
        this.id = id;
        this.vanhempiSuhteet = vanhempiSuhteet;
        this.etunimet = etunimet;
        this.sukunimet = sukunimet;
    }

    public String getEtunimet() {
        return etunimet;
    }

    public void setEtunimet(String etunimet) {
        this.etunimet = etunimet;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<SuhdeLiitos> getVanhempiSuhteet() {
        return vanhempiSuhteet;
    }

    public void setVanhempiSuhteet(List<SuhdeLiitos> vanhempiSuhteet) {
        this.vanhempiSuhteet = vanhempiSuhteet;
    }

    public List<SuhdeLiitos> getPariSuhteet() {
        return pariSuhteet;
    }

    public void setPariSuhteet(List<SuhdeLiitos> pariSuhteet) {
        this.pariSuhteet = pariSuhteet;
    }

    public String getSukunimet() {
        return sukunimet;
    }

    public void setSukunimet(String sukunimet) {
        this.sukunimet = sukunimet;
    }

    @Override
    public String toString() {
        return "Henkilo{" + "id=" + id + ", vanhempiSuhteet=" + vanhempiSuhteet + ", pariSuhteet=" + pariSuhteet + ","
                + " etunimet='" + etunimet + '\'' + ", sukunimet='" + sukunimet + '\'' + '}';
    }

}
