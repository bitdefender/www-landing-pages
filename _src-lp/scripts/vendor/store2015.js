import {formatPrice} from "../utils.js";

if (typeof window.StoreProducts === 'undefined' || window.StoreProducts === null) {
  window.StoreProducts = new Object();
}

if (typeof window.StoreProducts.product === 'undefined' || window.StoreProducts.product === null) {
  window.StoreProducts.product = new Object();
}

if (typeof window.StoreProducts.events === 'undefined' || window.StoreProducts.events === null) {
  window.StoreProducts.events = new Object();
}

if (typeof window.StoreProducts.initCount === 'undefined' || window.StoreProducts.initCount === null) {
  window.StoreProducts.initCount = 0;
}

let DEBUG = false;
if (window.location.host.indexOf('localhost:3000') == 0) {
  DEBUG = true;
}

window.StoreProducts.initSelector = function (config) {
  window.is_product = true;
  if (typeof window.forcePL !== 'undefined' && window.forcePL == true) {
    config.force_region = 16;
    const now = new Date();
    const time = now.getTime();
    const expTime = time + 1000 * 3888000;
    now.setTime(expTime);
    document.cookie = `forceBuyCurrency=EUR; expires=${now.toGMTString()}; path=/`;
  }
  let product_id = null;
  let users_class = null;
  let selected_users = 3;
  let selected_years = 1;
  let years_class = null;
  let price_class = null;

  let full_price_class = null;
  let full_price_monthly_class = null;
  let discounted_price_class = null;
  let discounted_price_monthly_class = null;
  let save_class = null;
  let percent_class = null;

  let buy_class = null;
  let onChangeUsers = null;
  let onChangeYears = null;
  let onSelectorLoad = null;

  let discount = null;

  let extra_params = null;

  let doAjax = true;
  let force_platform = null;
  let force_region = null;

  let user_label = '';
  let year_label = '';
  let users_label = '';
  let years_label = '';

  let user_label_prefix = '';
  let users_label_prefix = '';
  let year_label_prefix = '';
  let years_label_prefix = '';

  let ignore_promotions = false;
  let initCount = 0;

  let method = 'POST';

  if ('initCount' in config) {
    initCount = config.initCount;
  } else {
    initCount = ++window.StoreProducts.initCount;
    config.initCount = initCount;
  }

  if ('product_id' in config) { product_id = config.product_id; }

  product_id = window.StoreProducts.filterProductIDExceptions(product_id);

  if ('users_class' in config) { users_class = config.users_class; }

  if ('years_class' in config) { years_class = config.years_class; }

  if ('selected_users' in config) { selected_users = config.selected_users; }

  if ('selected_years' in config) { selected_years = config.selected_years; }

  if ('price_class' in config) { price_class = config.price_class; }

  if ('full_price_class' in config) { full_price_class = config.full_price_class; }

  if ('full_price_monthly_class' in config) { full_price_monthly_class = config.full_price_monthly_class; }

  if ('discounted_price_class' in config) { discounted_price_class = config.discounted_price_class; }

  if ('discounted_price_monthly_class' in config) { discounted_price_monthly_class = config.discounted_price_monthly_class; }

  if ('save_class' in config) { save_class = config.save_class; }

  if ('percent_class' in config) { percent_class = config.percent_class; }

  if ('buy_class' in config) { buy_class = config.buy_class; }

  if ('user_label' in config) { user_label = config.user_label; }

  if ('users_label' in config) { users_label = config.users_label; }

  if ('year_label' in config) { year_label = config.year_label; }

  if ('years_label' in config) { years_label = config.years_label; }

  if ('user_label_prefix' in config) { user_label_prefix = config.user_label_prefix; }

  if ('users_label_prefix' in config) { users_label_prefix = config.users_label_prefix; }

  if ('year_label_prefix' in config) { year_label_prefix = config.year_label_prefix; }

  if ('years_label_prefix' in config) { years_label_prefix = config.years_label_prefix; }

  if ('extra_params' in config) { extra_params = config.extra_params; }

  if (typeof window.__global_extra_params !== 'undefined') {
    extra_params = config.extra_params = window.__global_extra_params;
  }

  if ('discount' in config) { discount = config.discount; }

  if ('doAjax' in config) { doAjax = config.doAjax; }

  if ('force_platform' in config) { force_platform = config.force_platform; }

  if ('force_region' in config) { force_region = config.force_region; }

  if ('onChangeUsers' in config) { onChangeUsers = config.onChangeUsers; }

  if ('onChangeYears' in config) { onChangeYears = config.onChangeYears; }

  if ('onSelectorLoad' in config) { onSelectorLoad = config.onSelectorLoad; }

  if ('ignore_promotions' in config) { ignore_promotions = config.ignore_promotions; }

  if ('method' in config) { method = config.method; }

  if (typeof __global_ignore_promotions !== 'undefined') {
    ignore_promotions = config.ignore_promotions = __global_ignore_promotions;
  }

  let hasPID = false;
  if (typeof tagit_params !== 'undefined') {
    for (let i in tagit_params.obj) {
      if ('pid' in tagit_params.obj[i]) {
        hasPID = true;

        break;
      }
    }
  }

  if (product_id == null) { return false; }

  //    if(users_class == null)
  //	return false;

  //    if(years_class == null)
  //	return false;

  const urlParams = {};

  try {
    (function () {
      let e;
      const a = /\+/g; // Regex for replacing addition symbol with a space
      const r = /([^&=]+)=?([^&]*)/g;
      const d = function (s) { return decodeURIComponent(s.replace(a, ' ')); };
      const q = window.location.search.substring(1);

      while (e = r.exec(q)) { urlParams[d(e[1])] = d(e[2]); }
    }());

    if ('force_country' in urlParams) {
      if (extra_params == null) {
        extra_params = { force_country: urlParams.force_country };
      } else {
        extra_params.force_country = urlParams.force_country;
      }
    }

    if ('cid' in urlParams) {
      config.cid = urlParams.cid;
    }

    if ('icid' in urlParams) {
      config.icid = urlParams.icid;
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (typeof window.StoreProducts.product[product_id] === 'undefined' || window.StoreProducts.product[product_id] === null) {
    if (doAjax == true) {
      // configure events
      const c_config = new Object();
      c_config.users_class = users_class;
      c_config.years_class = years_class;
      c_config.price_class = price_class;

      c_config.full_price_class = full_price_class;
      c_config.full_price_monthly_class = full_price_monthly_class;
      c_config.discounted_price_class = discounted_price_class;
      c_config.discounted_price_monthly_class = discounted_price_monthly_class;
      c_config.save_class = save_class;
      c_config.percent_class = percent_class;

      c_config.buy_class = buy_class;
      c_config.product_id = product_id;

      c_config.product_id = window.StoreProducts.filterProductIDExceptions(c_config.product_id);

      c_config.extra_params = extra_params;
      c_config.discount = discount;

      c_config.user_label = user_label;
      c_config.users_label = users_label;
      c_config.year_label = year_label;
      c_config.years_label = years_label;

      c_config.user_label_prefix = user_label_prefix;
      c_config.users_label_prefix = users_label_prefix;
      c_config.year_label_prefix = year_label_prefix;
      c_config.years_label_prefix = years_label_prefix;

      c_config.ignore_promotions = ignore_promotions;
      c_config.initCount = initCount;

      c_config.onChangeUsers = onChangeUsers;
      c_config.onChangeYears = onChangeYears;

      c_config.method = method;

      let on_users_change = null;
      let on_years_change = null;

      if (users_class != null) { on_users_change = window.StoreProducts.__onChangeUsers; }

      if (years_class != null) { on_years_change = window.StoreProducts.__onChangeYears; }

      if (users_class != null) {
        window.StoreProducts.events[users_class] = new Object();
        window.StoreProducts.events[users_class].onUsersChangeF = on_users_change;
        window.StoreProducts.events[users_class].onUsersChangeD = c_config;
      }

      if (years_class != null) {
        window.StoreProducts.events[years_class] = new Object();
        window.StoreProducts.events[years_class].onYearsChangeF = on_years_change;
        window.StoreProducts.events[years_class].onYearsChangeD = c_config;
      }

      if (years_class != null && users_class != null) {
        window.StoreProducts.events[users_class + years_class] = new Object();
        window.StoreProducts.events[users_class + years_class].onSelectorLoad = onSelectorLoad;
      }

      const so = new Object();
      so.ev = 1;
      so.product_id = product_id;
      config.doAjax = false;
      config.onSelectorLoad = null;
      config.onChangeUsers = null;
      config.onChangeYears = null;
      so.config = config;

      const BASE_URL = ['author', 'localhost', 'local', 'stage', 'dev', 'dev1', 'dev2', 'dev3', 'new'].includes(window.location.hostname.split(/\.|-/)[0]) ? 'https://www.bitdefender.com' : '';

      let url = `${BASE_URL}/site/Store/ajax`;

      // if (window.location.hostname == 'www.bitdefender.se') {
      //     BASE_URI = "https://www.bitdefender.se/site";
      // }

      let forceBussiness = false;
      const siteSection = window.location.pathname.indexOf('/business/') !== -1 ? 'business' : 'consumer';
      if (siteSection === 'business') {
        forceBussiness = true;
      }

      let BASE_URI = 'https://www.bitdefender.com/site';
      // todo convert this if else to Map
      if (DEFAULT_LANGUAGE) {
        let DOMAIN = DEFAULT_LANGUAGE;
        if (DOMAIN === 'en') {
          DOMAIN = 'com';
        } else if (DOMAIN === 'uk') {
          DOMAIN = 'co.uk';
        } else if (DOMAIN === 'au') {
          DOMAIN = 'com.au';
        } else if (DOMAIN === 'br') {
          DOMAIN = 'com.br';
        } else if (DOMAIN === 'zh-hk' || DOMAIN === 'zh-tw') {
          DOMAIN = 'com';
        }

        BASE_URI = `https://www.bitdefender.${DOMAIN}/site`;
      }

      if ((DEFAULT_LANGUAGE === 'zh-hk' || DEFAULT_LANGUAGE === 'zh-tw')) {
        if (so.product_id === 'psp' || so.product_id === 'pspm' || so.product_id === 'dip' || so.product_id === 'dipm') {
          so.config.force_region = '16';
        } else {
          so.config.force_region = DEFAULT_LANGUAGE === 'zh-hk' ? '41' : '52';
        }
      }

      try {
        if (typeof multilang_js !== 'undefined' && multilang_js != null && window.location.href.match(/www2.bitdefender.com/gi)) {
          if ('DEFAULT_LANGUAGE' in multilang_js) { url = `/${multilang_js.DEFAULT_LANGUAGE}/Store/ajax`; }
        }

        if (typeof BASE_URI !== 'undefined') {
          if (BASE_URI != null) {
            if (BASE_URI.length > 0) {
              url = `${BASE_URI}/Store/ajax`;
            }
          }
        }
      } catch (ex) {
        DEBUG && console.log(ex);
      }

      try {
        /* if (forceBussiness == true) {
          urlParams.force_country = 'us';
        }*/

        // if it's us
        if (window.location.pathname.indexOf(`/us/`) !== -1) {
          url = `${url}?force_country=us`;
        } else {
          if ('force_country' in urlParams) {
            url = `${url}?force_country=${urlParams.force_country}`;
          }
        }
      } catch (ex) {
        DEBUG && console.log(ex);
      }
      so.url = url;
      window.StoreProducts.filterRequestObject(so);

      return false;
    }
    return false;
  }

  if (!(users_class + years_class in window.StoreProducts.events)) { window.StoreProducts.events[users_class + years_class] = new Object(); }

  if (!(users_class in window.StoreProducts.events)) { window.StoreProducts.events[users_class] = new Object(); }

  if (!(years_class in window.StoreProducts.events)) { window.StoreProducts.events[years_class] = new Object(); }

  // configure events
  if (typeof window.StoreProducts.events[users_class + years_class].onSelectorLoad === 'undefined' || window.StoreProducts.events[users_class + years_class].onSelectorLoad === null) { window.StoreProducts.events[users_class + years_class].onSelectorLoad = onSelectorLoad; }

  if (typeof window.StoreProducts.events[users_class].onUsersChangeF === 'undefined' || window.StoreProducts.events[users_class].onUsersChangeF === null) {
    const c_config = new Object();
    c_config.users_class = users_class;
    c_config.years_class = years_class;
    c_config.price_class = price_class;

    c_config.full_price_class = full_price_class;
    c_config.full_price_monthly_class = full_price_monthly_class;
    c_config.discounted_price_class = discounted_price_class;
    c_config.discounted_price_monthly_class = discounted_price_monthly_class;
    c_config.save_class = save_class;
    c_config.percent_class = percent_class;

    c_config.buy_class = buy_class;
    c_config.product_id = product_id;

    c_config.product_id = window.StoreProducts.filterProductIDExceptions(c_config.product_id);

    c_config.user_label = user_label;
    c_config.users_label = users_label;
    c_config.year_label = year_label;
    c_config.years_label = years_label;

    c_config.user_label_prefix = user_label_prefix;
    c_config.users_label_prefix = users_label_prefix;
    c_config.year_label_prefix = year_label_prefix;
    c_config.years_label_prefix = years_label_prefix;

    c_config.extra_params = extra_params;
    c_config.discount = discount;

    c_config.ignore_promotions = ignore_promotions;

    c_config.onChangeUsers = onChangeUsers;
    c_config.onChangeYears = onChangeYears;

    let on_users_change = null;
    if (users_class != null) { on_users_change = window.StoreProducts.__onChangeUsers; }

    if (users_class != null) {
      window.StoreProducts.events[users_class].onUsersChangeF = on_users_change;
      window.StoreProducts.events[users_class].onUsersChangeD = c_config;
    }
  }

  if (typeof window.StoreProducts.events[years_class].onYearsChangeF === 'undefined' || window.StoreProducts.events[years_class].onYearsChangeF === null) {
    const c_config = new Object();
    c_config.users_class = users_class;
    c_config.years_class = years_class;
    c_config.price_class = price_class;

    c_config.full_price_class = full_price_class;
    c_config.full_price_monthly_class = full_price_monthly_class;
    c_config.discounted_price_class = discounted_price_class;
    c_config.discounted_price_monthly_class = discounted_price_monthly_class;
    c_config.save_class = save_class;
    c_config.percent_class = percent_class;

    c_config.buy_class = buy_class;
    c_config.product_id = product_id;

    c_config.product_id = window.StoreProducts.filterProductIDExceptions(c_config.product_id);

    c_config.user_label = user_label;
    c_config.users_label = users_label;
    c_config.year_label = year_label;
    c_config.years_label = years_label;

    c_config.extra_params = extra_params;
    c_config.discount = discount;

    c_config.user_label_prefix = user_label_prefix;
    c_config.users_label_prefix = users_label_prefix;
    c_config.year_label_prefix = year_label_prefix;
    c_config.years_label_prefix = years_label_prefix;

    c_config.ignore_promotions = ignore_promotions;

    c_config.onChangeUsers = onChangeUsers;
    c_config.onChangeYears = onChangeYears;

    let on_years_change = null;
    if (years_class != null) { on_years_change = window.StoreProducts.__onChangeYears; }

    if (years_class != null) {
      window.StoreProducts.events[years_class].onYearsChangeF = on_years_change;
      window.StoreProducts.events[years_class].onYearsChangeD = c_config;
    }
  }

  if (users_class != null) {
    const elements = document.getElementsByClassName(users_class);
    Array.from(elements).forEach((element) => {
      element.addEventListener('change', (e) => {
        e.data = window.StoreProducts.events[users_class].onUsersChangeD;
        return window.StoreProducts.events[users_class].onUsersChangeF(e);
      });
    });
  }

  if (years_class != null) {
    const elements = document.getElementsByClassName(years_class);
    Array.from(elements).forEach((element) => {
      element.addEventListener('change', (e) => {
        e.data = window.StoreProducts.events[years_class].onYearsChangeD;
        return window.StoreProducts.events[years_class].onYearsChangeF(e);
      });
    });
  }

  let r;
  try {
    let l_hash = location.hash;

    if (l_hash.length < 1) {
      if ('var' in urlParams) { l_hash = urlParams.var; }
    }

    if (l_hash.length > 1) {
      const pt = new RegExp(`${window.StoreProducts.product[product_id].product_alias}\\-(\\d{1,2})u\\-(\\d{1})y`);

      if (pt != null) {
        r = pt.exec(l_hash);

        if (Array.isArray(r)) {
          if (r.length == 3) {
            if (r[1] in window.StoreProducts.product[product_id].variations) {
              selected_users = r[1];
              const elements = document.querySelectorAll(`.nousers-${selected_users}`);
              Array.from(elements).forEach((element) => {
                const event = new Event('click');
                element.dispatchEvent(event);
              });
            }
            if (r[2] in window.StoreProducts.product[product_id].variations[selected_users]) {
              selected_years = r[2];
              const yearElement = document.getElementById(`year${selected_years}`);
              const yearBtmElement = document.getElementById(`year${selected_years}_btm`);
              const topTimeSelectorElement = document.getElementById(`topTimeSelector-${selected_years}`);

              const clickEvent = new Event('click');

              yearElement.dispatchEvent(clickEvent);
              yearBtmElement.dispatchEvent(clickEvent);
              topTimeSelectorElement.dispatchEvent(clickEvent);
            }
          }
        }
      }
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  let users = new Array();

  if (users_class != null) {
    try {
      for (let i in window.StoreProducts.product[product_id].variations) { users.push(i); }

      users = users.sort((a, b) => a - b);
    } catch (ex) {
      DEBUG && console.log(ex);
    }

    users.forEach((value) => {
      let label = `${users_label_prefix} ${value} ${users_label}`;
      if (value == 1) { label = `${user_label_prefix} ${value} ${user_label}`; }

      label = label.trim();

      const parentElement = document.querySelector(`.${users_class}`);
      const optionElement = document.createElement('option');
      optionElement.value = value;
      optionElement.textContent = label;
      parentElement.appendChild(optionElement);
    });

    const elements = document.querySelectorAll(`.${users_class} [value="${selected_users}"]`);
    Array.from(elements).forEach((element) => {
      element.selected = true;
    });

    if (document.querySelectorAll(`.${users_class}`).length) {
      const selectElement = document.querySelector(`.${users_class}`);
      selected_users = selectElement.value;
    }
  }

  let years = new Array();

  if (years_class != null) {
    try {
      for (let i in window.StoreProducts.product[product_id].variations[selected_users]) { years.push(i); }

      years = years.sort((a, b) => a - b);
    } catch (ex) {
      DEBUG && console.log(ex);
    }

    years.forEach((value) => {
      let label = `${years_label_prefix} ${value} ${years_label}`;
      if (value == 1) { label = `${year_label_prefix} ${value} ${year_label}`; }

      label = label.trim();

      const parentElement = document.querySelector(`.${years_class}`);
      const optionElement = document.createElement('option');
      optionElement.value = value;
      optionElement.textContent = label;
      parentElement.appendChild(optionElement);
    });

    const elements = document.querySelectorAll(`.${years_class} [value="${selected_years}"]`);
    Array.from(elements).forEach((element) => {
      element.selected = true;
    });

    if (document.querySelectorAll(`.${years_class}`).length) {
      const selectElement = document.querySelector(`.${years_class}`);
      selected_years = selectElement.value;
    }
  }
  let variation = null;
  let base_uri = '';

  try {
    variation = window.StoreProducts.product[product_id].variations[selected_users][selected_years];
    base_uri = window.StoreProducts.product[product_id].base_uri;
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (variation == null) {
    try {
      let min_users = 0;
      for (let i in window.StoreProducts.product[product_id].variations) {
        if (min_users < i) { min_users = i; }
      }

      if (min_users > 0) {
        selected_users = min_users;
        let min_years = 0;

        for (let i in window.StoreProducts.product[product_id].variations[selected_users]) {
          if (min_years < i) { min_years = i; }
        }

        if (min_years > 0) {
          selected_years = min_years;

          variation = window.StoreProducts.product[product_id].variations[selected_users][selected_years];
          base_uri = window.StoreProducts.product[product_id].base_uri;
        }
      }
    } catch (ex) {
      DEBUG && console.log(ex);
    }
  }

  if (variation == null) { return false; }

  let price = `${variation.price} ${variation.currency_label}`;
  price = formatPrice(variation.price, variation.currency_iso, variation.region_id);

  let discounted_price = '';
  let discounted_price_monthly = '';
  let full_price = price;
  let full_price_monthly = formatPrice((variation.price / 12).toFixed(2), variation.currency_iso, variation.region_id);

  // if (window.location.hostname == 'www.bitdefender.se') {
  //     base_uri = "https://www.bitdefender.se/site";
  // }

  if ((typeof window.geoip_code !== 'undefined' && window.geoip_code == 'gb') || window.location.hostname == 'www.bitdefender.co.uk' || window.location.hostname == 'old.bitdefender.co.uk') {
    base_uri = 'https://www.bitdefender.co.uk/site';
  }

  let buy_link = `${base_uri}/Store/buy/${product_id}/${selected_users}/${selected_years}`;
  let save_price;
  let percent_value;

  try {
    if ('discount' in variation) {
      if ('discounted_price' in variation.discount) {
        discounted_price = formatPrice(variation.discount.discounted_price, variation.currency_iso, variation.region_id);
        discounted_price_monthly = formatPrice((variation.discount.discounted_price / 12).toFixed(2), variation.currency_iso, variation.region_id);
        save_price = formatPrice(Math.ceil(variation.price - variation.discount), variation.currency_iso, variation.region_id);
        percent_value = `${variation.discount.discount_value}%`;
        price = `<span class="store_price_full">${price}</span><span class="store_price_cut">${discounted_price}</span>`;
      }

      if ('coupon' in variation.discount) {
        variation.discount.coupon = variation.discount.coupon.trim();

        if (variation.discount.coupon.length > 0) { buy_link = `${base_uri}/Store/buy/${product_id}/${selected_users}/${selected_years}/` + `coupon.${encodeURIComponent(variation.discount.coupon)}/` + `platform.${variation.platform_id}`; } else { buy_link = `${base_uri}/Store/buy/${product_id}/${selected_users}/${selected_years}/` + `platform.${variation.platform_id}`; }
      }

      if ('ref' in variation.discount) {
        if (variation.discount.ref.length > 0) { buy_link = `${buy_link}/ref.${variation.discount.ref}`; }
      }
    } else
      if (discount != null) {
        discounted_price = window.StoreProducts.getDiscountedPrice(variation.price, discount);
        discounted_price_monthly = formatPrice((discounted_price / 12).toFixed(2), variation.currency_iso, variation.region_id);
        discounted_price = formatPrice(discounted_price, variation.currency_iso, variation.region_id);
        save_price = formatPrice(Math.ceil(variation.price - variation.discount), variation.currency_iso, variation.region_id);
        percent_value = (((variation.price - variation.discount) / variation.price) * 100).toFixed(0);
        percent_value = `${variation.discount.discount_value}%`;
        price = `<span class="store_price_full">${price}</span><span class="store_price_cut">${discounted_price}</span>`;
      }
  } catch (ex) {
    console.log(ex);
  }

  try {
    if (extra_params != null) {
      let params = '';

      for (let op in extra_params) {
        if (op == 'force_country') { continue; }

        extra_params[op] = extra_params[op].trim();
        if (extra_params[op].length < 1) { continue; }

        const re = new RegExp(`${op}.[^/]*/?`, 'g');

        buy_link = buy_link.replace(re, '');
        buy_link = buy_link.replace(/\/$/g, '');

        if (params.length == 0) { params = `/${op}.${encodeURIComponent(extra_params[op])}`; } else { params = `${params}/${op}.${encodeURIComponent(extra_params[op])}`; }
      }

      if (params.length > 1) buy_link += params;

      buy_link = window.StoreProducts.filterBuyLink(config, buy_link);

      if ('force_country' in extra_params) { buy_link = `${buy_link}?force_country=${extra_params.force_country}`; }
    } else {
      buy_link = window.StoreProducts.filterBuyLink(config, buy_link);
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (price_class != null) {
    const elements = document.getElementsByClassName(price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = price;
    });
    if (variation.currency_label.length > 2) {
      const elements = document.getElementsByClassName(price_class);
      Array.from(elements).forEach((element) => {
        element.classList.add('makeItSmall');
      });
    }
  }

  try {
    if (price_class != null) {
      const p_len = full_price.length + discounted_price.length;

      if (p_len <= 10) {
        const elements = document.getElementsByClassName(price_class);
        Array.from(elements).forEach((element) => {
          element.classList.add('price_small');
        });
      }

      if (p_len > 10 && p_len <= 18) {
        const elements = document.getElementsByClassName(price_class);
        Array.from(elements).forEach((element) => {
          element.classList.add('price_medium');
        });
      }

      if (p_len > 18) {
        const elements = document.getElementsByClassName(price_class);
        Array.from(elements).forEach((element) => {
          element.classList.add('price_large');
        });
      }
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  full_price = full_price;
  full_price_monthly = full_price_monthly;
  discounted_price = discounted_price;
  discounted_price_monthly = discounted_price_monthly;
  //save_price = save_price;
  //percent_value = percent_value;

  if (discounted_price_class != null) {
    const elements = document.getElementsByClassName(discounted_price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = discounted_price;
    });
  }

  if (discounted_price_monthly_class != null) {
    const elements = document.getElementsByClassName(discounted_price_monthly_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = discounted_price_monthly;
    });
  }

  if (full_price_class != null) {
    const elements = document.getElementsByClassName(full_price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = full_price;
    });
  }

  if (full_price_monthly_class != null) {
    const elements = document.getElementsByClassName(full_price_monthly_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = full_price_monthly;
    });
  }

  if (save_class != null) {
    const elements = document.getElementsByClassName(save_class);
    if (typeof save_price !== 'undefined') {
      Array.from(elements).forEach((element) => {
        element.innerHTML = save_price;
      });
    } else {
      Array.from(elements).forEach((element) => {
        element.style.display = "none";
      });
    }
  }

  if (percent_class != null) {
    const elements = document.getElementsByClassName(percent_class);
    if (typeof percent_value !== 'undefined') {
      Array.from(elements).forEach((element) => {
        element.innerHTML = percent_value;
      });
    } else {
      Array.from(elements).forEach((element) => {
        element.style.display = "none";
      });
    }
  }

  if (buy_class != null) {
    // DEX-11415
    const elements = document.querySelectorAll(`.${buy_class}`);
    Array.from(elements).forEach((element) => {
      element.addEventListener('click', (e) => {
        let buy_link = element.getAttribute('href');
        if (buy_link.indexOf('adobe_mc') === -1) {
          e.preventDefault();
          buy_link = window.StoreProducts.appendVisitorID(buy_link);
          window.location.href = buy_link;
        }
      });

      element.setAttribute('href', buy_link);
    });

    if (typeof window.__targetCallBack !== 'undefined') {
      try {
        window.__targetCallBack(buy_class, c_config.product_id, selected_users, selected_years);
      } catch (ex) {
        console.log(`target ex:${ex}`);
      }
    }
  }

  try {
    window.StoreProducts.setDigitalData(product_id, variation);
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    let ocg = window.StoreProducts.events[users_class + years_class].onSelectorLoad;

    const thisObj = new Object();
    thisObj.selected_users = selected_users;
    thisObj.selected_years = selected_years;
    thisObj.selected_variation = variation;
    thisObj.buy_link = buy_link;
    thisObj.config = config;

    // A: Omniture Buy link, click tracking
    try {
      const elements = document.getElementsByClassName(config.buy_class);
      Array.from(elements).forEach((element) => {
        element.addEventListener('click', function (e) {
          if (typeof oBuyLinkClick === 'function') {
            oBuyLinkClick(this, DEFAULT_LANGUAGE, e.currentTarget.dataset.obj.config.product_id, window.StoreProducts.product[e.currentTarget.dataset.obj.config.product_id].product_name, `${e.currentTarget.dataset.obj.selected_users}u,${e.currentTarget.dataset.obj.selected_years}y`);
          }
        }.bind({ config, selected_users: thisObj.selected_users, selected_years: thisObj.selected_years }));
      });
    } catch (ex) {
      DEBUG && console.log(ex);
    }
    // end Omniture Buy link

    if (ocg != null) {
      ocg.call(thisObj);
    }

    if ('promotion_functions' in variation) {
      if (variation.promotion_functions.length > 0) {
        const jsc = Base64.decode(variation.promotion_functions);

        const PromotionFunctions = null;

        eval(jsc);

        window.StoreProducts.events[users_class + years_class].promotionsCleanUp = {};

        if ('cleanUp' in PromotionFunctions) {
          window.StoreProducts.events[users_class + years_class].promotionsCleanUp[variation.promotion] = PromotionFunctions.cleanUp;
        }

        ocg = PromotionFunctions.onLoad;

        ocg.call(thisObj);
      }
    }

    try {
      if (typeof StoreCBS !== 'undefined' && StoreCBS != null && ('go' in StoreCBS)) {
        StoreCBS.go(thisObj, ['selector', 'onload', window.StoreProducts.product[product_id].product_id, window.StoreProducts.product[product_id].product_alias, `initCount:${config.initCount}`, `productType:${window.StoreProducts.product[product_id].product_type}`]);
      }
    } catch (ex) {
      DEBUG && console.log(ex);
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }
};

window.StoreProducts.getDiscountedPrice = function (val, pc) {
  const dp = (val * pc) / 100;
  val -= dp;
  val = val.toFixed(2);
  return val;
};

window.StoreProducts.__onChangeUsers = function (ev) {
  const c_config = ev.data;
  const selectElementUsers = document.querySelector(`.${c_config.users_class}`);
  const selected_users = selectElementUsers.options[selectElementUsers.selectedIndex].value;

  let years = [];

  try {
    for (let i in window.StoreProducts.product[c_config.product_id].variations[selected_users]) { years.push(i); }

    years = years.sort((a, b) => a - b);
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  // retin valoarea selectata
  const selectElementYears = document.querySelector(`.${c_config.years_class}`);
  const old_selected_years = selectElementYears.options[selectElementYears.selectedIndex].value;

  // distrug si refac selectorul
  const elementsYears = document.getElementsByClassName(c_config.years_class);
  Array.from(elementsYears).forEach((element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  });

  years.forEach((value) => {
    let label = `${value} ${c_config.years_label}`;

    if (value == 1) { label = `${value} ${c_config.year_label}`; }

    Array.from(elementsYears).forEach((element) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      element.appendChild(option);
    });
  });

  try {
    // reselectez vechea valoare, daca initial e selectat 1u 3y si se selecteaza 5u o sa se reselecteze automat 3y
    const selectElement = document.querySelector(`.${c_config.years_class}`);
    const optionElement = selectElement.querySelector(`option[value="${old_selected_years}"]`);
    optionElement.selected = true;
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  const selected_years = document.querySelector(`.${c_config.years_class}`).value;

  let variation = null;
  let base_uri = '';

  try {
    variation = window.StoreProducts.product[c_config.product_id].variations[selected_users][selected_years];
    base_uri = window.StoreProducts.product[c_config.product_id].base_uri;
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (variation == null) { return null; }

  let price = `${variation.price} ${variation.currency_label}`;
  price = formatPrice(variation.price, variation.currency_iso, variation.region_id);
  let price_monthly = formatPrice((variation.price / 12).toFixed(2), variation.currency_iso, variation.region_id);
  let discounted_price = '';
  let discounted_price_monthly = '';
  let save_price = '';
  let percent_value = '';
  let full_price = price;
  let full_price_monthly = price_monthly;

  // if (window.location.hostname == 'www.bitdefender.se') {
  //     base_uri = "https://www.bitdefender.se/site";
  // }

  let buy_link = `${base_uri}/Store/buy/${c_config.product_id}/${selected_users}/${selected_years}`;

  try {
    if ('discount' in variation) {
      if ('discounted_price' in variation.discount) {
        discounted_price = formatPrice(variation.discount.discounted_price, variation.currency_iso, variation.region_id);
        discounted_price_monthly = formatPrice((variation.discount.discounted_price / 12).toFixed(2), variation.currency_iso, variation.region_id);
        save_price = formatPrice(Math.ceil(variation.price - variation.discount.discounted_price), variation.currency_iso, variation.region_id);
        percent_value = `${variation.discount.discount_value}%`;
        price = `<span class="store_price_full">${price}</span><span class="store_price_cut">${discounted_price}</span>`;
      }

      if ('coupon' in variation.discount) {
        variation.discount.coupon = variation.discount.coupon.trim();

        if (variation.discount.coupon.length > 0) { buy_link = `${base_uri}/Store/buy/${c_config.product_id}/${selected_users}/${selected_years}/` + `coupon.${encodeURIComponent(variation.discount.coupon)}/` + `platform.${variation.platform_id}`; } else { buy_link = `${base_uri}/Store/buy/${c_config.product_id}/${selected_users}/${selected_years}/` + `platform.${variation.platform_id}`; }
      }

      if ('ref' in variation.discount) {
        if (variation.discount.ref.length > 0) { buy_link = `${buy_link}/ref.${variation.discount.ref}`; }
      }
    } else
      if (discount in c_config) {
        if (c_config.discount != null) {
          discounted_price = window.StoreProducts.getDiscountedPrice(variation.price, discount);
          discounted_price_monthly = formatPrice((discounted_price / 12).toFixed(2), variation.currency_iso, variation.region_id);
          discounted_price = formatPrice(discounted_price, variation.currency_iso, variation.region_id);
          save_price = formatPrice(Math.ceil(variation.price - variation.discount.discounted_price), variation.currency_iso, variation.region_id);
          percent_value = `${variation.discount.discount_value}%`;
          price = `<span class="store_price_full">${price}</span><span class="store_price_cut">${discounted_price}</span>`;
        }
      }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    if ('extra_params' in c_config) {
      if (c_config.extra_params != null) {
        let params = '';
        for (let op in c_config.extra_params) {
          if (op == 'force_country' || !c_config.extra_params[op]) { continue; }

          c_config.extra_params[op] = c_config.extra_params[op].trim();
          if (c_config.extra_params[op].length < 1) { continue; }

          const re = new RegExp(`${op}.[^/]*/?`, 'g');

          buy_link = buy_link.replace(re, '');
          buy_link = buy_link.replace(/\/$/g, '');

          if (params.length == 0) { params = `/${op}.${encodeURIComponent(c_config.extra_params[op])}`; } else { params = `${params}/${op}.${encodeURIComponent(c_config.extra_params[op])}`; }
        }

        if (params.length > 1) buy_link += params;

        if ('force_country' in c_config.extra_params) { buy_link = `${buy_link}?force_country=${c_config.extra_params.force_country}`; }
      }
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  const elementsPrice = document.getElementsByClassName(c_config.price_class);
  Array.from(elementsPrice).forEach((element) => {
    element.innerHTML = price;
  });

  full_price = full_price;
  full_price_monthly = full_price_monthly;
  discounted_price = discounted_price;
  discounted_price_monthly = discounted_price_monthly;
  save_price = save_price;
  percent_value = percent_value;

  if (c_config.discounted_price_class != null) {
    const elements = document.getElementsByClassName(c_config.discounted_price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = discounted_price;
    });
  }

  if (c_config.discounted_price_monthly_class != null) {
    const elements = document.getElementsByClassName(c_config.discounted_price_monthly_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = discounted_price_monthly;
    });
  }

  if (c_config.full_price_class != null) {
    const elements = document.getElementsByClassName(c_config.full_price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = full_price;
    });
  }

  if (c_config.full_price_monthly_class != null) {
    const elements = document.getElementsByClassName(c_config.full_price_monthly_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = full_price_monthly;
    });
  }

  if (c_config.save_class != null) {
    const elements = document.getElementsByClassName(c_config.save_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = save_price;
    });
  }

  if (c_config.percent_class != null) {
    const elements = document.getElementsByClassName(c_config.percent_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = percent_value;
    });
  }

  buy_link = window.StoreProducts.filterBuyLink(c_config, buy_link);
  buy_link = window.StoreProducts.appendVisitorID(buy_link);
  const elements = document.querySelectorAll(`.${c_config.buy_class}`);
  Array.from(elements).forEach((element) => {
    element.setAttribute('href', buy_link);
  });

  try {
    let ocg = c_config.onChangeUsers;
    const thisObj = new Object();

    thisObj.selected_users = selected_users;
    thisObj.selected_years = selected_years;
    thisObj.selected_variation = variation;
    thisObj.buy_link = buy_link;
    thisObj.config = c_config;

    if (ocg != null) {
      ocg.call(thisObj);
    }

    const users_class = c_config.users_class;
    const years_class = c_config.years_class;

    if ('promotionsCleanUp' in window.StoreProducts.events[users_class + years_class]) {
      for (let iev in window.StoreProducts.events[users_class + years_class].promotionsCleanUp) {
        ocg = window.StoreProducts.events[users_class + years_class].promotionsCleanUp[iev];
        ocg.call(thisObj);
      }
    }

    if ('promotion_functions' in variation) {
      if (variation.promotion_functions.length > 0) {
        const jsc = Base64.decode(variation.promotion_functions);

        const PromotionFunctions = null;

        eval(jsc);

        if (!('promotionsCleanUp' in window.StoreProducts.events[users_class + years_class])) { window.StoreProducts.events[users_class + years_class].promotionsCleanUp = {}; }

        if ('cleanUp' in PromotionFunctions) {
          if (!(variation.promotion in window.StoreProducts.events[users_class + years_class].promotionsCleanUp)) { window.StoreProducts.events[users_class + years_class].promotionsCleanUp[variation.promotion] = PromotionFunctions.cleanUp; }
        }

        ocg = PromotionFunctions.onChange;
        ocg.call(thisObj);
      }
    }

    try {
      if (typeof window.StoreCBS !== 'undefined' && window.StoreCBS != null && ('go' in window.StoreCBS)) {
        window.StoreCBS.go(thisObj, ['selector', 'onchange', 'onchangeusers', window.StoreProducts.product[c_config.product_id].product_id, window.StoreProducts.product[c_config.product_id].product_alias, `initCount:${c_config.initCount}`, `productType:${window.StoreProducts.product[c_config.product_id].product_type}`]);
      }
    } catch (ex) {
      DEBUG && console.log(ex);
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    delete window.digitalData?.product;
    window.StoreProducts.setDigitalData(c_config.product_id, variation);
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (typeof window.__targetCallBack !== 'undefined') {
    try {
      window.__targetCallBack(c_config.buy_class, c_config.product_id, selected_users, selected_years);
    } catch (ex) { console.log(`target ex:${ex}`); }
  }
};

window.StoreProducts.__onChangeYears = function (ev) {
  const c_config = ev.data;
  const selected_users = document.querySelector(`.${c_config.users_class}`).value;
  const selected_years = document.querySelector(`.${c_config.years_class}`).value;

  let variation = null;
  let base_uri = '';

  try {
    variation = window.StoreProducts.product[c_config.product_id].variations[selected_users][selected_years];
    base_uri = window.StoreProducts.product[c_config.product_id].base_uri;
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (variation == null) { return false; }

  let price = `${variation.price} ${variation.currency_label}`;
  price = formatPrice(variation.price, variation.currency_iso, variation.region_id);
  let price_monthly = formatPrice((variation.price / 12).toFixed(2), variation.currency_iso, variation.region_id);
  let discounted_price = '';
  let discounted_price_monthly = '';
  let save_price = '';
  let percent_value = '';
  let full_price = price;
  let full_price_monthly = price_monthly;

  // if (window.location.hostname == 'www.bitdefender.se') {
  //     base_uri = "https://www.bitdefender.se/site";
  // }

  let buy_link = `${base_uri}/Store/buy/${c_config.product_id}/${selected_users}/${selected_years}`;

  try {
    if ('discount' in variation) {
      if ('discounted_price' in variation.discount) {
        discounted_price = formatPrice(variation.discount.discounted_price, variation.currency_iso, variation.region_id);
        discounted_price_monthly = formatPrice((variation.discount.discounted_price / 12).toFixed(2), variation.currency_iso, variation.region_id);
        save_price = formatPrice(Math.ceil(variation.price - variation.discount.discounted_price), variation.currency_iso, variation.region_id);
        percent_value = `${variation.discount.discount_value}%`;
        price = `<span class="store_price_full">${price}</span><span class="store_price_cut">${discounted_price}</span>`;
      }

      if ('coupon' in variation.discount) {
        variation.discount.coupon = variation.discount.coupon.trim();

        if (variation.discount.coupon.length > 0) { buy_link = `${base_uri}/Store/buy/${c_config.product_id}/${selected_users}/${selected_years}/` + `coupon.${encodeURIComponent(variation.discount.coupon)}/` + `platform.${variation.platform_id}`; } else { buy_link = `${base_uri}/Store/buy/${c_config.product_id}/${selected_users}/${selected_years}/` + `platform.${variation.platform_id}`; }
      }

      if ('ref' in variation.discount) {
        if (variation.discount.ref.length > 0) { buy_link = `${buy_link}/ref.${variation.discount.ref}`; }
      }
    } else
      if (discount in c_config) {
        if (c_config.discount != null) {
          discounted_price = window.StoreProducts.getDiscountedPrice(variation.price, discount);
          discounted_price_monthly = formatPrice((discounted_price / 12).toFixed(2), variation.currency_iso, variation.region_id);
          discounted_price = formatPrice(discounted_price, variation.currency_iso, variation.region_id);
          save_price = formatPrice(Math.ceil(variation.price - variation.discount.discounted_price), variation.currency_iso, variation.region_id);
          percent_value = `${variation.discount.discount_value}%`;
          price = `<span class="store_price_full">${price}</span><span class="store_price_cut">${discounted_price}</span>`;
        }
      }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    if ('extra_params' in c_config) {
      if (c_config.extra_params != null) {
        let params = '';
        for (let op in c_config.extra_params) {
          if (op == 'force_country') { continue; }

          c_config.extra_params[op] = c_config.extra_params[op].trim();
          if (c_config.extra_params[op].length < 1) { continue; }

          const re = new RegExp(`${op}.[^/]*/?`, 'g');

          buy_link = buy_link.replace(re, '');
          buy_link = buy_link.replace(/\/$/g, '');

          if (params.length == 0) { params = `/${op}.${encodeURIComponent(c_config.extra_params[op])}`; } else { params = `${params}/${op}.${encodeURIComponent(c_config.extra_params[op])}`; }
        }

        if (params.length > 1) buy_link += params;

        if ('force_country' in c_config.extra_params) { buy_link = `${buy_link}?force_country=${c_config.extra_params.force_country}`; }
      }
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  const elementsPrice = document.getElementsByClassName(c_config.price_class);
  Array.from(elementsPrice).forEach((element) => {
    element.innerHTML = price;
  });

  full_price = full_price;
  full_price_monthly = full_price_monthly;
  discounted_price = discounted_price;
  discounted_price_monthly = discounted_price_monthly;
  save_price = save_price;
  percent_value = percent_value;

  if (c_config.discounted_price_class != null) {
    const elements = document.getElementsByClassName(c_config.discounted_price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = discounted_price;
    });
  }

  if (c_config.discounted_price_monthly_class != null) {
    const elements = document.getElementsByClassName(c_config.discounted_price_monthly_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = discounted_price_monthly;
    });
  }

  if (c_config.full_price_class != null) {
    const elements = document.getElementsByClassName(c_config.full_price_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = full_price;
    });
  }

  if (c_config.full_price_monthly_class != null) {
    const elements = document.getElementsByClassName(c_config.full_price_monthly_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = full_price_monthly;
    });
  }

  if (c_config.save_class != null) {
    const elements = document.getElementsByClassName(c_config.save_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = save_price;
    });
  }

  if (c_config.percent_class != null) {
    const elements = document.getElementsByClassName(c_config.percent_class);
    Array.from(elements).forEach((element) => {
      element.innerHTML = percent_value;
    });
  }

  buy_link = window.StoreProducts.filterBuyLink(c_config, buy_link);
  buy_link = window.StoreProducts.appendVisitorID(buy_link);
  const elementsBuy = document.getElementsByClassName(c_config.buy_class);
  Array.from(elementsBuy).forEach((element) => {
    element.setAttribute('href', buy_link);
  });

  try {
    let ocg = c_config.onChangeYears;
    const thisObj = new Object();

    thisObj.selected_users = selected_users;
    thisObj.selected_years = selected_years;
    thisObj.selected_variation = variation;
    thisObj.buy_link = buy_link;
    thisObj.config = c_config;

    if (ocg != null) {
      ocg.call(thisObj);
    }

    const users_class = c_config.users_class;
    const years_class = c_config.years_class;

    if ('promotionsCleanUp' in window.StoreProducts.events[users_class + years_class]) {
      for (let iev in window.StoreProducts.events[users_class + years_class].promotionsCleanUp) {
        ocg = window.StoreProducts.events[users_class + years_class].promotionsCleanUp[iev];
        ocg.call(thisObj);
      }
    }

    if ('promotion_functions' in variation) {
      if (variation.promotion_functions.length > 0) {
        const jsc = Base64.decode(variation.promotion_functions);

        const PromotionFunctions = null;

        eval(jsc);

        if (!('promotionsCleanUp' in window.StoreProducts.events[users_class + years_class])) { window.StoreProducts.events[users_class + years_class].promotionsCleanUp = {}; }

        if ('cleanUp' in PromotionFunctions) {
          if (!(variation.promotion in window.StoreProducts.events[users_class + years_class].promotionsCleanUp)) { window.StoreProducts.events[users_class + years_class].promotionsCleanUp[variation.promotion] = PromotionFunctions.cleanUp; }
        }

        ocg = PromotionFunctions.onChange;
        ocg.call(thisObj);
      }
    }

    try {
      if (typeof window.StoreCBS !== 'undefined' && window.StoreCBS != null && ('go' in window.StoreCBS)) {
        window.StoreCBS.go(thisObj, ['selector', 'onchange', 'onchangeyears', window.StoreProducts.product[c_config.product_id].product_id, window.StoreProducts.product[c_config.product_id].product_alias, `initCount:${c_config.initCount}`, `productType:${window.StoreProducts.product[c_config.product_id].product_type}`]);
      }
    } catch (ex) { }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    delete window.digitalData.product;
    window.StoreProducts.setDigitalData(c_config.product_id, variation);
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  if (typeof window.__targetCallBack !== 'undefined') {
    try {
      window.__targetCallBack(c_config.buy_class, c_config.product_id, selected_users, selected_years);
    } catch (ex) { console.log(`target ex:${ex}`); }
  }
};

window.StoreProducts.loadProducts = function (config) {
  let so = new Object();
  so.ev = 2;
  let async = false;

  if ('async' in config) { async = config.async == true; }

  if (!('products' in config)) { return false; }

  if (!(config.products instanceof Array)) { return false; }

  if (config.products.length < 1) { return false; }

  let hasPID = false;
  if (typeof window.tagit_params !== 'undefined') {
    for (let i in window.tagit_params.obj) {
      if ('pid' in window.tagit_params.obj[i]) {
        hasPID = true;

        break;
      }
    }
  }

  so.config = config;
  let url = '/site/Store/ajax';

  const urlParams = {};

  try {
    (function () {
      let e;
      const a = /\+/g; // Regex for replacing addition symbol with a space
      const r = /([^&=]+)=?([^&]*)/g;
      const d = function (s) { return decodeURIComponent(s.replace(a, ' ')); };
      const q = window.location.search.substring(1);

      while (e = r.exec(q)) { urlParams[d(e[1])] = d(e[2]); }
    }());
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  // if (window.location.hostname == 'www.bitdefender.se') {
  //     BASE_URI = "https://www.bitdefender.se";
  // }

  try {
    if (typeof BASE_URI !== 'undefined') {
      if (BASE_URI != null) {
        if (BASE_URI.length > 0) { url = `${BASE_URI}/Store/ajax`; }
      }
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    if ('force_country' in urlParams) {
      url = `${url}?force_country=${urlParams.force_country}`;
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  const onload = function (data) {
    const response_code = data.code;
    const response_data = data.data;

    if (response_code != 0) {

    } else
      if ('products' in response_data) {
        for (const i in response_data.products) {
          window.StoreProducts.product[response_data.products[i].product_id] = response_data.products[i];
          window.StoreProducts.product[response_data.products[i].product_alias] = response_data.products[i];
        }
      }

    try {
      if ('onLoad' in config) { config.onLoad(); }
    } catch (ex) {
      DEBUG && console.log(ex);
    }
  };

  so = JSON.stringify(so);

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: so }),
    async,
  })
    .then((response) => response.json())
    .then(onload)
    .catch((error) => {
      DEBUG && console.log(error);
    });
};

window.StoreProducts.getBundleProductsInfo = function (va, vb, config) {
  let base_uri = window.StoreProducts.product[va.product_id].base_uri;

  // if (window.location.hostname == 'www.bitdefender.se') {
  //     base_uri = "https://www.bitdefender.se/site";
  // }

  if (typeof window.geoip_code !== 'undefined' && window.geoip_code == 'gb') {
    base_uri = 'https://www.bitdefender.co.uk/site';
  }

  let buy_link = `${base_uri}/Store/buybundle`;

  const pa = window.StoreProducts.product[va.product_id];
  const pb = window.StoreProducts.product[vb.product_id];

  const extra_params = {};

  try {
    va.selected_users = va.variation.dimension_value;
    va.selected_years = va.variation.years;

    buy_link += `/${pa.product_alias}/${va.selected_users}/${va.selected_years}`;
    /*
            if('discount' in va)
            {
                if('coupon' in va['discount'])
                {
                    va['discount']['coupon'] = $.trim(va['discount']['coupon']);

                    if(va['discount']['coupon'].length > 0)
                    buy_link += '/' + 'coupon.'+encodeURIComponent(va['discount']['coupon']) + '/' + 'platform.' + va['platform_id'];
                else
                    buy_link += '/' + 'platform.' + va['platform_id'];
                    }

                    if('ref' in va['discount'])
                    {
                    if(va['discount']['ref'].length > 0)
                        buy_link = buy_link + '/ref.' + va['discount']['ref'];
                    }
            }
            */
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    /*
            if(extra_params['va'] != null)
            {
                var params = '';

                for(op in extra_params['va'])
                {
                if(op == 'force_country')
                    continue;

                extra_params['va'][op] = $.trim(extra_params['va'][op]);

                if(extra_params['va'][op].length < 1)
                    continue;
            */
    //	var re = new RegExp(op+'.[^/]*/?','g');
    /*
                buy_link = buy_link.replace(re,'');
                buy_link = buy_link.replace(/\/$/g,'');

                    if(params.length == 0)
                        params = '/'+op+'.'+encodeURIComponent(extra_params['va'][op]);
                else
                    params = params+'/'+op+'.'+encodeURIComponent(extra_params['va'][op]);
                }

                if(params.length > 1)
                    buy_link = buy_link + params;
            }
            */
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    vb.selected_users = vb.variation.dimension_value;
    vb.selected_years = vb.variation.years;

    buy_link += `/${pb.product_alias}/${vb.selected_users}/${vb.selected_years}`;
    /*
            if('discount' in vb)
            {
                if('coupon' in vb['discount'])
                {
                    vb['discount']['coupon'] = $.trim(vb['discount']['coupon']);

                    if(vb['discount']['coupon'].length > 0)
                    buy_link +=  '/' + 'coupon.'+encodeURIComponent(vb['discount']['coupon']) + '/' + 'platform.' + vb['platform_id'];
                else
                    buy_link +=  '/' + 'platform.' + vb['platform_id'];
                    }

                    if('ref' in vb['discount'])
                    {
                    if(vb['discount']['ref'].length > 0)
                        buy_link = buy_link + '/ref.' + vb['discount']['ref'];
                    }
            }
            */
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  try {
    /*
            if(extra_params['vb'] != null)
            {
                var params = '';

                for(op in extra_params['vb'])
                {
                if(op == 'force_country')
                    continue;

                extra_params['vb'][op] = $.trim(extra_params['vb'][op]);

                if(extra_params['vb'][op].length < 1)
                    continue;
            */
    //	var re = new RegExp(op+'.[^/]*/?','g');
    /*
                buy_link = buy_link.replace(re,'');
                buy_link = buy_link.replace(/\/$/g,'');

                    if(params.length == 0)
                        params = '/'+op+'.'+encodeURIComponent(extra_params['vb'][op]);
                else
                    params = params+'/'+op+'.'+encodeURIComponent(extra_params['vb'][op]);
                }

                if(params.length > 1)
                    buy_link = buy_link + params;
            }
            */

    if ('force_country' in extra_params) { buy_link = `${buy_link}?force_country=${extra_params.force_country}`; }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  let ret_price = 0;

  ret_price = (va.price * 100) / 100 + (vb.price * 100) / 100;
  ret_price = ret_price.toFixed(2);
  ret_price = formatPrice(ret_price, va.currency_iso, va.region_id);

  buy_link = window.StoreProducts.filterBuyLink(config, buy_link);
  buy_link = window.StoreProducts.appendVisitorID(buy_link);
  return { buy_link, price: ret_price };
};

window.StoreProducts.requestPricingInfo = function (so) {
  const url = so.url;
  const config = so.config;
  so = JSON.stringify(so);

  if (config.method && config.method.toLowerCase() == 'get') {
    let urlGet = new URL(url);
    const soBase64 = Base64.encode(so);

    if (!urlGet.pathname.endsWith('/')) {
      urlGet.pathname += '/';
    }
    urlGet.pathname += `${encodeURI(soBase64)}/`;

    fetch(urlGet.toString())
      .then((response) => response.json())
      .then(handleResponse)
      .catch((error) => {
        // Handle any error that occurred during the request
      });
  } else {
    // let params = new URLSearchParams();
    // params.append('data', so);

    const formData = new FormData();
    formData.append('data', so);
    fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then(handleResponse)
      .catch((error) => {
        DEBUG && console.log(error);
      });
  }
};

const handleResponse = function (data) {
  const response_code = data.code;
  const response_data = data.data;

  if (response_code != 0) {

  } else {
    try {
      let product_info = response_data.product.product_id;
      const product_id = response_data.product.product_id;
      const product_alias = response_data.product.product_alias;

      if (!(product_info in window.StoreProducts.product)) { product_info = product_alias; }

      window.StoreProducts.product[response_data.product.product_id] = response_data.product;
      window.StoreProducts.product[response_data.product.product_alias] = response_data.product;

      window.StoreProducts.initSelector(response_data.config);
    } catch (ex) {
      DEBUG && console.log(ex);
    }
  }
};

/**
 * Dynamic Pricing coupon configuration
 * @param productAlias
 * @param discount
 * @returns {*}
 */
window.StoreProducts.getPromoCode = function (productAlias, discount) {
  const promoSteps = {
    av: [
      { min: 0, max: 20, pid: 'DPAV01OFF' },
      { min: 21, max: 29, pid: 'DPAV02OFF' },
      { min: 30, max: 38, pid: 'DPAV03OFF' },
      { min: 39, max: 46, pid: 'DPAV04OFF' },
      { min: 47, max: 54, pid: 'DPAV05OFF' },
      { min: 55, max: 100, pid: 'DPAV06OFF' },
    ],
    is: [
      { min: 0, max: 28, pid: 'DPAV01OFF' },
      { min: 29, max: 34, pid: 'DPAV02OFF' },
      { min: 35, max: 41, pid: 'DPAV03OFF' },
      { min: 42, max: 47, pid: 'DPAV04OFF' },
      { min: 48, max: 56, pid: 'DPAV05OFF' },
      { min: 57, max: 100, pid: 'DPAV06OFF' },
    ],
    tsmd: [
      { min: 0, max: 28, pid: 'DPAV01OFF' },
      { min: 29, max: 39, pid: 'DPAV02OFF' },
      { min: 40, max: 47, pid: 'DPAV03OFF' },
      { min: 48, max: 53, pid: 'DPAV04OFF' },
      { min: 54, max: 58, pid: 'DPAV05OFF' },
      { min: 59, max: 100, pid: 'DPAV06OFF' },
    ],
  };
  for (let i in promoSteps[productAlias]) {
    if (discount >= promoSteps[productAlias][i].min && discount <= promoSteps[productAlias][i].max) {
      return promoSteps[productAlias][i].pid;
    }
  }
  return false;
};

/**
 * Fix inainte de a aduce informatiile din baza de date, interogam pentru promitii
 * @param so
 * @returns {*}
 */
window.StoreProducts.filterRequestObject = function (so) {
  if (typeof DEFAULT_LANGUAGE === 'undefined' || DEFAULT_LANGUAGE !== 'en') {
    window.StoreProducts.requestPricingInfo(so);
    return false;
  }

  if (typeof window._satellite === 'undefined') {
    window.StoreProducts.requestPricingInfo(so);
    return false;
  }

  if (typeof window._satellite.buildInfo !== 'undefined') {
    if (window._satellite.buildInfo.environment == 'development') {
      window.StoreProducts.requestPricingInfo(so);
      return false;
    }
  } else {
    window.StoreProducts.requestPricingInfo(so);
    return false;
  }

  if (typeof digitalData !== 'undefined'
    && window.digitalData.page.info.subSubSubSection != '5001'
    && window.digitalData.page.info.subSubSubSection != '5002'
    && window.digitalData.page.info.subSubSubSection != '5004'
    && window.digitalData.page.info.subSubSubSection != '7001'
    && window.digitalData.page.info.subSubSubSection != '8001'
  ) {
    window.StoreProducts.requestPricingInfo(so);
    return false;
  }

  let experience = false;
  if (typeof window.ttMETA !== 'undefined') {
    for (const i in window.ttMETA) {
      if (window.ttMETA[i].campaign === 'COM - Dynamic Pricing Split') {
        if (window.ttMETA[i].experience.indexOf('Experience B') !== -1) {
          experience = 'B';
        }
        if (window.ttMETA[i].experience.indexOf('Experience C') !== -1) {
          experience = 'C';
        }
      }
    }
  }

  if (!experience) {
    window.StoreProducts.requestPricingInfo(so);
    return false;
  }

  let product = '';
  switch (so.product_id) {
    case 'av':
      product = 'Antivirus';
      break;
    case 'is':
      product = 'Internet Security';
      break;
    case 'tsmd':
      product = 'Total Security';
      break;
    default:
      window.StoreProducts.requestPricingInfo(so);
      return false;
  }

  /* more filtering - by pid this time */
  if (typeof window.tagit_params !== 'undefined') {
    for (let i in window.tagit_params.obj) {
      if ('pid' in window.tagit_params.obj[i]) {
        // google_organic
        if (window.tagit_params.obj[i].pid.param_value.includes('google_organic')) {
          window.StoreProducts.requestPricingInfo(so);
          break;
        }
      }
    }
  }

  if (typeof window.digitalData.user.profileConsumer === 'undefined') {
    window.digitalData.user.profileConsumer = new Object();
  }

  const cloud_id = _satellite.getVisitorId().getMarketingCloudVisitorID();
  let requestObj = { family: product, marketing_cloud_id: cloud_id };
  requestObj = JSON.stringify(requestObj);
  fetch('https://onza5mmwed.execute-api.us-east-1.amazonaws.com/dev/dyn-price', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestObj),
    timeout: 1000, // in milliseconds
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (data.discount) {
        const discount = parseFloat(data.discount);
        if (!isNaN(discount)) {
          const promoCode = window.StoreProducts.getPromoCode(so.product_id, discount);
          if (experience === 'B') {
            if (typeof window.digitalData.user.profileConsumer.dynamic === 'undefined') {
              window.digitalData.user.profileConsumer.dynamic = 'applied|';
            }
            window.digitalData.user.profileConsumer.dynamic = `${so.product_id + discount}|`;
            so.config.extra_params = { pid: promoCode };
          }
          if (experience === 'C') {
            window.digitalData.user.profileConsumer.dynamic = `notapplied|${discount}`;
          }
        } else {
          window.digitalData.user.profileConsumer.dynamic = 'error';
        }
      }
      window.StoreProducts.requestPricingInfo(so);
    })
    .catch((error) => {
      if (error.message === '403') {
        window.digitalData.user.profileConsumer.dynamic = 'none';
      } else {
        window.digitalData.user.profileConsumer.dynamic = `error|${error.message}`;
      }
      window.StoreProducts.requestPricingInfo(so);
    });
};

const all_page_products = [];
const oneTimeSendData = false;
let satellite_track_once = 1;
window.StoreProducts.setDigitalData = function (product_id, variation) {
  try {
    if (typeof window.digitalData !== 'undefined') {
      /**
             if (digitalData.page.category.primary == "landing page") {
                if (window.StoreProducts.product[product_id].product_type == 1) {
                    digitalData.page.category.secondary = "consumer";
                }
                if (window.StoreProducts.product[product_id].product_type == 2) {
                    digitalData.page.category.secondary = "business";
                }

                if (typeof digitalData.user === "undefined") {
                    digitalData.user = {
                        potentialCustomer : digitalData.page.category.secondary,
                    };
                } else {
                    digitalData.user.potentialCustomer = digitalData.page.category.secondary;
                }

                if (!oneTimeSendData && digitalData.page.category.secondary !== "") {
          if (digitalData.page.category.secondary == "consumer") {
                        _satellite.track("DLConsumerCampaign");
                        oneTimeSendData = true;
          } else if (digitalData.page.category.secondary == "business") {
                        _satellite.track("DLBusinessCampaign");
                        oneTimeSendData = true;
          }
        }
            }
             * */

      if (window.digitalData.page.info.subSubSection == 'viewproduct' && digitalData.page.info.name.indexOf(window.StoreProducts.product[product_id].product_id) !== -1) {
        let found = false;
        if (window.digitalData.product !== 'undefined') {
          for (let i in digitalData.product) {
            if (window.digitalData.product[i].info.ID == window.StoreProducts.product[product_id].product_id) {
              found = true;

              if (window.digitalData.product[i].info.devices != parseInt(variation.variation.dimension_value)) {
                digitalData.product[i].info.devices = parseInt(variation.variation.dimension_value).toString();
              }

              if (window.digitalData.product[i].info.subscription != parseInt(variation.variation.years * 12)) {
                window.digitalData.product[i].info.subscription = parseInt(variation.variation.years * 12).toString();
              }

              break;
            }
          }
        }

        if (!found) {
          const productName = window.StoreProducts.product[product_id].product_name.replace(/\d/g, '').trim();
          let productVersion = parseInt(window.StoreProducts.product[product_id].product_name.replace(/\D/g, ''));

          if (isNaN(productVersion)) {
            productVersion = 0;
          }

          const productInfo = {
            ID: parseInt(window.StoreProducts.product[product_id].product_id).toString(),
            name: productName,
            version: productVersion.toString(),
            devices: parseInt(variation.variation.dimension_value).toString(),
            subscription: parseInt(variation.variation.years * 12).toString(),
            basePrice: window.StoreProducts.product[product_id].variations[parseInt(variation.variation.dimension_value)][parseInt(variation.variation.years)].price,
            currency: window.StoreProducts.product[product_id].variations[parseInt(variation.variation.dimension_value)][parseInt(variation.variation.years)].currency_iso,
          };

          if (typeof window.digitalData.product === 'undefined') {
            window.digitalData.product = [];
          }

          let primaryCategory = '';
          let subCategory = '';
          switch (window.StoreProducts.product[product_id].product_type) {
            case '1':
              primaryCategory = 'consumer';
              subCategory = 'subscriptions';
              break;

            case '2':
              primaryCategory = 'business';
              subCategory = 'subscriptions';
              break;

            case '3':
              primaryCategory = 'consumer';
              subCategory = 'services';
              break;
          }

          const productCategory = {
            primary: primaryCategory,
            secondary: subCategory,
          };

          const product = {
            info: productInfo,
            productCategory,
          };

          const dvcs = productInfo.devices;
          const yrs = parseInt(variation.variation.years);

          if (typeof window.StoreProducts.product[product_id] !== 'undefined') {
            const StorePrd = window.StoreProducts.product[product_id];

            if (typeof StorePrd.variations[dvcs][yrs].discount === 'undefined') {
              product.info.discountValue = 0;
              product.info.priceWithTax = StorePrd.variations[dvcs][yrs].price;
              product.info.discountRate = 0;
            } else {
              product.info.discountValue = StorePrd.variations[dvcs][yrs].price - StorePrd.variations[dvcs][yrs].discount.discounted_price;
              product.info.priceWithTax = window.StoreProducts.price_format(StorePrd.variations[dvcs][yrs].discount.discounted_price, 2);
              const discount_var = ((StorePrd.variations[dvcs][yrs].price - StorePrd.variations[dvcs][yrs].discount.discounted_price) / productInfo.basePrice) * 100;
              product.info.discountValue = window.StoreProducts.price_format(product.info.discountValue.toString(), 2);
              product.info.discountRate = parseInt(discount_var, 10).toString();
            }
          }

          window.digitalData.page.category.secondary = 'product';

          window.digitalData.product.push(product);

          if (window.adobeDataLayer && typeof window.addDigitalDataProduct !== 'undefined') {
            window.addDigitalDataProduct(digitalData.product);
          }

          if (typeof window._satellite !== 'undefined' && typeof window._satellite.pageBottomFired !== 'undefined' && window._satellite.pageBottomFired) {
            window.digitalData.page.attributes.delayed = 'true';

            // _satellite.notify("DLPPReady", 1); //WWW-7220
            if (satellite_track_once) { // WWW-7220
              window._satellite.track('DLPPReady');
              satellite_track_once = 0;
            }
          } else {
            window.digitalData.page.attributes.delayed = 'false';
          }
        }
      }
    } else {
      const productTemp = {
        product_id,
        variation,
      };

      all_page_products.push(productTemp);
    }
  } catch (err) {
    console.log(err);
  }
};

window.StoreProducts.price_format = function (num, dec) {
  const decimals = dec || 0;
  const number = parseFloat(num);
  const decPoint = '.';
  const thousandsSep = '';

  const roundedNumber = `${Math.round(Math.abs(number) * (`1e${decimals}`))}`;
  let numbersString = decimals ? roundedNumber.slice(0, decimals * -1) : roundedNumber;
  const decimalsString = decimals ? roundedNumber.slice(decimals * -1) : '';
  let formattedNumber = '';

  while (numbersString.length > 3) {
    formattedNumber += thousandsSep + numbersString.slice(-3);
    numbersString = numbersString.slice(0, -3);
  }

  return (number < 0 ? '-' : '') + numbersString + formattedNumber + (decimalsString ? (decPoint + decimalsString) : '');
};

window.StoreProducts.filterBuyLink = function (config, buyLink) {
  try {
    if (
      typeof config !== 'undefined'
      && typeof config.ignore_promotions !== 'undefined'
      && config.ignore_promotions == true
    ) {
      if (buyLink.slice(-1) !== '/') buyLink += '/';

      buyLink = `${buyLink}spid.1/`;
    }
  } catch (ex) {
    DEBUG && console.log(ex);
  }

  /* aici este setat A/B testul cu shopping cartul */
  if (typeof window.ttMETA !== 'undefined') {
    for (const i in window.ttMETA) {
      if (window.ttMETA[i].campaign === 'COM - Classic Line (New Cart BUY Links v6)') {
        if (window.ttMETA[i].experience.indexOf('v6 New Cart (Variation 1)') !== -1) {
          buyLink = `${buyLink + (buyLink.split('?')[1] ? '&' : '?')}ORDERSTYLE=nLWs5JSpkHE=&SHORT_FORM=1`;
        }
      }
    }
  }

  return buyLink;
};

window.StoreProducts.appendVisitorID = function (buyLink) {
  if (typeof window.Visitor !== 'undefined') {
    var visitor = window.Visitor.getInstance('0E920C0F53DA9E9B0A490D45@AdobeOrg', {
      trackingServer: 'stats.bitdefender.com', // Same as s.trackingServer
      trackingServerSecure: 'sstats.bitdefender.com', // Same as s.trackingServerSecure
    });
  }

  if (typeof visitor === 'object') {
    buyLink = visitor.appendVisitorIDsTo(buyLink);
  }

  return buyLink;
};

const Base64 = {

  // private property
  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

  // public method for encoding
  encode(input) {
    let output = '';
    let chr1; let chr2; let chr3; let enc1; let enc2; let enc3; let
      enc4;
    let i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output
        + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2)
        + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }

    return output;
  },

  // public method for decoding
  decode(input) {
    let output = '';
    let chr1; let chr2; let chr3; let enc1; let enc2; let enc3; let
      enc4;
    let i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output += String.fromCharCode(chr1);

      if (enc3 != 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output += String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);

    return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode(string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';

    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode(utftext) {
    let string = '';
    let i = 0;
    let c = 0;
    const c1 = 0;
    let c2 = 0;
    let c3;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }

    return string;
  },
};

window.StoreProducts.filterProductIDExceptions = function (product_id) {
  // var langExceptions = ['de', 'nl'];
  // if (typeof DEFAULT_LANGUAGE !== "undefined" && -1 !== langExceptions.indexOf(DEFAULT_LANGUAGE) &&
  //     ("5002" === product_id || "is" === product_id)) {
  //     product_id = "5003";
  // }
  /*
          if (typeof DEFAULT_LANGUAGE !== "undefined" && -1 !== langExceptions.indexOf(DEFAULT_LANGUAGE) &&
              ("5004" === product_id || "tsmd" === product_id)) {
              product_id = "5009";
          }
      */
  // console.log('filterProductIDExceptions: ' + product_id);
  return product_id;
};

let JSON; if (!JSON) { JSON = {}; } (function () {
  function str(a, b) { let c; let d; let e; let f; const g = gap; let h; let i = b[a]; if (i && typeof i === 'object' && typeof i.toJSON === 'function') { i = i.toJSON(a); } if (typeof rep === 'function') { i = rep.call(b, a, i); } switch (typeof i) { case 'string': return quote(i); case 'number': return isFinite(i) ? String(i) : 'null'; case 'boolean': case 'null': return String(i); case 'object': if (!i) { return 'null'; } gap += indent; h = []; if (Object.prototype.toString.apply(i) === '[object Array]') { f = i.length; for (c = 0; c < f; c += 1) { h[c] = str(c, i) || 'null'; } e = h.length === 0 ? '[]' : gap ? `[\n${gap}${h.join(`,\n${gap}`)}\n${g}]` : `[${h.join(',')}]`; gap = g; return e; } if (rep && typeof rep === 'object') { f = rep.length; for (c = 0; c < f; c += 1) { if (typeof rep[c] === 'string') { d = rep[c]; e = str(d, i); if (e) { h.push(quote(d) + (gap ? ': ' : ':') + e); } } } } else { for (d in i) { if (Object.prototype.hasOwnProperty.call(i, d)) { e = str(d, i); if (e) { h.push(quote(d) + (gap ? ': ' : ':') + e); } } } } e = h.length === 0 ? '{}' : gap ? `{\n${gap}${h.join(`,\n${gap}`)}\n${g}}` : `{${h.join(',')}}`; gap = g; return e; } } function quote(a) { escapable.lastIndex = 0; return escapable.test(a) ? `"${a.replace(escapable, (a) => { const b = meta[a]; return typeof b === 'string' ? b : `\\u${(`0000${a.charCodeAt(0).toString(16)}`).slice(-4)}`; })}"` : `"${a}"`; } function f(a) { return a < 10 ? `0${a}` : a; } 'use strict'; if (typeof Date.prototype.toJSON !== 'function') { Date.prototype.toJSON = function (a) { return isFinite(this.valueOf()) ? `${this.getUTCFullYear()}-${f(this.getUTCMonth() + 1)}-${f(this.getUTCDate())}T${f(this.getUTCHours())}:${f(this.getUTCMinutes())}:${f(this.getUTCSeconds())}Z` : null; }; String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (a) { return this.valueOf(); }; } const cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; let gap; let indent; var meta = {
    '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\',
  }; let rep; if (typeof JSON.stringify !== 'function') { JSON.stringify = function (a, b, c) { let d; gap = ''; indent = ''; if (typeof c === 'number') { for (d = 0; d < c; d += 1) { indent += ' '; } } else if (typeof c === 'string') { indent = c; } rep = b; if (b && typeof b !== 'function' && (typeof b !== 'object' || typeof b.length !== 'number')) { throw new Error('JSON.stringify'); } return str('', { '': a }); }; } if (typeof JSON.parse !== 'function') { JSON.parse = function (text, reviver) { function walk(a, b) { let c; let d; const e = a[b]; if (e && typeof e === 'object') { for (c in e) { if (Object.prototype.hasOwnProperty.call(e, c)) { d = walk(e, c); if (d !== undefined) { e[c] = d; } else { delete e[c]; } } } } return reviver.call(a, b, e); } let j; text = String(text); cx.lastIndex = 0; if (cx.test(text)) { text = text.replace(cx, (a) => `\\u${(`0000${a.charCodeAt(0).toString(16)}`).slice(-4)}`); } if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { j = eval(`(${text})`); return typeof reviver === 'function' ? walk({ '': j }, '') : j; } throw new SyntaxError('JSON.parse'); }; }
}());
