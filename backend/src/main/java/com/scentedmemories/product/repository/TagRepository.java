package com.scentedmemories.product.repository;

import com.scentedmemories.product.entity.Tag;
import com.scentedmemories.product.entity.TagDimension;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findByDimension(TagDimension dimension);

    Optional<Tag> findByNameAndDimension(String name, TagDimension dimension);
}
