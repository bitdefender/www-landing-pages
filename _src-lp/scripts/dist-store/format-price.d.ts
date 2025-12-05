export type PriceFormat = {
    price: number;
    currency?: string;
    locale?: Intl.UnicodeBCP47LocaleIdentifier;
};
export declare const formatPrice: ({ price, currency, locale }: PriceFormat) => string | number;
