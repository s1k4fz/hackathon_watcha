import { charKiana } from './kiana';
import { charElysia } from './elysia';
import { charMei } from './mei';
import { charLinque } from './linque';
import { charLuoshu } from './luoshu';
import { charHelga } from './helga';
import { charZizhi } from './zizhi';
import { charSimon } from './simon';
import { charUni } from './uni';
import { initialEnemy as shadowKnightEnemy } from './shadow_knight';

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

export const initialPlayer = charLinque;
export const initialEnemy = shadowKnightEnemy;
