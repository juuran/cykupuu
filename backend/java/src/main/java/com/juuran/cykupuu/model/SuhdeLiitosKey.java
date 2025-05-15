package com.juuran.cykupuu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SuhdeLiitosKey implements Serializable {

    @Column(name = "suhde_id")
    Long suhdeId;

    @Column(name = "henkilo_id")
    Long henkiloId;

    /*
     * .........................................................................................
     * Tästä alas ei mitään kiinnostavaa – vain generoidut (konstruktori, getterit, setterit...)
     *
     * */

    protected SuhdeLiitosKey() { /* vain JPA:lle, ei käytetä */ }

    public SuhdeLiitosKey(Long henkiloId, Long suhdeId) {
        this.henkiloId = henkiloId;
        this.suhdeId = suhdeId;
    }

    public Long getHenkiloId() {
        return henkiloId;
    }

    public void setHenkiloId(Long henkiloId) {
        this.henkiloId = henkiloId;
    }

    public Long getSuhdeId() {
        return suhdeId;
    }

    public void setSuhdeId(Long suhdeId) {
        this.suhdeId = suhdeId;
    }

    @Override
    public boolean equals(Object o) {
        if ( o == null || getClass() != o.getClass() )
            return false;
        SuhdeLiitosKey that = (SuhdeLiitosKey) o;
        return Objects.equals(getHenkiloId(), that.getHenkiloId()) && Objects.equals(getSuhdeId(), that.getSuhdeId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getHenkiloId(), getSuhdeId());
    }

}
