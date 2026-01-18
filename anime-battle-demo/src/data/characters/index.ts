import { charKiana } from './kiana';
import { charElysia } from './elysia';
import { charMei } from './mei';
import { charLinque } from './linque';
import { charLuoshu } from './luoshu';
import { charHelga } from './helga';
import { charZizhi } from './zizhi';
import { charSimon } from './simon';
import { charUni } from './uni';
import { enemyShadowKnight } from './shadow_knight';
import { enemyVoidStalker } from './void_stalker';
import { enemyAbyssalMonarch } from './abyssal_monarch';

export const availableCharacters = [
  charLinque, 
  charLuoshu, 
  charHelga, 
  charZizhi, 
  charSimon, 
  charUni, 
  charKiana, 
  charElysia, 
  charMei
];

export const enemies = {
  shadowKnight: enemyShadowKnight,
  voidStalker: enemyVoidStalker,
  abyssalMonarch: enemyAbyssalMonarch
};

export const initialPlayer = charLinque;
// Default enemy
export const initialEnemy = enemyShadowKnight;
