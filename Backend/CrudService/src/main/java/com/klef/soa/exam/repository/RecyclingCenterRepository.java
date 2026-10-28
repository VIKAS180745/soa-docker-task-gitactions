
package com.klef.soa.exam.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.klef.soa.exam.entity.RecyclingCenter;

public interface RecyclingCenterRepository
        extends JpaRepository<RecyclingCenter, Long> {

    List<RecyclingCenter> findByOpen(Boolean open);
}
