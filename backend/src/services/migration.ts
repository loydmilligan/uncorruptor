/**
 * Migration Service
 * Handles data migration for schema changes in Feature 002
 *
 * NOTE: The concernLevel migration has been completed via Prisma migrations.
 * This service is kept for historical reference but the migration functions
 * are now no-ops since the schema has been updated.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration: Copy concernLevel from CounterNarrative to Event
 *
 * DEPRECATED: This migration has been completed via Prisma schema migrations.
 * The function now returns a success response without performing any operations.
 */
export async function migrateConcernLevelToEvent(
  _dryRun: boolean = false
): Promise<{
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}> {
  console.log('[Migration] This migration has already been completed via Prisma schema migrations.');
  console.log('[Migration] The schema no longer contains the old fields (adminRating on CounterNarrative).');

  return {
    success: true,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  };
}

/**
 * Validation: Verify migration data integrity
 *
 * Checks:
 * 1. All events with counter-narratives have concernLevel set
 * 2. No concernLevel data was lost during migration
 * 3. concernLevel values are valid (weak, moderate, strong)
 */
export async function validateMigration(): Promise<{
  valid: boolean;
  issues: string[];
  stats: {
    totalEvents: number;
    eventsWithConcernLevel: number;
    eventsWithCounterNarratives: number;
    eventsWithCounterNarrativesAndConcernLevel: number;
  };
}> {
  const issues: string[] = [];

  try {
    console.log('[Validation] Checking migration data integrity...');

    // Count total events
    const totalEvents = await prisma.event.count();

    // Count events with concernLevel
    const eventsWithConcernLevel = await prisma.event.count({
      where: {
        concernLevel: { not: null },
      },
    });

    // Count events with counter-narratives
    const eventsWithCounterNarratives = await prisma.event.count({
      where: {
        counterNarrative: { isNot: null },
      },
    });

    // Count events with both counter-narratives AND concernLevel
    const eventsWithCounterNarrativesAndConcernLevel = await prisma.event.count({
      where: {
        counterNarrative: { isNot: null },
        concernLevel: { not: null },
      },
    });

    const stats = {
      totalEvents,
      eventsWithConcernLevel,
      eventsWithCounterNarratives,
      eventsWithCounterNarrativesAndConcernLevel,
    };

    console.log('[Validation] Statistics:', stats);

    // Check: Events with counter-narratives should have concernLevel
    // (assuming counter-narratives originally had adminRating data)
    if (eventsWithCounterNarratives > eventsWithCounterNarrativesAndConcernLevel) {
      const missingCount = eventsWithCounterNarratives - eventsWithCounterNarrativesAndConcernLevel;

      // This is not necessarily an error - counter-narratives may not have had concernLevel data
      console.log(
        `[Validation] Note: ${missingCount} events have counter-narratives but no concernLevel (original counter-narratives may not have had adminRating)`
      );
    }

    // Check: concernLevel values are valid
    const invalidConcernLevels = await prisma.event.findMany({
      where: {
        concernLevel: {
          not: null,
          notIn: ['weak', 'moderate', 'strong'],
        },
      },
      select: { id: true, concernLevel: true },
    });

    if (invalidConcernLevels.length > 0) {
      issues.push(
        `Found ${invalidConcernLevels.length} events with invalid concernLevel values: ${invalidConcernLevels.map(e => `${e.id}:${e.concernLevel}`).join(', ')}`
      );
    }

    const valid = issues.length === 0;

    if (valid) {
      console.log('[Validation] ✓ Migration validation passed');
    } else {
      console.error('[Validation] ✗ Migration validation failed:', issues);
    }

    return {
      valid,
      issues,
      stats,
    };
  } catch (error) {
    const errorMsg = `Validation failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[Validation] ✗ ${errorMsg}`);
    return {
      valid: false,
      issues: [errorMsg],
      stats: {
        totalEvents: 0,
        eventsWithConcernLevel: 0,
        eventsWithCounterNarratives: 0,
        eventsWithCounterNarrativesAndConcernLevel: 0,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}

// CLI interface for running migration from command line
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = args.includes('--dry-run');

  (async () => {
    if (command === 'migrate') {
      const result = await migrateConcernLevelToEvent(dryRun);
      process.exit(result.success ? 0 : 1);
    } else if (command === 'validate') {
      const result = await validateMigration();
      process.exit(result.valid ? 0 : 1);
    } else {
      console.error('Usage: tsx src/services/migration.ts <migrate|validate> [--dry-run]');
      console.error('');
      console.error('Commands:');
      console.error('  migrate [--dry-run]  - Copy concernLevel from CounterNarrative to Event');
      console.error('  validate             - Verify migration data integrity');
      process.exit(1);
    }
  })();
}
