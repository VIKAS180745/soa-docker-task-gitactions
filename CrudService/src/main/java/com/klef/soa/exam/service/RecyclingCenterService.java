package com.klef.soa.exam.service;

import java.util.List;
import com.klef.soa.exam.entity.RecyclingCenter;

public interface RecyclingCenterService {

    String addCenter(RecyclingCenter center);

    List<RecyclingCenter> displayAll();

    String deleteCenter(Long id);
}