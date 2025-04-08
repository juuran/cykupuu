package com.juuran.springharjoitus;


import com.juuran.springharjoitus.model.Event;
import com.juuran.springharjoitus.model.Group;
import com.juuran.springharjoitus.model.GroupRepository;
import com.juuran.springharjoitus.model.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Stream;

@Component
class Initializer implements CommandLineRunner {

    private final GroupRepository repository;

    public Initializer(GroupRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) {
        Stream.of("Seattle JUG", "Denver JUG", "Dublin JUG",
                "London JUG").forEach(name ->
                repository.save(new Group(name))
        );

        Group sJug = repository.findByName("Seattle JUG");
        Event e = Event.builder().title("Micro Frontends for Java Developers")
                .description("JHipster now has microfrontend support!")
                .date(Instant.parse("2022-09-13T17:00:00.000Z"))
                .build();
        sJug.setEvents(Collections.singleton(e));

        Group lJug = repository.findByName("London JUG");
        User meitsi = new User("123", "Juuso", "en@kerro.com");
        Event e2 = Event.builder().title("Mikä hitto on JUG?")
                .description("Toisaalta, tarvitseeko kaikkea tietää?")
                .date(Instant.parse("2025-04-03T13:25:00.000Z"))
                .attendees(Set.of(meitsi))
                .build();
        lJug.setEvents(Set.of(e2, e));

        repository.save(lJug);
        repository.save(sJug);
        repository.findAll().forEach(System.out::println);
    }

}
