package com.springerp.repositories;

import com.springerp.sequence.SequenceNumber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SequenceNumberRepository extends JpaRepository<SequenceNumber, String> {
}