// @ts-check
/**
 * The `currencies` resource — configured currencies. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Currency.types.js').Currency} Currency
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} CurrenciesApi
 * @property {(params?: object) => Promise<{ data: Currency[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Currency[]>} getAll
 * @property {(id: string) => Promise<Currency|null>} get
 */

/** @param {Transport} ctx @returns {CurrenciesApi} */
export function buildCurrencies(ctx) {
  return { ...baseResource(ctx, { path: '/settings/currencies', listKey: 'currencies', itemKey: 'currency' }) };
}
