package com.breakout.game.controller;

import com.breakout.game.model.Score;
import com.breakout.game.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*") // Allows calls from frontend on localhost:3000
public class ScoreController {

    private final ScoreRepository scoreRepository;

    @Autowired
    public ScoreController(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    // Save score endpoint
    @PostMapping
    public ResponseEntity<Score> saveScore(@RequestBody Score score) {
        if (score.getUsername() == null || score.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        score.setCreatedAt(LocalDateTime.now());
        Score savedScore = scoreRepository.save(score);
        return ResponseEntity.ok(savedScore);
    }

    // Get leaderboard endpoint
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Score>> getLeaderboard() {
        List<Score> leaderboard = scoreRepository.findTop10ByOrderByScoreDescLevelDescCreatedAtDesc();
        return ResponseEntity.ok(leaderboard);
    }
}
