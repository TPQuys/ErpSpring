package com.springerp.services;

import com.springerp.repositories.SequenceNumberRepository;
import com.springerp.sequence.SequenceNumber;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Year;
import java.util.Optional;

@Service
public class SequenceService {

    private final SequenceNumberRepository sequenceRepository;
    private static final String PO_SEQUENCE_NAME = "PO_SEQUENCE";
    private static final int CODE_LENGTH = 4;

    public SequenceService(SequenceNumberRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    @Transactional
    public String generateNextPoNumber() {
        try {
            String currentYearPrefix = "PO-" + Year.now().getValue();

            SequenceNumber sequence = sequenceRepository.findById(PO_SEQUENCE_NAME)
                    .orElseGet(() -> createInitialSequence(currentYearPrefix));

            if (!sequence.getPrefix().equals(currentYearPrefix)) {
                sequence.setPrefix(currentYearPrefix);
                sequence.setNextValue(1);
            }

            long nextNumber = sequence.getNextValue();
            sequence.setNextValue(nextNumber + 1);

            sequenceRepository.save(sequence);

            String numberPart = String.format("%0" + CODE_LENGTH + "d", nextNumber);
            return currentYearPrefix + "-" + numberPart;
        }catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    private SequenceNumber createInitialSequence(String prefix) {
        SequenceNumber newSequence = new SequenceNumber();
        newSequence.setSequenceName(PO_SEQUENCE_NAME);
        newSequence.setPrefix(prefix);
        newSequence.setNextValue(1);
        return newSequence;
    }
}
