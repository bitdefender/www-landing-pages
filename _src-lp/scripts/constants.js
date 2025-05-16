export default class Constants {
  static GEOIP_ENDPOINT = 'https://www.bitdefender.com/geoip';

  static COUNTRY = 'bd:country';

  static TGT_GEO_OBJ = 'tgt:-424784351:h';

  static TGT_GEO_OBJ_KEY = 'x-geo-country-code';

  static LOCALE_PARAMETER = 'locale';

  static API_BASE = 'https://www.bitdefender.com';

  static API_ROOT = '/p-api/v1';

  static LOCALISATIONS = {
    au: 'en-au',
    be: 'en-us',
    br: 'pt-br',
    de: 'de-de',
    en: 'en-us',
    es: 'es-es',
    fr: 'fr-fr',
    it: 'it-it',
    nl: 'nl-nl',
    pt: 'pt-pt',
    ro: 'ro-ro',
    se: 'sv-se',
    uk: 'en-gb',
    'zh-tw': 'zh-tw',
  };

  static DEFAULT_LANGUAGE = 'en';
}
