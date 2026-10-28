
package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.klef.soa.exam.entity.RecyclingCenter;
import com.klef.soa.exam.repository.RecyclingCenterRepository;

@Service
public class RecyclingCenterServiceImpl implements RecyclingCenterService {

    private final RecyclingCenterRepository repo;

    public RecyclingCenterServiceImpl(RecyclingCenterRepository repo) {
        this.repo = repo;
    }

    @Override
    public String addCenter(RecyclingCenter center) {
        repo.save(center);
        return "Recycling center added successfully";
    }

    @Override
    public List<RecyclingCenter> displayAll() {
        return repo.findAll();
    }

    @Override
    public String deleteCenter(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return "Recycling center deleted successfully";
        }
        return "Recycling center not found";
    }

    @Override
    public Optional<RecyclingCenter> displayById(Long id) {
        return repo.findById(id);
    }

    @Override
    public List<RecyclingCenter> displayByStatus(Boolean open) {
        return repo.findByOpen(open);
    }

    @Override
    public Optional<RecyclingCenter> updateCenter(
            Long id, RecyclingCenter center) {

        return repo.findById(id).map(existing -> {
            existing.setCenterName(center.getCenterName());
            existing.setMaterialType(center.getMaterialType());
            existing.setDailyCapacityKg(center.getDailyCapacityKg());
            existing.setOpen(center.getOpen());

            return repo.save(existing);
        });
    }
}
