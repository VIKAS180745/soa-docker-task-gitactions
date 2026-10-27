
package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import com.klef.soa.exam.entity.RecyclingCenter;

public interface RecyclingCenterService {

    String addCenter(RecyclingCenter center);

    List<RecyclingCenter> displayAll();

    String deleteCenter(Long id);

    Optional<RecyclingCenter> displayById(Long id);

    List<RecyclingCenter> displayByStatus(Boolean open);

    Optional<RecyclingCenter> updateCenter(Long id, RecyclingCenter center);
}
