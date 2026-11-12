---
slug: video_characters_api
title: "New Video Characters, Edit and Extension API support"
date: 2026-03-16T10:00:00
authors:
  - sameer
  - krrish
  - ishaan-alt
description: "Linten now supports creating, retrieving, and managing reusable video characters across multiple video generations."
tags: [videos, characters, proxy, routing]
hide_table_of_contents: false
---

Linten now supoports videos character, edit and extension apis.

{/* truncate */}

## What's New

Four new endpoints for video character operations:
- **Create character** - Upload a video to create a reusable asset
- **Get character** - Retrieve character metadata
- **Edit video** - Modify generated videos
- **Extend video** - Continue clips with character consistency

**Available from:** Linten v1.83.0+

## Quick Example

```python
import linten

# Create character from video
character = linten.avideo_create_character(
    name="Luna",
    video=open("luna.mp4", "rb"),
    custom_llm_provider="openai",
    model="sora-2"
)
print(f"Character: {character.id}")

# Use in generation
video = linten.avideo(
    model="sora-2",
    prompt="Luna dances through a magical forest.",
    characters=[{"id": character.id}],
    seconds="8"
)

# Get character info
fetched = linten.avideo_get_character(
    character_id=character.id,
    custom_llm_provider="openai"
)

# Edit with character preserved
edited = linten.avideo_edit(
    video_id=video.id,
    prompt="Add warm golden lighting"
)

# Extend sequence
extended = linten.avideo_extension(
    video_id=video.id,
    prompt="Luna waves goodbye",
    seconds="5"
)
```

## Via Proxy

```bash
# Create character
curl -X POST "http://localhost:4000/v1/videos/characters" \
  -H "Authorization: Bearer sk-linten-key" \
  -F "video=@luna.mp4" \
  -F "name=Luna"

# Get character
curl -X GET "http://localhost:4000/v1/videos/characters/char_abc123def456" \
  -H "Authorization: Bearer sk-linten-key"

# Edit video
curl -X POST "http://localhost:4000/v1/videos/edits" \
  -H "Authorization: Bearer sk-linten-key" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {"id": "video_xyz789"},
    "prompt": "Add warm golden lighting and enhance colors"
  }'

# Extend video
curl -X POST "http://localhost:4000/v1/videos/extensions" \
  -H "Authorization: Bearer sk-linten-key" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {"id": "video_xyz789"},
    "prompt": "Luna waves goodbye and walks into the sunset",
    "seconds": "5"
  }'
```

## Managed Character IDs

Linten automatically encodes provider and model metadata into character IDs:

**What happens:**
```
Upload character "Luna" with model "sora-2" on OpenAI
  ↓
Linten creates: char_abc123def456 (contains provider + model_id)
  ↓
When you reference it later, Linten decodes automatically
  ↓
Router knows exactly which deployment to use
```

**Behind the scenes:**
- Character ID format: `character_<base64_encoded_metadata>`
- Metadata includes: provider, model_id, original_character_id
- Transparent to you - just use the ID, Linten handles routing
