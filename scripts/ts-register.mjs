/** Instala o hook de resolução dos testes. Ver scripts/ts-resolve.mjs. */
import { register } from 'node:module';

register('./ts-resolve.mjs', import.meta.url);
