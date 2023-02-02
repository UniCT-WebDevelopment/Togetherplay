CREATE TABLE `amici` (
  `id_amici` int(11) NOT NULL,
  `fk_lista` int(11) NOT NULL,
  `fk_utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `lista` (
  `id_lista` int(11) NOT NULL,
  `nomeLista` varchar(11) NOT NULL,
  `fk_utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



CREATE TABLE `partecipanti` (
  `id_partecipa` int(11) NOT NULL,
  `fk_lista` int(11) NOT NULL,
  `fk_room` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `room` (
  `id_room` int(11) NOT NULL,
  `nomeRoom` varchar(11) NOT NULL,
  `publica` tinyint(1) NOT NULL,
  `urlVideo` text NOT NULL,
  `codice_invito` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `utenti` (
  `id_utente` int(11) NOT NULL,
  `nome` varchar(20) NOT NULL,
  `cognome` varchar(20) NOT NULL,
  `utente` varchar(20) NOT NULL,
  `email` varchar(20) NOT NULL,
  `password` varchar(32) NOT NULL,
  `permessi` int(11) DEFAULT NULL,
  `sessionId` int(11) NOT NULL,
  `expired` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `amici`
  ADD PRIMARY KEY (`id_amici`),
  ADD UNIQUE KEY `uniqu` (`fk_lista`,`fk_utente`),
  ADD KEY `fk_lista` (`fk_utente`),
  ADD KEY `lista_fk` (`fk_lista`),
  ADD KEY `fk_utente` (`fk_utente`);


ALTER TABLE `lista`
  ADD PRIMARY KEY (`id_lista`),
  ADD KEY `fk_utente` (`fk_utente`);


ALTER TABLE `partecipanti`
  ADD PRIMARY KEY (`id_partecipa`),
  ADD KEY `fk_lista` (`fk_lista`),
  ADD KEY `fk_room` (`fk_room`);


ALTER TABLE `room`
  ADD PRIMARY KEY (`id_room`);

ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id_utente`),
  ADD UNIQUE KEY `utente` (`utente`);



ALTER TABLE `amici`
  MODIFY `id_amici` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `lista`
  MODIFY `id_lista` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `partecipanti`
  MODIFY `id_partecipa` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `room`
  MODIFY `id_room` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `utenti`
  MODIFY `id_utente` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `amici`
  ADD CONSTRAINT `amici_ibfk_1` FOREIGN KEY (`fk_utente`) REFERENCES `utenti` (`id_utente`),
  ADD CONSTRAINT `lista_fk` FOREIGN KEY (`fk_lista`) REFERENCES `lista` (`id_lista`);


ALTER TABLE `lista`
  ADD CONSTRAINT `fk_utente` FOREIGN KEY (`fk_utente`) REFERENCES `utenti` (`id_utente`);


ALTER TABLE `partecipanti`
  ADD CONSTRAINT `fk_lista` FOREIGN KEY (`fk_lista`) REFERENCES `lista` (`id_lista`),
  ADD CONSTRAINT `fk_room` FOREIGN KEY (`fk_room`) REFERENCES `room` (`id_room`);



