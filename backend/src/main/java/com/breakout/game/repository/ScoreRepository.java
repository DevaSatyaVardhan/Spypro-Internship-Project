package com.breakout.game.repository;

import com.breakout.game.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    
    // Retrieves top 10 scores sorted by score descending, level descending, and date descending
    List<Score> findTop10ByOrderByScoreDescLevelDescCreatedAtDesc();
}
