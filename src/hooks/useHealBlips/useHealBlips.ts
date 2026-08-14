import { useEffect, useRef, useState } from "react";
import { Player } from "../../store/slices/playerSlice/types";

/** How long a "+N" blip stays on screen, in milliseconds. */
export const HEAL_BLIP_DURATION_MS = 1200;

/**
 * Tracks players whose health just went up, so the UI can flash a "+N" next to
 * them.
 *
 * Only a real increase counts: a player already at max health is left untouched
 * by the heal, so their health does not change and no blip is reported. Health
 * is tracked even while disabled, so switching the setting on does not replay an
 * increase that already happened.
 *
 * @param players - The current players, straight from the store
 * @param enabled - Whether heals should be announced at all
 * @param duration - How long each blip lasts, in milliseconds
 * @returns Map of player id to the amount they just healed
 */
export function useHealBlips(
  players: Player[],
  enabled: boolean,
  duration: number = HEAL_BLIP_DURATION_MS,
): Map<string, number> {
  const previousHealth = useRef<Map<string, number> | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [blips, setBlips] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const previous = previousHealth.current;

    // Snapshot first, so the comparison baseline stays current even when
    // disabled or when nothing healed.
    const snapshot = new Map<string, number>();
    players.forEach((player) => snapshot.set(player.id, player.health));
    previousHealth.current = snapshot;

    // Nothing to compare against on the very first render
    if (!enabled || previous === null) {
      return;
    }

    const healed = players
      .map((player) => {
        const before = previous.get(player.id);
        // Unknown player means they were just added, not healed
        if (before === undefined) return null;
        const amount = player.health - before;
        return amount > 0 ? { id: player.id, amount } : null;
      })
      .filter((entry): entry is { id: string; amount: number } => entry !== null);

    if (healed.length === 0) {
      return;
    }

    setBlips((current) => {
      const next = new Map(current);
      healed.forEach(({ id, amount }) => next.set(id, amount));
      return next;
    });

    healed.forEach(({ id }) => {
      // Restart the window if this player heals again mid-animation
      const running = timers.current.get(id);
      if (running) clearTimeout(running);

      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          setBlips((current) => {
            const next = new Map(current);
            next.delete(id);
            return next;
          });
        }, duration),
      );
    });
  }, [players, enabled, duration]);

  // Drop any pending timers when the list unmounts
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  return blips;
}

export default useHealBlips;
