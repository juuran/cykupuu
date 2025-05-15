package com.juuran.cykupuu.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;

@Entity
@Table(name = "suhdetyypit")
public class SuhdeTyyppi {

    @Id
    @GeneratedValue
    Long id;

    // Vladin ohjeesta: https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/
    @OneToMany( //
            mappedBy = "suhdeTyyppi", // 1..n tapauksessa suhteen omistavan puolen määritettävä mappedBy
            cascade = CascadeType.ALL, //
            orphanRemoval = true)
    List<Suhde> suhteet;

    String nimike;

    public SuhdeTyyppi(List<Suhde> suhteet, Long id, String nimike) {
        this.suhteet = suhteet;
        this.id = id;
        this.nimike = nimike;
    }

    /**
     * Metodi, jota ainoastaan käytettävä uusien suhteiden lisäämiseksi "suhdetyypit" tauluun.
     */
    public void addSuhde(Suhde suhde) {
        this.suhteet.add(suhde);
        suhde.setSuhdeTyyppi(this);
    }

    /**
     * Metodi, jota ainoastaan käytettävä suhteiden poistamiseksi "suhdetyypit" taulusta. Varmistaa poiston propagoinnin
     * (cascade).
     */
    public void removeSuhde(Suhde suhde) {
        this.suhteet.remove(suhde);
        suhde.setSuhdeTyyppi(null);
    }

    /*
     * .........................................................................................
     * Tästä alas ei mitään kiinnostavaa – vain generoidut (konstruktori, getterit, setterit...)
     *
     * */

    protected SuhdeTyyppi() { /* vain JPA:lle, ei käytetä */ }

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
