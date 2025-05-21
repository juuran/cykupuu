package com.juuran.cykupuu.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import org.springframework.lang.NonNull;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suhdetyypit")
public class SuhdeTyyppi {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bbc")
    @SequenceGenerator(name = "bbc", sequenceName = "bbc", initialValue = 200)
    Long id;

    @OneToMany(mappedBy = "suhdeTyyppi", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Suhde> suhteet = new ArrayList<>();

    @NonNull
    @Column(unique = true)
    String nimike;

    public void addSuhde(Suhde suhde) {
        this.suhteet.add(suhde);
        suhde.setSuhdeTyyppi(this);
    }

    /*
     * .........................................................................................
     * Tästä alas ei mitään kiinnostavaa – vain generoidut (konstruktori, getterit, setterit...)
     *
     * */

    protected SuhdeTyyppi() { /* vain JPA:lle, ei käytetä */ }

    public SuhdeTyyppi(String suhdeNimike) {
        this.nimike = suhdeNimike;
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

    @Override
    public String toString() {
        return "(id=" + id + ", nimike='" + nimike + "')";
    }
}
