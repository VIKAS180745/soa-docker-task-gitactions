
package com.klef.soa.exam.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.klef.soa.exam.entity.RecyclingCenter;
import com.klef.soa.exam.service.RecyclingCenterService;

@RestController
@RequestMapping("/recyclingcenter")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class RecyclingCenterController {

    private final RecyclingCenterService service;

    public RecyclingCenterController(RecyclingCenterService service) {
        this.service = service;
    }

    @GetMapping("/")
    public String test() {
        return "CRUD Service is running";
    }

    @PostMapping("/Add")
    public String addCenter(@RequestBody RecyclingCenter center) {
        return service.addCenter(center);
    }

    @GetMapping("/DisplayAll")
    public List<RecyclingCenter> displayAll() {
        return service.displayAll();
    }

    @GetMapping("/DisplayById/{id}")
    public ResponseEntity<RecyclingCenter> displayById(
            @PathVariable("id") Long id) {

        return service.displayById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/DisplayByStatus")
    public List<RecyclingCenter> displayByStatus(
            @RequestParam(name = "open") Boolean open) {

        return service.displayByStatus(open);
    }

    @PutMapping("/Update/{id}")
    public ResponseEntity<?> updateCenter(
            @PathVariable("id") Long id,
            @RequestBody RecyclingCenter center) {

        Optional<RecyclingCenter> updated =
                service.updateCenter(id, center);

        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "message",
                    "Recycling center not found"
                ));
    }

    @DeleteMapping("/Delete/{id}")
    public ResponseEntity<String> deleteCenter(
            @PathVariable("id") Long id) {

        String result = service.deleteCenter(id);

        if (result.equals("Recycling center not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(result);
        }

        return ResponseEntity.ok(result);
    }
}
