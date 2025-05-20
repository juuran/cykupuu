package com.juuran.cykupuu.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suhdetyypit")
public class SuhdeTyyppi {

    @Id
    @GeneratedValue
    Long id;

    @OneToMany(mappedBy = "suhdeTyyppi", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Suhde> suhteet = new ArrayList<>();

    String nimike;

    /*
     * =====================================
     * Itse tehty staattinen builderi luokka
     *
     */

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private SuhdeTyyppi builtSuhdeTyyppi;

        private Builder() {
            this.builtSuhdeTyyppi = new SuhdeTyyppi();
        }

        public SuhdeTyyppi build() {
            SuhdeTyyppi st = this.builtSuhdeTyyppi;
            this.builtSuhdeTyyppi = null;
            return st;
        }

        public Builder id(Long id) {
            this.builtSuhdeTyyppi.id = id;
            return this;
        }

        public Builder suhteet(List<Suhde> suhteet) {
            this.builtSuhdeTyyppi.suhteet = suhteet;
            return this;
        }

        public Builder addSuhde(Suhde suhde) {
            this.builtSuhdeTyyppi.suhteet.add(suhde);
            suhde.setSuhdeTyyppi(this.builtSuhdeTyyppi);
            return this;
        }

        public Builder nimike(String nimike) {
            this.builtSuhdeTyyppi.nimike = nimike;
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

    protected SuhdeTyyppi() { /* vain JPA:lle, ei käytetä */ }

    public SuhdeTyyppi(String nimike) {
        super();
        this.nimike = nimike;
    }

    public List<Suhde> getSuhteet() {
        return suhteet;
    }

    public void setSuhteet(List<Suhde> suhteet) {
        this.suhteet = suhteet;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNimike() {
        return nimike;
    }

    public void setNimike(String nimike) {
        this.nimike = nimike;
    }

}
