# Roadmap: Administration Accountability Tracker

**Last Updated**: 2025-11-24

## Future Enhancements

### Obsidian Integration: Bulk Export with Linking

**Priority**: Next Sprint
**Complexity**: Medium

**Description**:
Export all events (or filtered subset) as a ZIP archive of interconnected markdown files optimized for Obsidian's knowledge graph features.

**Key Features**:
- **Wikilinks between events**: Events referencing similar topics or sharing tags automatically link to each other using `[[Event Title]]` syntax
- **Tag index files**: Generate `tags/corruption.md`, `tags/dishonesty.md` etc. that list all events with that tag and backlink to them
- **Source detail files**: Each publication gets its own file (`sources/nytimes.md`) with:
  - Publication metadata (bias rating, credibility)
  - All articles cited from that source
  - Backlinks to events using those articles
- **Timeline views**: Generate `timeline/2025-01.md` monthly summaries with links to all events in that period
- **Admin period comparisons**: `comparisons/trump-1-vs-2.md` with side-by-side analysis structure
- **Folder structure options**:
  - By date: `/2025/01/event-title.md`
  - By tag: `/corruption/event-title.md`
  - Flat with tags in frontmatter

**Obsidian-Specific Considerations**:
- YAML frontmatter for Dataview plugin compatibility
- `#tag` format in addition to frontmatter tags
- Graph-friendly filenames (slugified, no special chars)
- Optional: Generate canvas file (`.canvas`) for visual mind map of events by tag

**Export Options UI**:
- Select date range or use current filters
- Choose folder organization style
- Include/exclude source detail files
- Include/exclude tag index files

---

*Add new roadmap items above this line*
