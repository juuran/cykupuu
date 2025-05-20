package com.juuran.cykupuu;

import com.juuran.cykupuu.model.Henkilo;
import com.juuran.cykupuu.model.Suhde;
import com.juuran.cykupuu.model.SuhdeLiitos;
import com.juuran.cykupuu.repository.HenkiloRepository;
import com.juuran.cykupuu.repository.SuhdeLiitosRepository;
import com.juuran.cykupuu.repository.SuhdeRepository;
import com.juuran.cykupuu.repository.SuhdeTyyppiRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DbInitializer implements CommandLineRunner {

    private final HenkiloRepository henkiloRepo;
    private final SuhdeRepository suhdeRepo;
    private final SuhdeTyyppiRepository suhdeTyyppiRepo;
    private final SuhdeLiitosRepository suhdeLiitosRepo;

    public DbInitializer(HenkiloRepository henkiloRepository, SuhdeRepository suhdeRepository,
            SuhdeTyyppiRepository stRepo, SuhdeLiitosRepository slRepo) {
        this.henkiloRepo = henkiloRepository;
        this.suhdeRepo = suhdeRepository;
        this.suhdeTyyppiRepo = stRepo;
        this.suhdeLiitosRepo = slRepo;
    }

    @Override
    public void run(String... args) {
        Henkilo pekka = new Henkilo("Pekka Eevertti", "Ismonperä");
        Henkilo irmal = new Henkilo("Irmal Irmeli", "Ismonperä");
        Henkilo eskil = new Henkilo("Eskil Studio", "Ismonperä");
        pekka = henkiloRepo.save(pekka);
        irmal = henkiloRepo.save(irmal);
        eskil = henkiloRepo.save(eskil);

        Suhde s1 = Suhde.builder().onkoNaimisissa(false).onkoYhdessa(false).build();
        s1 = suhdeRepo.save(s1);

        SuhdeLiitos sl1 = new SuhdeLiitos(pekka, s1);
        SuhdeLiitos sl2 = new SuhdeLiitos(irmal, s1);
        SuhdeLiitos sl3 = new SuhdeLiitos(true, s1, eskil);
        sl1 = suhdeLiitosRepo.save(sl1);
        sl2 = suhdeLiitosRepo.save(sl2);
        sl3 = suhdeLiitosRepo.save(sl3);

        pekka.setPariSuhteet(List.of(sl1));
        irmal.setPariSuhteet(List.of(sl2));
        eskil.setVanhempiSuhteet(List.of(sl3));

        henkiloRepo.save(pekka);
        henkiloRepo.save(irmal);
        henkiloRepo.save(eskil);

        System.out.println("Tulostetaan löytyneet:");
        suhdeRepo.findAll().forEach(System.out::println);

        // Okei, tässä on nyt toimiva koodi, joka käyttää eager fetchingiä suhteiden osalta. Se toimii, mutta kyllähän
        // tuota SQL:ää melkoisen paljon tulee näin yksinkertaisen prosessin tarpeisiin. Voisi siis vielä kokeilla sitä
        // Vladin systeemiä tähän, mutta vain kohtuullisessa määrin. Rehellisesti tämän tietokannan tai databasen
        // suorituskyky ei kyllä nyt ole minkäänlainen prioriteetti.
    }

}
