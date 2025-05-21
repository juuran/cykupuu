package com.juuran.cykupuu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.proxy.HibernateProxy;

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
    public final boolean equals(Object o) {
        if ( this == o ) {
            return true;
        }
        if ( o == null ) {
            return false;
        }
        Class<?> oEffectiveClass = o instanceof HibernateProxy ?
                ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() :
                o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ?
                ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() :
                this.getClass();
        if ( thisEffectiveClass != oEffectiveClass ) {
            return false;
        }
        SuhdeLiitosKey that = (SuhdeLiitosKey) o;
        return getSuhdeId() != null && Objects.equals(getSuhdeId(),
                that.getSuhdeId()) && getHenkiloId() != null && Objects.equals(getHenkiloId(), that.getHenkiloId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(suhdeId, henkiloId);
    }
}
