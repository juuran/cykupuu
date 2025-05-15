package com.juuran.cykupuu;

import com.juuran.cykupuu.model.Henkilo;
import com.juuran.cykupuu.model.HenkiloRepository;
import com.juuran.cykupuu.model.Suhde;
import com.juuran.cykupuu.model.SuhdeTyyppi;
import org.springframework.boot.CommandLineRunner;

import java.util.ArrayList;

public class DbInitializer implements CommandLineRunner {

    private final HenkiloRepository repository;

    public DbInitializer(HenkiloRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        Henkilo pekka = Henkilo.builder() //
                .id(1L) //
                .etunimet("Pekka Sakari") //
                .sukunimet("Äälö") //
                .build();

        Henkilo murma = Henkilo.builder() //
                .id(2L) //
                .etunimet("Murma Irmeli") //
                .sukunimet("Äälö") //
                .build();

        Suhde suhde1 = Suhde.builder() //
                .id(100L) //
                .onkoNaimisissa(false) //
                .onkoYhdessa(true) //
                .build();

        SuhdeTyyppi st1 = new SuhdeTyyppi(new ArrayList<>(), 300L, "avoliitto");
        st1.addSuhde(suhde1);
        suhde1.setSuhdeTyyppi(st1);

        //        Henkilo aevictus = Henkilo.builder() //
        //                .id(3L) //
        //                .etunimet("Aevictus") //
        //                .sukunimet("Äälö") //
        //                .addVanhempiSuhde(suhde1) //
        //                .build();

    }

}
