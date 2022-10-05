import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import { useCallback } from 'react';

import { Player } from '../components/types';

const KEY = 'LTC_PLAYERS';

export function usePlayerLocalStorage() {
  const [players] = useLocalStorage<Array<Player>>(KEY, []);

  const addPlayerToMemory = useCallback(
    (player: Player) => {
      writeStorage(KEY, [...players, player]);
    },
    [players],
  );

  return { addPlayerToMemory, players };
}
