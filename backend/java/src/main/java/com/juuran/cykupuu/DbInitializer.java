package com.juuran.cykupuu;

import com.juuran.cykupuu.model.Henkilo;
import com.juuran.cykupuu.model.Suhde;
import com.juuran.cykupuu.model.SuhdeLiitos;
import com.juuran.cykupuu.model.SuhdeTyyppi;
import com.juuran.cykupuu.repository.HenkiloRepository;
import com.juuran.cykupuu.repository.SuhdeRepository;
import com.juuran.cykupuu.repository.SuhdeTyyppiRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DbInitializer implements CommandLineRunner {

    private final HenkiloRepository henkiloRepo;
    private final SuhdeRepository suhdeRepo;
    private final SuhdeTyyppiRepository tyypiRepo;

    public DbInitializer(HenkiloRepository henkiloRepository, SuhdeRepository suhdeRepository,
            SuhdeTyyppiRepository stRepo) {
        this.henkiloRepo = henkiloRepository;
        this.suhdeRepo = suhdeRepository;
        this.tyypiRepo = stRepo;
    }

    @Override
    public void run(String... args) {
        Henkilo murma = new Henkilo("Murma Irmeli", "Äälö");
        Henkilo pekka = new Henkilo("Pekka Sakari", "Äälö");
        Henkilo aevictus = new Henkilo("Aevictus", "Äälö");
        henkiloRepo.save(pekka);
        henkiloRepo.save(murma);
        henkiloRepo.save(aevictus);
        pekka = henkiloRepo.findByEtunimetAndSukunimet("Murma Irmeli", "Äälö");
        murma = henkiloRepo.findByEtunimetAndSukunimet("Pekka Sakari", "Äälö");
        aevictus = henkiloRepo.findByEtunimetAndSukunimet("Aevictus", "Äälö");

        Suhde suhde1 = Suhde.builder() //
                .onkoNaimisissa(false) //
                .onkoYhdessa(true) //
                .build();
        suhdeRepo.save(suhde1);
        suhde1 = suhdeRepo.findAll().get(0);

        SuhdeTyyppi st1 = SuhdeTyyppi.builder() //
                .nimike("avoliitto") //
                .build();
        tyypiRepo.save(st1);
        st1 = tyypiRepo.findAll().get(0);

        pekka.addPariSuhde(new SuhdeLiitos(pekka, suhde1));
        murma.addPariSuhde(new SuhdeLiitos(murma, suhde1));
        aevictus.addVanhempiSuhteet(new SuhdeLiitos(true, suhde1, aevictus));

        //
        //

        henkiloRepo.save(pekka);
        henkiloRepo.save(murma);
        henkiloRepo.save(aevictus);
        tyypiRepo.save(st1);
        suhdeRepo.save(suhde1);

        System.out.println("Yritetään tulostaa jotain");
        List<Henkilo> loydetyt = henkiloRepo.findAll();
        if ( loydetyt.size() == 0 ) {
            System.out.println("Ei löytynyt mitään!");
            return;
        }

        for (Henkilo loydetty : loydetyt) {
            System.out.println(loydetty);
        }
    }

}
