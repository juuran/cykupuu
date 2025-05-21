package com.juuran.cykupuu.repository;

import com.juuran.cykupuu.model.SuhdeTyyppi;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuhdeTyyppiRepository extends JpaRepository<SuhdeTyyppi, Long> {

    SuhdeTyyppi findByNimike(String nimike);

}
