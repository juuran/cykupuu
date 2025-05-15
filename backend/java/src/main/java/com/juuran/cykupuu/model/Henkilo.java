package com.juuran.cykupuu.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.util.Set;

@Entity
public class Henkilo {

    @Id
    @GeneratedValue
    Long id;

    @OneToMany(mappedBy = "henkilo", // suhteen omistajan tässä 1..n tyylissä käytettävä mappedBy merkintää
            cascade = CascadeType.ALL, //
            orphanRemoval = true)
    Set<SuhdeLiitos> vanhempiSuhteet;

    // vaihtoehtoinen tyyli tehdä tämä olisi @ManyToMany, mutta hieman syntaktista sokeria koska:
    // oikeasti RDBMS ei moista tunne, vaan mallintaisi:  Entity  —1..n—>  JoinTable  —n..1—>  Entity
    //    @JoinTable( // tämä annotaatio ei pakollinen, mutta mahdollistaa omien nimien käyttämisen tauluissa
    //            name = "parisuhteet", //
    //            joinColumns = @JoinColumn(name = "henkilo_id"), //
    //            inverseJoinColumns = @JoinColumn(name = "suhde_id"))
    @OneToMany(mappedBy = "henkilo", //
            cascade = CascadeType.ALL, //
            orphanRemoval = true)
    Set<SuhdeLiitos> pariSuhteet;

    String etunimet;
    String sukunimet;

    public void addVanhempiSuhteet(SuhdeLiitos vanhempiSuhde) {
        vanhempiSuhteet.add(vanhempiSuhde);
        vanhempiSuhde.setHenkilo(this);
    }

    public void removeVanhempiSuhde(SuhdeLiitos vanhempiSuhde) {
        vanhempiSuhteet.remove(vanhempiSuhde);
        vanhempiSuhde.setHenkilo(null);
    }

    public void addPariSuhde(SuhdeLiitos pariSuhde) {
        pariSuhteet.add(pariSuhde);
        pariSuhde.setHenkilo(this);
    }

    public void removePariSuhde(SuhdeLiitos pariSuhde) {
        pariSuhteet.remove(pariSuhde);
        pariSuhde.setHenkilo(null);
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

        public Builder vanhempisuhteet(Set<SuhdeLiitos> vanhempiSuhteet) {
            this.builtHenkilo.vanhempiSuhteet = vanhempiSuhteet;
            return this;
        }

        public Builder addVanhempiSuhde(SuhdeLiitos vanhempiSuhde) {
            this.builtHenkilo.vanhempiSuhteet.add(vanhempiSuhde);
            vanhempiSuhde.setHenkilo(this.builtHenkilo);
            return this;
        }

        public Builder pariSuhteet(Set<SuhdeLiitos> pariSuhteet) {
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

    public Set<SuhdeLiitos> getPariSuhteet() {
        return pariSuhteet;
    }

    public void setPariSuhteet(Set<SuhdeLiitos> pariSuhteet) {
        this.pariSuhteet = pariSuhteet;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<SuhdeLiitos> getVanhempiSuhteet() {
        return vanhempiSuhteet;
    }

    public void setVanhempiSuhteet(Set<SuhdeLiitos> vanhempiSuhteet) {
        this.vanhempiSuhteet = vanhempiSuhteet;
    }

    public String getEtunimet() {
        return etunimet;
    }

    public void setEtunimet(String etunimet) {
        this.etunimet = etunimet;
    }

    public String getSukunimet() {
        return sukunimet;
    }

    public void setSukunimet(String sukunimet) {
        this.sukunimet = sukunimet;
    }

}
