if (typeof StoreProducts == 'undefined' || StoreProducts === null)
{
    StoreProducts = new Object();
}

if (typeof StoreProducts.product == 'undefined' || StoreProducts.product === null)
{
    StoreProducts.product = new Object();
}

if (typeof StoreProducts.events == 'undefined' || StoreProducts.events === null)
{
    StoreProducts.events = new Object();
}

if (typeof StoreProducts.initCount == 'undefined' || StoreProducts.initCount === null)
{
    StoreProducts.initCount = 0;
}


StoreProducts.initSelector = function(config)
{
    is_product = true;
    if(typeof forcePL != 'undefined' && forcePL == true){
        config['force_region'] = 16;
        var now = new Date();
        var time = now.getTime();
        var expTime = time + 1000*3888000;
        now.setTime(expTime);
        document.cookie = "forceBuyCurrency=EUR; expires=" +now.toGMTString() + "; path=/";
    }
    var product_id = null;
    var users_class = null;
    var selected_users = 3;
    var selected_years = 1;
    var years_class = null;
    var price_class = null;

    var full_price_class = null;
    var discounted_price_class = null;

    var buy_class = null;
    var onChangeUsers = null;
    var onChangeYears = null;
    var onSelectorLoad = null;

    var discount = null;

    var extra_params = null;

    var doAjax = true;
    var force_platform = null;
    var force_region = null;

    var user_label = '';
    var year_label = '';
    var users_label = '';
    var years_label = '';

    var user_label_prefix = '';
    var users_label_prefix = '';
    var year_label_prefix = '';
    var years_label_prefix = '';

    var ignore_promotions = false;
    var initCount = 0;

    var method = 'POST';

    if('initCount' in config)
        initCount = config['initCount'];
    else
    {
        initCount = ++StoreProducts.initCount;
        config['initCount'] = initCount;
    }

    if('product_id' in config)
        product_id = config['product_id'];

    product_id = StoreProducts.filterProductIDExceptions(product_id);

    if('users_class' in config)
        users_class = config['users_class'];

    if('years_class' in config)
        years_class = config['years_class'];

    if('selected_users' in config)
        selected_users = config['selected_users'];

    if('selected_years' in config)
        selected_years = config['selected_years'];

    if('price_class' in config)
        price_class = config['price_class'];

    if('full_price_class' in config)
        full_price_class = config['full_price_class'];

    if('discounted_price_class' in config)
        discounted_price_class = config['discounted_price_class'];

    if('buy_class' in config)
        buy_class = config['buy_class'];

    if('user_label' in config)
        user_label = config['user_label'];

    if('users_label' in config)
        users_label = config['users_label'];

    if('year_label' in config)
        year_label = config['year_label'];

    if('years_label' in config)
        years_label = config['years_label'];

    if('user_label_prefix' in config)
        user_label_prefix = config['user_label_prefix'];

    if('users_label_prefix' in config)
        users_label_prefix = config['users_label_prefix'];

    if('year_label_prefix' in config)
        year_label_prefix = config['year_label_prefix'];

    if('years_label_prefix' in config)
        years_label_prefix = config['years_label_prefix'];

    if('extra_params' in config)
        extra_params = config['extra_params'];

    if (typeof __global_extra_params !== 'undefined') {
        extra_params = config['extra_params'] = __global_extra_params;
    }

    if('discount' in config)
        discount = config['discount'];

    if('doAjax' in config)
        doAjax = config['doAjax'];

    if('force_platform' in config)
        force_platform = config['force_platform'];

    if('force_region' in config)
        force_region = config['force_region'];

    if('onChangeUsers' in config)
        onChangeUsers = config['onChangeUsers'];

    if('onChangeYears' in config)
        onChangeYears = config['onChangeYears'];

    if('onSelectorLoad' in config)
        onSelectorLoad = config['onSelectorLoad'];

    if ('ignore_promotions' in config)
        ignore_promotions = config['ignore_promotions'];

    if('method' in config)
        method = config['method'];

    if (typeof __global_ignore_promotions !== 'undefined') {
        ignore_promotions = config['ignore_promotions'] = __global_ignore_promotions;
    }

    var hasPID = false;
    if(typeof tagit_params !== 'undefined') {
        for (i in tagit_params.obj) {
            if ('pid' in tagit_params.obj[i]) {
                hasPID = true;

                break;
            }
        }
    }

    if (product_id == null)
        return false;

//    if(users_class == null)
//	return false;

//    if(years_class == null)
//	return false;

    var urlParams = {};

    try
    {
        (function () {
            var e,
              a = /\+/g,  // Regex for replacing addition symbol with a space
              r = /([^&=]+)=?([^&]*)/g,
              d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
              q = window.location.search.substring(1);

            while (e = r.exec(q))
                urlParams[d(e[1])] = d(e[2]);
        })();

        if('force_country' in urlParams)
        {
            if(extra_params == null)
            {
                extra_params = { 'force_country' : urlParams['force_country'] };
            }
            else
            {
                extra_params['force_country'] = urlParams['force_country'];
            }
        }

        if('cid' in urlParams)
        {
            config['cid'] = urlParams['cid'];
        }

        if('icid' in urlParams)
        {
            config['icid'] = urlParams['icid'];
        }

    }
    catch(ex)
    {

    }

    if(typeof StoreProducts.product[product_id] == 'undefined' || StoreProducts.product[product_id] === null)
    {
        if(doAjax == true)
        {
            //configure events
            var c_config = new Object();
            c_config['users_class'] = users_class;
            c_config['years_class'] = years_class;
            c_config['price_class'] = price_class;

            c_config['full_price_class'] = full_price_class;
            c_config['discounted_price_class'] = discounted_price_class;

            c_config['buy_class'] = buy_class;
            c_config['product_id'] = product_id;

            c_config['product_id'] = StoreProducts.filterProductIDExceptions(c_config['product_id']);

            c_config['extra_params'] = extra_params;
            c_config['discount'] = discount;

            c_config['user_label'] = user_label;
            c_config['users_label'] = users_label;
            c_config['year_label'] = year_label;
            c_config['years_label'] = years_label;

            c_config['user_label_prefix'] = user_label_prefix;
            c_config['users_label_prefix'] = users_label_prefix;
            c_config['year_label_prefix'] = year_label_prefix;
            c_config['years_label_prefix'] = years_label_prefix;

            c_config['ignore_promotions'] = ignore_promotions;
            c_config['initCount'] = initCount;

            c_config['onChangeUsers'] = onChangeUsers;
            c_config['onChangeYears'] = onChangeYears;

            c_config['method'] = method;

            var on_users_change = null;
            var on_years_change = null;

            if(users_class != null)
                on_users_change = StoreProducts.__onChangeUsers;

            if(years_class != null)
                on_years_change = StoreProducts.__onChangeYears;

            if(users_class != null)
            {
                StoreProducts['events'][users_class] = new Object();
                StoreProducts['events'][users_class].onUsersChangeF = on_users_change;
                StoreProducts['events'][users_class].onUsersChangeD = c_config;
            }

            if(years_class != null)
            {
                StoreProducts['events'][years_class] = new Object();
                StoreProducts['events'][years_class].onYearsChangeF = on_years_change;
                StoreProducts['events'][years_class].onYearsChangeD = c_config;
            }

            if(years_class != null && users_class != null)
            {
                StoreProducts['events'][users_class+years_class] = new Object();
                StoreProducts['events'][users_class+years_class].onSelectorLoad = onSelectorLoad;
            }

            var so = new Object();
            so.ev = 1;
            so.product_id = product_id;
            config['doAjax'] = false;
            config['onSelectorLoad'] = null;
            config['onChangeUsers'] = null;
            config['onChangeYears'] = null;
            so.config = config;

            var BASE_URL = ["author", "localhost", "local", "stage", "dev", "dev1", "dev2", "dev3", "new"].includes(window.location.hostname.split(/\.|-/)[0]) ? "https://www.bitdefender.com" : ""

            var url = BASE_URL + '/site/Store/ajax';

            // if (window.location.hostname == 'www.bitdefender.se') {
            //     BASE_URI = "https://www.bitdefender.se/site";
            // }

            var forceBussiness = false;
            if (typeof geoip_code != 'undefined' && ["bus-security", "adv_security", "elite_1000", "abs_1000", "bs_1000", "p_management", "fde"].indexOf(so.product_id) > -1 && ['us','uk','gb','ro','fr','ca','de','es','it','pt','nl','se','au','br','no'].indexOf(geoip_code) == -1) {
                forceBussiness = true;

                BASE_URI = "https://www.bitdefender.com/site";
            }

            let BASE_URI = "https://www.bitdefender.com/site";
            if (typeof DEFAULT_LANGUAGE !== 'undefined') {
                let DOMAIN = DEFAULT_LANGUAGE;
                if (DEFAULT_LANGUAGE === 'en') {
                    DOMAIN = 'com';
                } else if (DEFAULT_LANGUAGE === 'uk') {
                    DOMAIN = 'co.uk';
                } else if (DEFAULT_LANGUAGE === 'au') {
                    DOMAIN = 'com.au';
                }

                BASE_URI = `https://www.bitdefender.${DOMAIN}/site`;
            }

            try
            {
                if (typeof multilang_js != 'undefined' && multilang_js != null && window.location.href.match(/www2.bitdefender.com/gi))
                    if ('DEFAULT_LANGUAGE' in multilang_js)
                        url = '/' + multilang_js['DEFAULT_LANGUAGE'] + '/Store/ajax';

                if (typeof BASE_URI != 'undefined') {
                    if (BASE_URI != null) {
                        if (BASE_URI.length > 0) {
                            url = BASE_URI + '/Store/ajax';
                        }
                    }
                }
            }
            catch(ex)
            {

            }

            try
            {
                if(forceBussiness == true){
                    urlParams['force_country'] = "us";

                }
                if('force_country' in urlParams)
                {
                    url = url + '?force_country='+urlParams['force_country'];
                }
            }
            catch(ex)
            {
                console.log(ex);
            }
            so.url = url;
            StoreProducts.filterRequestObject(so);

            return false;
        }
        else
            return false;
    }
    else
    {

        if(!(users_class+years_class in StoreProducts['events']))
            StoreProducts['events'][users_class+years_class] = new Object();

        if(!(users_class in StoreProducts['events']))
            StoreProducts['events'][users_class] = new Object();

        if(!(years_class in StoreProducts['events']))
            StoreProducts['events'][years_class] = new Object();

        //configure events
        if(typeof StoreProducts['events'][users_class+years_class].onSelectorLoad == 'undefined' || StoreProducts['events'][users_class+years_class].onSelectorLoad === null)
            StoreProducts['events'][users_class+years_class].onSelectorLoad = onSelectorLoad;

        if(typeof StoreProducts['events'][users_class].onUsersChangeF == 'undefined' || StoreProducts['events'][users_class].onUsersChangeF === null)
        {
            c_config = new Object();
            c_config['users_class'] = users_class;
            c_config['years_class'] = years_class;
            c_config['price_class'] = price_class;

            c_config['full_price_class'] = full_price_class;
            c_config['discounted_price_class'] = discounted_price_class;

            c_config['buy_class'] = buy_class;
            c_config['product_id'] = product_id;

            c_config['product_id'] = StoreProducts.filterProductIDExceptions(c_config['product_id']);

            c_config['user_label'] = user_label;
            c_config['users_label'] = users_label;
            c_config['year_label'] = year_label;
            c_config['years_label'] = years_label;

            c_config['user_label_prefix'] = user_label_prefix;
            c_config['users_label_prefix'] = users_label_prefix;
            c_config['year_label_prefix'] = year_label_prefix;
            c_config['years_label_prefix'] = years_label_prefix;

            c_config['extra_params'] = extra_params;
            c_config['discount'] = discount;

            c_config['ignore_promotions'] = ignore_promotions;

            c_config['onChangeUsers'] = onChangeUsers;
            c_config['onChangeYears'] = onChangeYears;

            var on_users_change = null;
            if(users_class != null)
                on_users_change = StoreProducts.__onChangeUsers;

            if(users_class != null)
            {
                StoreProducts['events'][users_class].onUsersChangeF = on_users_change;
                StoreProducts['events'][users_class].onUsersChangeD = c_config;
            }
        }

        if(typeof StoreProducts['events'][years_class].onYearsChangeF == 'undefined' || StoreProducts['events'][years_class].onYearsChangeF === null)
        {
            c_config = new Object();
            c_config['users_class'] = users_class;
            c_config['years_class'] = years_class;
            c_config['price_class'] = price_class;

            c_config['full_price_class'] = full_price_class;
            c_config['discounted_price_class'] = discounted_price_class;

            c_config['buy_class'] = buy_class;
            c_config['product_id'] = product_id;

            c_config['product_id'] = StoreProducts.filterProductIDExceptions(c_config['product_id']);

            c_config['user_label'] = user_label;
            c_config['users_label'] = users_label;
            c_config['year_label'] = year_label;
            c_config['years_label'] = years_label;

            c_config['extra_params'] = extra_params;
            c_config['discount'] = discount;

            c_config['user_label_prefix'] = user_label_prefix;
            c_config['users_label_prefix'] = users_label_prefix;
            c_config['year_label_prefix'] = year_label_prefix;
            c_config['years_label_prefix'] = years_label_prefix;

            c_config['ignore_promotions'] = ignore_promotions;

            c_config['onChangeUsers'] = onChangeUsers;
            c_config['onChangeYears'] = onChangeYears;

            var on_years_change = null;
            if(years_class != null)
                on_years_change = StoreProducts.__onChangeYears;

            if(years_class != null)
            {
                StoreProducts['events'][years_class].onYearsChangeF = on_years_change;
                StoreProducts['events'][years_class].onYearsChangeD = c_config;
            }
        }

        if(users_class != null) {
            var elements = document.getElementsByClassName(users_class);
            Array.from(elements).forEach(function(element) {
                element.addEventListener('change', (e) => {
                    e.data = StoreProducts['events'][users_class].onUsersChangeD;
                    return StoreProducts['events'][users_class].onUsersChangeF(e);
                });
            });
        }

        if(years_class != null) {
            var elements = document.getElementsByClassName(years_class);
            Array.from(elements).forEach(function(element) {
                element.addEventListener('change', (e) => {
                    e.data = StoreProducts['events'][years_class].onYearsChangeD;
                    return StoreProducts['events'][years_class].onYearsChangeF(e);
                });
            });
        }
    }

    var r;
    try {
        var l_hash = location.hash;

        if (l_hash.length < 1) {
            if ('var' in urlParams)
                l_hash = urlParams['var'];
        }

        if (l_hash.length > 1) {
            var pt = new RegExp(StoreProducts.product[product_id]['product_alias'] + "\\-(\\d{1,2})u\\-(\\d{1})y");

            if (pt != null) {
                r = pt.exec(l_hash);

                if (Array.isArray(r)) {
                    if (r.length == 3) {
                        if (r[1] in StoreProducts.product[product_id]['variations']) {
                            selected_users = r[1];
                            var elements = document.querySelectorAll('.nousers-' + selected_users);
                            Array.from(elements).forEach(function(element) {
                                var event = new Event('click');
                                element.dispatchEvent(event);
                            });
                        }
                        if (r[2] in StoreProducts.product[product_id]['variations'][selected_users]) {
                            selected_years = r[2];
                            var yearElement = document.getElementById('year' + selected_years);
                            var yearBtmElement = document.getElementById('year' + selected_years + '_btm');
                            var topTimeSelectorElement = document.getElementById('topTimeSelector-' + selected_years);

                            var clickEvent = new Event('click');

                            yearElement.dispatchEvent(clickEvent);
                            yearBtmElement.dispatchEvent(clickEvent);
                            topTimeSelectorElement.dispatchEvent(clickEvent);
                        }
                    }
            }   }
        }
    } catch (ex) {
    }

    var users = new Array();

    if(users_class != null)
    {

        try {

            for(i in StoreProducts.product[product_id]['variations'])
                users.push(i);

            users = users.sort(function(a,b) {return a-b;} );
        }
        catch (ex)
        {}

        users.forEach(function (value) {
            var label = users_label_prefix + ' ' + value + ' ' + users_label;
            if(value == 1)
                label = user_label_prefix + ' ' + value + ' ' + user_label;

            label = label.trim();

            var parentElement = document.querySelector("."+users_class);
            var optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.textContent = label;
            parentElement.appendChild(optionElement);
        });

        var elements = document.querySelectorAll("."+users_class+" [value=\"" + selected_users + "\"]");
        Array.from(elements).forEach(function(element) {
            element.selected = true;
        });

        if(document.querySelectorAll(`.${users_class}`).length) {
            var selectElement = document.querySelector("."+users_class);
            selected_users = selectElement.value;
        }
    }

    var years = new Array();

    if(years_class != null)
    {
        try
        {

            for(i in StoreProducts.product[product_id]['variations'][selected_users])
                years.push(i);

            years = years.sort(function(a,b) {return a-b;} );
        }
        catch (ex)
        {

        }

        years.forEach(function (value) {

            var label = years_label_prefix + ' ' + value + ' ' + years_label;
            if(value == 1)
                label = year_label_prefix + ' ' + value + ' ' + year_label;

            label = label.trim();

            var parentElement = document.querySelector("."+years_class);
            var optionElement = document.createElement('option');
            optionElement.value = value;
            optionElement.textContent = label;
            parentElement.appendChild(optionElement);
        });

        var elements = document.querySelectorAll("."+years_class+" [value=\"" + selected_years + "\"]");
        Array.from(elements).forEach(function(element) {
            element.selected = true;
        });

        if(document.querySelectorAll(`.${years_class}`).length) {
            var selectElement = document.querySelector("."+years_class);
            selected_years = selectElement.value;
        }
    }
    var variation = null;
    var base_uri = '';

    try
    {
        variation = StoreProducts.product[product_id]['variations'][selected_users][selected_years];
        base_uri = StoreProducts.product[product_id]['base_uri'];
    }
    catch (ex) {}

    if(variation == null)
    {
        try
        {
            min_users = 0;
            for(i in StoreProducts.product[product_id]['variations'])
            {
                if(min_users < i)
                    min_users = i;
            }

            if(min_users > 0)
            {
                selected_users = min_users;
                min_years = 0;

                for(i in StoreProducts.product[product_id]['variations'][selected_users])
                {
                    if(min_years < i)
                        min_years = i;
                }

                if(min_years > 0)
                {
                    selected_years = min_years;

                    variation = StoreProducts.product[product_id]['variations'][selected_users][selected_years];
                    base_uri = StoreProducts.product[product_id]['base_uri'];
                }
            }
        }
        catch (ex) {}
    }

    if(variation == null)
        return false;

    var price = variation['price'] + ' ' + variation['currency_label'];
    price = StoreProducts.formatPrice(variation['price'],variation['currency_label'],variation['region_id'],variation['currency_iso']);

    var discounted_price = '';
    var full_price = price;

    // if (window.location.hostname == 'www.bitdefender.se') {
    //     base_uri = "https://www.bitdefender.se/site";
    // }

    if ((typeof geoip_code != 'undefined' && geoip_code == 'gb') || window.location.hostname == 'www.bitdefender.co.uk' || window.location.hostname == 'old.bitdefender.co.uk') {
        base_uri = "https://www.bitdefender.co.uk/site";
    }

    var buy_link = base_uri+'/Store/buy/' + product_id + '/' + selected_users + '/' + selected_years;

    try
    {
        if('discount' in variation)
        {
            if('discounted_price' in variation['discount'])
            {
                discounted_price = StoreProducts.formatPrice(variation['discount']['discounted_price'],variation['currency_label'],variation['region_id'],variation['currency_iso']);
                price = '<span class="store_price_full">'+price+'</span><span class="store_price_cut">'+discounted_price+'</span>';
            }

            if('coupon' in variation['discount'])
            {
                variation['discount']['coupon'] = variation['discount']['coupon'].trim();

                if(variation['discount']['coupon'].length > 0)
                    buy_link = base_uri+'/Store/buy/' + product_id + '/' + selected_users + '/' + selected_years + '/' + 'coupon.'+encodeURIComponent(variation['discount']['coupon']) + '/' + 'platform.' + variation['platform_id'];
                else
                    buy_link = base_uri+'/Store/buy/' + product_id + '/' + selected_users + '/' + selected_years + '/' + 'platform.' + variation['platform_id'];
            }

            if('ref' in variation['discount'])
            {
                if(variation['discount']['ref'].length > 0)
                    buy_link = buy_link + '/ref.' + variation['discount']['ref'];
            }
        }
        else
        {
            if(discount != null)
            {
                discounted_price = StoreProducts.getDiscountedPrice(variation['price'],discount);
                discounted_price = StoreProducts.formatPrice(discounted_price,variation['currency_label'],variation['region_id'],variation['currency_iso']);
                price = '<span class="store_price_full">'+price+'</span><span class="store_price_cut">'+discounted_price+'</span>';
            }
        }
    }
    catch (ex) {
        console.log(ex)
    }

    try {
        if (extra_params != null) {
            var params = '';

            for (op in extra_params) {
                if (op == 'force_country')
                    continue;

                extra_params[op] = extra_params[op].trim();
                if (extra_params[op].length < 1)
                    continue;

                var re = new RegExp(op + '.[^/]*/?', 'g');

                buy_link = buy_link.replace(re, '');
                buy_link = buy_link.replace(/\/$/g, '');

                if (params.length == 0)
                    params = '/' + op + '.' + encodeURIComponent(extra_params[op]);
                else
                    params = params + '/' + op + '.' + encodeURIComponent(extra_params[op]);
            }

            if (params.length > 1)
                buy_link = buy_link + params;

            buy_link = StoreProducts.filterBuyLink(config, buy_link);

            if ('force_country' in extra_params)
                buy_link = buy_link + '?force_country=' + extra_params['force_country'];
        } else {
            buy_link = StoreProducts.filterBuyLink(config, buy_link);
        }
    }
    catch (ex) {
        console.log(ex)
    }

    if(price_class != null) {
        var elements = document.getElementsByClassName(price_class);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = price;
        });
            if (variation['currency_label'].length > 2) {
                var elements = document.getElementsByClassName(price_class);
                Array.from(elements).forEach(function(element) {
                    element.classList.add('makeItSmall');
                });
            }
    }

    try
    {
        if(price_class != null)
        {
            var p_len = full_price.length + discounted_price.length;

            if(p_len <= 10) {
                var elements = document.getElementsByClassName(price_class);
                Array.from(elements).forEach(function(element) {
                    element.classList.add("price_small");
                });
            }

            if(p_len > 10 && p_len <= 18) {
                var elements = document.getElementsByClassName(price_class);
                Array.from(elements).forEach(function(element) {
                    element.classList.add("price_medium");
                });
            }

            if(p_len > 18) {
                var elements = document.getElementsByClassName(price_class);
                Array.from(elements).forEach(function(element) {
                    element.classList.add("price_large");
                });
            }
        }
    }
    catch(ex)
    {}

    full_price = full_price;
    discounted_price = discounted_price;

    if (discounted_price_class != null) {
        var elements = document.getElementsByClassName(discounted_price_class);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = discounted_price;
        });
    }

    if (full_price_class != null) {
        var elements = document.getElementsByClassName(full_price_class);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = full_price;
        });
    }

    if (buy_class != null) {
        // DEX-11415
        var elements = document.querySelectorAll("."+buy_class);
        Array.from(elements).forEach(function(element) {
            element.addEventListener('click', function(e) {
                var buy_link = element.getAttribute('href');
                if (buy_link.indexOf('adobe_mc') === -1) {
                    e.preventDefault();
                    buy_link = StoreProducts.appendVisitorID(buy_link);
                    window.location.href = buy_link;
                }
            });
        });

        // buy_link = StoreProducts.appendVisitorID(buy_link);
        var elements = document.querySelectorAll("."+buy_class);
        Array.from(elements).forEach(function(element) {
            element.setAttribute('href', buy_link);
        });

        if (typeof __targetCallBack != 'undefined') {
            try {
                __targetCallBack(buy_class, c_config['product_id'], selected_users, selected_years);
            } catch (ex) {
                console.log('target ex:' + ex)
            }
        }
    }

    try {
        StoreProducts.setInfo(buy_class, product_id, variation);
        StoreProducts.setDigitalData(product_id, variation);
    } catch(ex) {}

    try
    {
        ocg = StoreProducts['events'][users_class+years_class].onSelectorLoad;

        var thisObj = new Object();

        thisObj['selected_users'] = selected_users;
        thisObj['selected_years'] = selected_years;
        thisObj['selected_variation'] = variation;
        thisObj['buy_link'] = buy_link;
        thisObj['config'] = config;

        // A: Omniture Buy link, click tracking
        try {
            var elements = document.getElementsByClassName(config.buy_class);
            Array.from(elements).forEach(function(element) {
                element.addEventListener('click', function(e) {
                    if (typeof oBuyLinkClick === 'function') {
                        oBuyLinkClick(this, DEFAULT_LANGUAGE, e.currentTarget.dataset.obj.config.product_id, StoreProducts.product[e.currentTarget.dataset.obj.config.product_id].product_name, e.currentTarget.dataset.obj.selected_users + "u," + e.currentTarget.dataset.obj.selected_years + "y");
                    }
                }.bind({config: config, selected_users: thisObj.selected_users, selected_years: thisObj.selected_years}));
            });
        } catch(ex) {}
        // end Omniture Buy link

        if (ocg != null)
        {
            ocg.call(thisObj);
        }

        if('promotion_functions' in variation)
        {
            if(variation['promotion_functions'].length > 0)
            {
                var jsc = Base64.decode(variation['promotion_functions']);

                var PromotionFunctions = null;

                eval(jsc);

                StoreProducts['events'][users_class+years_class].promotionsCleanUp = {};

                if('cleanUp' in PromotionFunctions)
                {
                    StoreProducts['events'][users_class+years_class].promotionsCleanUp[variation['promotion']] = PromotionFunctions.cleanUp;
                }

                ocg = PromotionFunctions.onLoad;

                ocg.call(thisObj);
            }
        }

        try
        {
            if(typeof StoreCBS != 'undefined' && StoreCBS != null && ('go' in StoreCBS))
            {
                StoreCBS.go(thisObj,['selector','onload',StoreProducts.product[product_id].product_id,StoreProducts.product[product_id].product_alias,'initCount:'+config['initCount'],'productType:'+StoreProducts.product[product_id].product_type]);
            }
        }
        catch(ex) {}
    }
    catch(ex) {}
};

StoreProducts.truncatePrice = function(price)
{
    var ret = price;

    try {
        if(ret >= 0)
            ret = Math.floor(ret);
        else
            ret = Math.ceil(ret);

        if(price != ret)
            ret = price;
    }
    catch(ex)
    {

    }

    return ret;
};

StoreProducts.formatPrice = function(price,currency,region,currency_iso)
{
    price = StoreProducts.truncatePrice(price);

    try {
        getBrowserLocale = StoreProducts.getFirstBrowserLanguage();

        var formatter = new Intl.NumberFormat(getBrowserLocale, {
            style: 'decimal',
            minimumFractionDigits: 0,
        });

        price = formatter.format(price);
    } catch(err) {}

    try{
        //replace , only if it's not the decimal seperator
        if(price.toString().indexOf(',') != -1)
        {
            var priceParts = price.split(',');
            if(priceParts[1].length > 2)
            {
                price = price.replace(',', '');
            }
        }
    } catch(err){}


    //petre
    if(region == 3)
        return currency + price;

    if(region == 4)
        return currency + price;

    if(region == 5)
        return price + ' ' + currency;

    if(region == 7)
        return price + ' ' + currency;

    if(region == 25)
        return currency + price;

    if(region == 8 || region == 2 || region == 11)
        return currency + price;

    if(region == 13)
        return currency + price;

    if(region == 16 && DEFAULT_LANGUAGE == 'nl'){
        try{
            price = price.replace('.', ',');
        } catch(err){}

        return currency + ' ' + price;
    }

    if(region == 17 || region == 18)
    {
        var fprice = price + ' ' + currency;

        try
        {
            fprice = parseFloat(price).toFixed(2) + ' ' + currency;
        }
        catch(ex) {}

        return fprice;
    }

    return price + ' ' + currency;
};

StoreProducts.getDiscountedPrice = function(val,pc)
{
    var dp = (val * pc ) / 100;
    val = val - dp;
    val = val.toFixed(2);
    return val;
};

StoreProducts.__onChangeUsers = function(ev)
{
    var c_config = ev.data;
    var selectElement = document.querySelector("."+c_config['users_class']);
    var selected_users = selectElement.options[selectElement.selectedIndex].value;

    var years = new Array();

    try
    {
        for(i in StoreProducts.product[c_config['product_id']]['variations'][selected_users])
            years.push(i);

        years = years.sort(function(a,b) {return a-b;} );
    }
    catch (ex)
    {}

    //retin valoarea selectata
    var selectElement = document.querySelector("."+c_config['years_class']);
    var old_selected_years = selectElement.options[selectElement.selectedIndex].value;

    //distrug si refac selectorul
    var elements = document.getElementsByClassName(c_config['years_class']);
    Array.from(elements).forEach(function(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    });

    years.forEach(function (value) {
        var label = value + ' ' + c_config['years_label'];

        if(value == 1)
            label = value + ' ' + c_config['year_label'];

        var elements = document.getElementsByClassName(c_config['years_class']);
        Array.from(elements).forEach(function(element) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            element.appendChild(option);
        });
    });


    try
    {
        //reselectez vechea valoare, daca initial e selectat 1u 3y si se selecteaza 5u o sa se reselecteze automat 3y
        var selectElement = document.querySelector("."+c_config['years_class']);
        var optionElement = selectElement.querySelector('option[value="'+old_selected_years+'"]');
        optionElement.selected = true;
    }
    catch(ex) {}

    var selected_years = document.querySelector(`.${c_config['years_class']}`).value;

    var variation = null;
    var base_uri = '';

    try
    {
        variation = StoreProducts.product[c_config['product_id']]['variations'][selected_users][selected_years];
        base_uri = StoreProducts.product[c_config['product_id']]['base_uri'];
    }
    catch (ex) {}

    if(variation == null)
        return null;

    var price = variation['price'] + ' ' + variation['currency_label'];
    price = StoreProducts.formatPrice(variation['price'],variation['currency_label'],variation['region_id'],variation['currency_iso']);
    var discounted_price = '';
    var full_price = price;

    // if (window.location.hostname == 'www.bitdefender.se') {
    //     base_uri = "https://www.bitdefender.se/site";
    // }

    var buy_link = base_uri+'/Store/buy/' + c_config['product_id'] + '/' + selected_users + '/' + selected_years;

    try
    {
        if('discount' in variation)
        {
            if('discounted_price' in variation['discount'])
            {
                discounted_price = StoreProducts.formatPrice(variation['discount']['discounted_price'],variation['currency_label'],variation['region_id'],variation['currency_iso']);
                price = '<span class="store_price_full">'+price+'</span><span class="store_price_cut">'+discounted_price+'</span>';
            }

            if('coupon' in variation['discount'])
            {
                variation.discount.coupon = variation.discount.coupon.trim();

                if(variation['discount']['coupon'].length > 0)
                    buy_link = base_uri+'/Store/buy/' + c_config['product_id'] + '/' + selected_users + '/' + selected_years + '/' + 'coupon.'+encodeURIComponent(variation['discount']['coupon']) + '/' + 'platform.' + variation['platform_id'];
                else
                    buy_link = base_uri+'/Store/buy/' + c_config['product_id'] + '/' + selected_users + '/' + selected_years + '/' + 'platform.' + variation['platform_id'];
            }

            if('ref' in variation['discount'])
            {
                if(variation['discount']['ref'].length > 0)
                    buy_link = buy_link + '/ref.' + variation['discount']['ref'];
            }
        }
        else
        {
            if(discount in c_config)
            {
                if(c_config['discount'] != null)
                {
                    discounted_price = StoreProducts.getDiscountedPrice(variation['price'],discount);
                    discounted_price = StoreProducts.formatPrice(discounted_price,variation['currency_label'],variation['region_id'],variation['currency_iso']);
                    price = '<span class="store_price_full">'+price+'</span><span class="store_price_cut">'+discounted_price+'</span>';
                }
            }
        }
    }
    catch (ex) {}

    try
    {
        if('extra_params' in c_config)
        {
            if(c_config['extra_params'] != null)
            {
                var params = '';
                for(op in c_config['extra_params'])
                {
                    if(op == 'force_country')
                        continue;

                    c_config['extra_params'][op] = c_config['extra_params'][op].trim();
                    if(c_config['extra_params'][op].length < 1)
                        continue;

                    var re = new RegExp(op+'.[^/]*/?','g');

                    buy_link = buy_link.replace(re,'');
                    buy_link = buy_link.replace(/\/$/g,'');

                    if(params.length == 0)
                        params = '/'+op+'.'+encodeURIComponent(c_config['extra_params'][op]);
                    else
                        params = params+'/'+op+'.'+encodeURIComponent(c_config['extra_params'][op]);
                }

                if(params.length > 1)
                    buy_link = buy_link + params;

                if('force_country' in c_config['extra_params'])
                    buy_link = buy_link + '?force_country=' + c_config['extra_params']['force_country'];
            }
        }
    }
    catch(ex) {}

    var elements = document.getElementsByClassName(c_config['price_class']);
    Array.from(elements).forEach(function(element) {
        element.innerHTML = price;
    });

    full_price = full_price;
    discounted_price = discounted_price;

    if(c_config['discounted_price_class'] != null) {
        var elements = document.getElementsByClassName(c_config['discounted_price_class']);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = discounted_price;
        });
    }

    if(c_config['full_price_class'] != null) {
        var elements = document.getElementsByClassName(c_config['full_price_class']);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = full_price;
        });

    }
    buy_link = StoreProducts.filterBuyLink(c_config, buy_link);
    buy_link = StoreProducts.appendVisitorID(buy_link);
    var elements = document.querySelectorAll("."+c_config['buy_class']);
    Array.from(elements).forEach(function(element) {
        element.setAttribute('href', buy_link);
    });

    try
    {
        var ocg = c_config['onChangeUsers'];
        var thisObj = new Object();

        thisObj['selected_users'] = selected_users;
        thisObj['selected_years'] = selected_years;
        thisObj['selected_variation'] = variation;
        thisObj['buy_link'] = buy_link;
        thisObj['config'] = c_config;

        if(ocg != null)
        {
            ocg.call(thisObj);
        }

        var users_class = c_config['users_class'];
        var years_class = c_config['years_class'];

        if('promotionsCleanUp' in StoreProducts['events'][users_class+years_class])
        {
            for(iev in StoreProducts['events'][users_class+years_class].promotionsCleanUp)
            {
                ocg = StoreProducts['events'][users_class+years_class].promotionsCleanUp[iev];
                ocg.call(thisObj);
            }
        }

        if('promotion_functions' in variation)
        {
            if(variation['promotion_functions'].length > 0)
            {
                var jsc = Base64.decode(variation['promotion_functions']);

                var PromotionFunctions = null;

                eval(jsc);

                if(!('promotionsCleanUp' in StoreProducts['events'][users_class+years_class]))
                    StoreProducts['events'][users_class+years_class].promotionsCleanUp = {};

                if('cleanUp' in PromotionFunctions)
                {
                    if(!(variation['promotion'] in StoreProducts['events'][users_class+years_class].promotionsCleanUp))
                        StoreProducts['events'][users_class+years_class].promotionsCleanUp[variation['promotion']] = PromotionFunctions.cleanUp;
                }

                ocg = PromotionFunctions.onChange;
                ocg.call(thisObj);
            }
        }

        try
        {
            if(typeof StoreCBS != 'undefined' && StoreCBS != null && ('go' in StoreCBS))
            {
                StoreCBS.go(thisObj,['selector','onchange','onchangeusers',StoreProducts.product[c_config['product_id']].product_id,StoreProducts.product[c_config['product_id']].product_alias,'initCount:'+c_config['initCount'],'productType:'+StoreProducts.product[c_config['product_id']].product_type]);
            }
        }
        catch(ex) {}
    }
    catch(ex) {

    }

    try {
        delete digitalData.product;
        StoreProducts.setInfo(c_config['buy_class'], c_config['product_id'], variation);
        StoreProducts.setDigitalData(c_config['product_id'], variation);
    } catch(ex) {}

    if (typeof __targetCallBack != 'undefined') {
        try {
            __targetCallBack(c_config['buy_class'], c_config['product_id'], selected_users, selected_years);
        } catch (ex) { console.log('target ex:' + ex) }
    }
};

StoreProducts.__onChangeYears = function(ev)
{
    var c_config = ev.data;
    var selected_users = document.querySelector(`.${c_config['users_class']}`).value;
    var selected_years = document.querySelector(`.${c_config['years_class']}`).value;

    var variation = null;
    var base_uri = '';

    try
    {
        variation = StoreProducts.product[c_config['product_id']]['variations'][selected_users][selected_years];
        base_uri = StoreProducts.product[c_config['product_id']]['base_uri'];
    }
    catch (ex) {}

    if(variation == null)
        return false;

    var price = variation['price'] + ' ' + variation['currency_label'];
    price = StoreProducts.formatPrice(variation['price'],variation['currency_label'],variation['region_id'],variation['currency_iso']);
    var discounted_price = '';
    var full_price = price;

    // if (window.location.hostname == 'www.bitdefender.se') {
    //     base_uri = "https://www.bitdefender.se/site";
    // }

    var buy_link = base_uri+'/Store/buy/' + c_config['product_id'] + '/' + selected_users + '/' + selected_years;

    try
    {
        if('discount' in variation)
        {
            if('discounted_price' in variation['discount'])
            {
                discounted_price = StoreProducts.formatPrice(variation['discount']['discounted_price'],variation['currency_label'],variation['region_id'],variation['currency_iso']);
                price = '<span class="store_price_full">'+price+'</span><span class="store_price_cut">'+discounted_price+'</span>';
            }

            if('coupon' in variation['discount'])
            {
                variation['discount']['coupon'] = variation['discount']['coupon'].trim();

                if(variation['discount']['coupon'].length > 0)
                    buy_link = base_uri+'/Store/buy/' + c_config['product_id'] + '/' + selected_users + '/' + selected_years + '/' + 'coupon.'+encodeURIComponent(variation['discount']['coupon']) + '/' + 'platform.' + variation['platform_id'];
                else
                    buy_link = base_uri+'/Store/buy/' + c_config['product_id'] + '/' + selected_users + '/' + selected_years + '/' + 'platform.' + variation['platform_id'];
            }

            if('ref' in variation['discount'])
            {
                if(variation['discount']['ref'].length > 0)
                    buy_link = buy_link + '/ref.' + variation['discount']['ref'];
            }
        }
        else
        {
            if(discount in c_config)
            {
                if(c_config['discount'] != null)
                {
                    discounted_price = StoreProducts.getDiscountedPrice(variation['price'],discount);
                    discounted_price = StoreProducts.formatPrice(discounted_price,variation['currency_label'],variation['region_id'],variation['currency_iso']);
                    price = '<span class="store_price_full">'+price+'</span><span class="store_price_cut">'+discounted_price+'</span>';
                }
            }
        }
    }
    catch (ex) {}

    try
    {
        if('extra_params' in c_config)
        {
            if(c_config['extra_params'] != null)
            {
                var params = '';
                for(op in c_config['extra_params'])
                {
                    if(op == 'force_country')
                        continue;

                    c_config['extra_params'][op] = c_config['extra_params'][op].trim();
                    if(c_config['extra_params'][op].length < 1)
                        continue;

                    var re = new RegExp(op+'.[^/]*/?','g');

                    buy_link = buy_link.replace(re,'');
                    buy_link = buy_link.replace(/\/$/g,'');

                    if(params.length == 0)
                        params = '/'+op+'.'+encodeURIComponent(c_config['extra_params'][op]);
                    else
                        params = params+'/'+op+'.'+encodeURIComponent(c_config['extra_params'][op]);
                }

                if(params.length > 1)
                    buy_link = buy_link + params;

                if('force_country' in c_config['extra_params'])
                    buy_link = buy_link + '?force_country=' + c_config['extra_params']['force_country'];
            }
        }
    }
    catch(ex) {}

    var elements = document.getElementsByClassName(c_config['price_class']);
    Array.from(elements).forEach(function(element) {
        element.innerHTML = price;
    });

    full_price = full_price;
    discounted_price = discounted_price;

    if(c_config['discounted_price_class'] != null) {
        var elements = document.getElementsByClassName(c_config['discounted_price_class']);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = discounted_price;
        });
    }

    if(c_config['full_price_class'] != null) {
        var elements = document.getElementsByClassName(c_config['full_price_class']);
        Array.from(elements).forEach(function(element) {
            element.innerHTML = full_price;
        });
    }
    buy_link = StoreProducts.filterBuyLink(c_config, buy_link);
    buy_link = StoreProducts.appendVisitorID(buy_link);
    var elements = document.getElementsByClassName(c_config['buy_class']);
    Array.from(elements).forEach(function(element) {
        element.setAttribute('href', buy_link);
    });

    try
    {
        var ocg = c_config['onChangeYears'];
        var thisObj = new Object();

        thisObj['selected_users'] = selected_users;
        thisObj['selected_years'] = selected_years;
        thisObj['selected_variation'] = variation;
        thisObj['buy_link'] = buy_link;
        thisObj['config'] = c_config;

        if(ocg != null)
        {
            ocg.call(thisObj);
        }

        var users_class = c_config['users_class'];
        var years_class = c_config['years_class'];

        if('promotionsCleanUp' in StoreProducts['events'][users_class+years_class])
        {
            for(iev in StoreProducts['events'][users_class+years_class].promotionsCleanUp)
            {
                ocg = StoreProducts['events'][users_class+years_class].promotionsCleanUp[iev];
                ocg.call(thisObj);
            }
        }

        if('promotion_functions' in variation)
        {
            if(variation['promotion_functions'].length > 0)
            {
                var jsc = Base64.decode(variation['promotion_functions']);

                var PromotionFunctions = null;

                eval(jsc);

                if(!('promotionsCleanUp' in StoreProducts['events'][users_class+years_class]))
                    StoreProducts['events'][users_class+years_class].promotionsCleanUp = {};

                if('cleanUp' in PromotionFunctions)
                {
                    if(!(variation['promotion'] in StoreProducts['events'][users_class+years_class].promotionsCleanUp))
                        StoreProducts['events'][users_class+years_class].promotionsCleanUp[variation['promotion']] = PromotionFunctions.cleanUp;
                }

                ocg = PromotionFunctions.onChange;
                ocg.call(thisObj);
            }
        }

        try
        {
            if(typeof StoreCBS != 'undefined' && StoreCBS != null && ('go' in StoreCBS))
            {
                StoreCBS.go(thisObj,['selector','onchange','onchangeyears',StoreProducts.product[c_config['product_id']].product_id,StoreProducts.product[c_config['product_id']].product_alias,'initCount:'+c_config['initCount'],'productType:'+StoreProducts.product[c_config['product_id']].product_type]);
            }
        }
        catch(ex) {}

    }
    catch(ex) {

    }

    try {
        delete digitalData.product;
        StoreProducts.setInfo(c_config['buy_class'], c_config['product_id'], variation);
        StoreProducts.setDigitalData(c_config['product_id'], variation);
    } catch(ex) {}

    if (typeof __targetCallBack != 'undefined') {
        try {
            __targetCallBack(c_config['buy_class'], c_config['product_id'], selected_users, selected_years);
        } catch (ex) { console.log('target ex:' + ex) }
    }
};

StoreProducts.loadProducts = function(config)
{
    var so = new Object();
    so.ev = 2;
    var async = false;

    if('async' in config)
        async = config.async == true ? true : false;

    if(!('products' in config))
        return false;

    if(!(config.products instanceof Array))
        return false;

    if(config.products.length < 1)
        return false;

    var hasPID = false;
    if(typeof tagit_params !== 'undefined') {
        for (i in tagit_params.obj) {
            if ('pid' in tagit_params.obj[i]) {
                hasPID = true;

                break;
            }
        }
    }

    so.config = config;
    var url = '/site/Store/ajax';

    var urlParams = {};

    try
    {
        (function () {
            var e,
              a = /\+/g,  // Regex for replacing addition symbol with a space
              r = /([^&=]+)=?([^&]*)/g,
              d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
              q = window.location.search.substring(1);

            while (e = r.exec(q))
                urlParams[d(e[1])] = d(e[2]);
        })();
    } catch(ex)  {}

    // if (window.location.hostname == 'www.bitdefender.se') {
    //     BASE_URI = "https://www.bitdefender.se";
    // }

    try
    {
        if(typeof BASE_URI != 'undefined')
        {
            if(BASE_URI != null)
            {
                if(BASE_URI.length > 0)
                    url = BASE_URI + '/Store/ajax';
            }
        }
    }
    catch(ex)  {}

    try
    {
        if('force_country' in urlParams)
        {
            url = url + '?force_country='+urlParams['force_country'];
        }
    }
    catch(ex)
    {}

    var onload = function(data)
    {
        var response_code = data['code'];
        var response_data = data['data'];

        if(response_code != 0)
        {

        }
        else
        {
            if('products' in response_data)
            {
                for(var i in response_data['products'])
                {
                    StoreProducts['product'][response_data['products'][i]['product_id']] = response_data['products'][i];
                    StoreProducts['product'][response_data['products'][i]['product_alias']] = response_data['products'][i];
                }
            }
        }

        try
        {
            if('onLoad' in config)
                config.onLoad();
        }
        catch(ex) {}
    };


    so = JSON.stringify(so);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: so }),
        async: async
    })
      .then(function(response) {
          return response.json();
      })
      .then(onload)
      .catch(function(error) {
          // Handle any error that occurred during the request
      });
};

StoreProducts.getBundleProductsInfo = function(va, vb, config)
{
    var base_uri = StoreProducts.product[va.product_id]['base_uri'];

    // if (window.location.hostname == 'www.bitdefender.se') {
    //     base_uri = "https://www.bitdefender.se/site";
    // }

    if (typeof geoip_code != 'undefined' && geoip_code == 'gb') {
        base_uri = "https://www.bitdefender.co.uk/site";
    }

    var buy_link = base_uri+'/Store/buybundle';

    var pa = StoreProducts.product[va.product_id];
    var pb = StoreProducts.product[vb.product_id];

    var extra_params = {};

    try
    {
        va.selected_users = va.variation.dimension_value;
        va.selected_years = va.variation.years;

        buy_link += '/' + pa.product_alias + '/' + va.selected_users + '/' + va.selected_years;
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
    }
    catch (ex) {}

    try
    {
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
    }
    catch(ex) {}

    try
    {
        vb.selected_users = vb.variation.dimension_value;
        vb.selected_years = vb.variation.years;

        buy_link += '/' + pb.product_alias + '/' + vb.selected_users + '/' + vb.selected_years;
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
    }
    catch (ex) {}

    try
    {
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

        if('force_country' in extra_params)
            buy_link = buy_link + '?force_country=' + extra_params['force_country'];
    }
    catch(ex) {}


    var ret_price = 0;

    ret_price = (va.price * 100) / 100 + (vb.price * 100) / 100;
    ret_price = ret_price.toFixed(2);
    ret_price = StoreProducts.formatPrice(ret_price,va['currency_label'],va['region_id'],va['currency_iso']);

    buy_link = StoreProducts.filterBuyLink(config, buy_link);
    buy_link = StoreProducts.appendVisitorID(buy_link);
    return {buy_link: buy_link, price: ret_price};
};

StoreProducts.setInfo = function(buy_class, product_id, variation){
    if(buy_class != null && buy_class != ""){
        var elements = document.getElementsByClassName(buy_class);
        Array.from(elements).forEach(function(element) {
            element.setAttribute('data-product', product_id);
        });

        if(typeof(variation.discount) !== 'undefined'){
            var elements = document.getElementsByClassName(buy_class);
            Array.from(elements).forEach(function(element) {
                element.setAttribute('data-buy-price', variation.discount.discounted_price);
            });
        } else {
            var elements = document.getElementsByClassName(buy_class);
            Array.from(elements).forEach(function(element) {
                element.setAttribute('data-buy-price', variation.price);
            });
        }
        var elements = document.getElementsByClassName(buy_class);
        Array.from(elements).forEach(function(element) {
            element.setAttribute('data-old-price', variation.price);
            element.setAttribute('data-currency', variation.currency_label);
            element.setAttribute('data-region', variation.region_id);
            element.setAttribute('data-variation', variation.variation.variation_name);
        });
    }
};

StoreProducts.requestPricingInfo = function (so) {
    const url = so.url;
    let config = so.config;
    so = JSON.stringify(so);

    if (config.method && config.method.toLowerCase() == 'get') {
        let urlGet = new URL(url);
        const soBase64 = Base64.encode(so);
        urlGet.searchParams.set('data', encodeURI(soBase64));
        fetch(urlGet.toString())
          .then(function(response) {
              return response.json();
          })
          .then(handleResponse)
          .catch(function(error) {
              // Handle any error that occurred during the request
          });
    } else {
        // let params = new URLSearchParams();
        // params.append('data', so);

        let formData = new FormData();
        formData.append('data', so);
        fetch(url, {
            method: 'POST',
            body: formData
        })
          .then(function(response) {
              return response.json();
          })
          .then(handleResponse)
          .catch(function(error) {
              // Handle any error that occurred during the request
          });
    }
};

const handleResponse = function(data) {
    const response_code = data['code'];
    const response_data = data['data'];

    if(response_code != 0)
    {

    }
    else
    {
        try {
            let product_info = response_data['product']['product_id'];
            var product_id = response_data['product']['product_id'];
            var product_alias = response_data['product']['product_alias'];

            if(!(product_info in StoreProducts.product))
                product_info = product_alias;

            StoreProducts['product'][response_data['product']['product_id']] = response_data['product'];
            StoreProducts['product'][response_data['product']['product_alias']] = response_data['product'];

            StoreProducts.initSelector(response_data['config']);
        }
        catch (ex)
        {}
    }
}

/**
 * Dynamic Pricing coupon configuration
 * @param productAlias
 * @param discount
 * @returns {*}
 */
StoreProducts.getPromoCode = function(productAlias, discount) {
    var promoSteps = {
        "av": [
            {"min": 0, "max": 20, "pid": "DPAV01OFF"},
            {"min": 21, "max": 29, "pid": "DPAV02OFF"},
            {"min": 30, "max": 38, "pid": "DPAV03OFF"},
            {"min": 39, "max": 46, "pid": "DPAV04OFF"},
            {"min": 47, "max": 54, "pid": "DPAV05OFF"},
            {"min": 55, "max": 100, "pid": "DPAV06OFF"}
        ],
        "is": [
            {"min": 0, "max": 28, "pid": "DPAV01OFF"},
            {"min": 29, "max": 34, "pid": "DPAV02OFF"},
            {"min": 35, "max": 41, "pid": "DPAV03OFF"},
            {"min": 42, "max": 47, "pid": "DPAV04OFF"},
            {"min": 48, "max": 56, "pid": "DPAV05OFF"},
            {"min": 57, "max": 100, "pid": "DPAV06OFF"}
        ],
        "tsmd": [
            {"min": 0, "max": 28, "pid": "DPAV01OFF"},
            {"min": 29, "max": 39, "pid": "DPAV02OFF"},
            {"min": 40, "max": 47, "pid": "DPAV03OFF"},
            {"min": 48, "max": 53, "pid": "DPAV04OFF"},
            {"min": 54, "max": 58, "pid": "DPAV05OFF"},
            {"min": 59, "max": 100, "pid": "DPAV06OFF"}
        ]
    };
    for (i in promoSteps[productAlias]) {
        if (discount >= promoSteps[productAlias][i]['min'] && discount <= promoSteps[productAlias][i]['max']) {
            return promoSteps[productAlias][i]['pid'];
        }
    }
    return false;
}

/**
 * Fix inainte de a aduce informatiile din baza de date, interogam pentru promitii
 * @param so
 * @returns {*}
 */
StoreProducts.filterRequestObject = function (so) {

    if (typeof DEFAULT_LANGUAGE === 'undefined' || DEFAULT_LANGUAGE !== 'en') {
        StoreProducts.requestPricingInfo(so);
        return false;
    }

    if (typeof _satellite === 'undefined') {
        StoreProducts.requestPricingInfo(so);
        return false;
    }

    if (typeof _satellite.buildInfo !== "undefined") {
        if (_satellite.buildInfo.environment == 'development') {
            StoreProducts.requestPricingInfo(so);
            return false;
        }
    } else {
        StoreProducts.requestPricingInfo(so);
        return false;
    }

    if (typeof digitalData !== 'undefined'
      && digitalData.page.info.subSubSubSection != '5001'
      && digitalData.page.info.subSubSubSection != '5002'
      && digitalData.page.info.subSubSubSection != '5004'
      && digitalData.page.info.subSubSubSection != '7001'
      && digitalData.page.info.subSubSubSection != '8001'
    ) {
        StoreProducts.requestPricingInfo(so);
        return false;
    }

    var experience = false;
    if ('undefined' !== typeof ttMETA) {
        for (var i in ttMETA) {
            if (ttMETA[i].campaign === 'COM - Dynamic Pricing Split') {
                if (ttMETA[i].experience.indexOf('Experience B') !== -1) {
                    experience = 'B';
                }
                if (ttMETA[i].experience.indexOf('Experience C') !== -1) {
                    experience = 'C';
                }
            }
        }
    }

    if (!experience) {
        StoreProducts.requestPricingInfo(so);
        return false;
    }

    var product = '';
    switch (so.product_id) {
        case "av":
            product = 'Antivirus';
            break;
        case "is":
            product = 'Internet Security';
            break;
        case "tsmd":
            product = 'Total Security';
            break;
        default:
            StoreProducts.requestPricingInfo(so);
            return false;
    }

    /* more filtering - by pid this time */
    if (typeof tagit_params !== 'undefined') {
        for (i in tagit_params.obj) {
            if ('pid' in tagit_params.obj[i]) {
                // google_organic
                if (tagit_params.obj[i].pid.param_value.includes('google_organic')) {
                    StoreProducts.requestPricingInfo(so);
                    break;
                }
            }
        }
    }

    if ('undefined' === typeof digitalData.user.profileConsumer) {
        digitalData.user.profileConsumer = new Object();
    }

    var cloud_id = _satellite.getVisitorId().getMarketingCloudVisitorID();
    var requestObj = {family: product, marketing_cloud_id: cloud_id };
    requestObj = JSON.stringify(requestObj);
    fetch("https://onza5mmwed.execute-api.us-east-1.amazonaws.com/dev/dyn-price", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestObj),
        timeout: 1000 // in milliseconds
    })
      .then(function(response) {
          if (!response.ok) {
              throw new Error(response.status);
          }
          return response.json();
      })
      .then(function(data) {
          if (data.discount) {
              var discount = parseFloat(data.discount);
              if (!isNaN(discount)) {
                  var promoCode = StoreProducts.getPromoCode(so.product_id, discount);
                  if (experience === "B") {
                      if (typeof digitalData.user.profileConsumer.dynamic === "undefined") {
                          digitalData.user.profileConsumer.dynamic = "applied|";
                      }
                      digitalData.user.profileConsumer.dynamic = so.product_id + discount + "|";
                      so.config.extra_params = { pid: promoCode };
                  }
                  if (experience === "C") {
                      digitalData.user.profileConsumer.dynamic = "notapplied|" + discount;
                  }
              } else {
                  digitalData.user.profileConsumer.dynamic = "error";
              }
          }
          StoreProducts.requestPricingInfo(so);
      })
      .catch(function(error) {
          if (error.message === "403") {
              digitalData.user.profileConsumer.dynamic = "none";
          } else {
              digitalData.user.profileConsumer.dynamic = "error|" + error.message;
          }
          StoreProducts.requestPricingInfo(so);
      });
};

var all_page_products = [];
var oneTimeSendData = false;
var satellite_track_once = 1;
StoreProducts.setDigitalData = function(product_id, variation) {
    try {
        if (typeof digitalData !== "undefined") {
            /**
             if (digitalData.page.category.primary == "landing page") {
                if (StoreProducts.product[product_id].product_type == 1) {
                    digitalData.page.category.secondary = "consumer";
                }
                if (StoreProducts.product[product_id].product_type == 2) {
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
             **/

            if (digitalData.page.info.subSubSection == "viewproduct" && digitalData.page.info.name.indexOf(StoreProducts.product[product_id].product_id) !== -1) {
                var found = false;
                if (digitalData.product !== "undefined") {
                    for (i in digitalData.product) {
                        if (digitalData.product[i].info.ID == StoreProducts.product[product_id].product_id) {
                            found = true;

                            if (digitalData.product[i].info.devices != parseInt(variation.variation.dimension_value)) {
                                digitalData.product[i].info.devices = parseInt(variation.variation.dimension_value).toString();
                            }

                            if (digitalData.product[i].info.subscription != parseInt(variation.variation.years * 12)) {
                                digitalData.product[i].info.subscription = parseInt(variation.variation.years * 12).toString();
                            }

                            break;
                        }
                    }
                }

                if (!found) {
                    var productName = StoreProducts.product[product_id].product_name.replace(/\d/g, '').trim();
                    var productVersion = parseInt(StoreProducts.product[product_id].product_name.replace(/\D/g, ''));

                    if (isNaN(productVersion)) {
                        productVersion = 0;
                    }

                    var productInfo = {
                        ID: parseInt(StoreProducts.product[product_id].product_id).toString(),
                        name: productName,
                        version: productVersion.toString(),
                        devices: parseInt(variation.variation.dimension_value).toString(),
                        subscription: parseInt(variation.variation.years * 12).toString(),
                        basePrice : StoreProducts.product[product_id].variations[parseInt(variation.variation.dimension_value)][parseInt(variation.variation.years)].price,
                        currency : StoreProducts.product[product_id].variations[parseInt(variation.variation.dimension_value)][parseInt(variation.variation.years)].currency_iso
                    };


                    if (typeof digitalData.product === "undefined") {
                        digitalData.product = [];
                    }

                    var primaryCategory = "";
                    var subCategory = "";
                    switch (StoreProducts.product[product_id].product_type) {
                        case "1" :
                            primaryCategory = "consumer";
                            subCategory = "subscriptions";
                            break;

                        case "2" :
                            primaryCategory = "business";
                            subCategory = "subscriptions";
                            break;

                        case "3" :
                            primaryCategory = "consumer";
                            subCategory = "services";
                            break;
                    }

                    var productCategory = {
                        primary: primaryCategory,
                        secondary: subCategory
                    };

                    var product = {
                        info: productInfo,
                        productCategory: productCategory
                    };

                    var dvcs = productInfo.devices;
                    var yrs = parseInt(variation.variation.years);

                    if ('undefined' !== typeof StoreProducts.product[product_id]) {
                        var StorePrd = StoreProducts.product[product_id];

                        if(typeof StorePrd.variations[dvcs][yrs].discount === 'undefined'){
                            product.info.discountValue = 0;
                            product.info.priceWithTax = StorePrd.variations[dvcs][yrs].price;
                            product.info.discountRate = 0;
                        }else{
                            product.info.discountValue = StorePrd.variations[dvcs][yrs].price - StorePrd.variations[dvcs][yrs].discount.discounted_price;
                            product.info.priceWithTax = StoreProducts.price_format(StorePrd.variations[dvcs][yrs].discount.discounted_price,2);
                            var discount_var = ((StorePrd.variations[dvcs][yrs].price - StorePrd.variations[dvcs][yrs].discount.discounted_price) / productInfo.basePrice) * 100;
                            product.info.discountValue = StoreProducts.price_format(product.info.discountValue.toString(),2);
                            product.info.discountRate = parseInt(discount_var, 10).toString();
                        }


                    }

                    digitalData.page.category.secondary = "product";

                    digitalData.product.push(product);

                    if(window.adobeDataLayer && typeof addDigitalDataProduct != 'undefined'){
                        addDigitalDataProduct(digitalData.product);
                    }

                    if (typeof _satellite !== "undefined" && typeof _satellite.pageBottomFired !== "undefined" && _satellite.pageBottomFired) {
                        digitalData.page.attributes.delayed = "true";

                        //_satellite.notify("DLPPReady", 1); //WWW-7220
                        if(satellite_track_once){ //WWW-7220

                            _satellite.track("DLPPReady");
                            satellite_track_once = 0;
                        }
                    } else {
                        digitalData.page.attributes.delayed = "false";
                    }
                }
            }
        } else {
            var productTemp = {
                "product_id": product_id,
                "variation": variation
            };

            all_page_products.push(productTemp);
        }
    } catch (err) {
        console.log(err);
    }
};



StoreProducts.price_format = function (number, decimals) {

    decimals = decimals || 0;
    number = parseFloat(number);
    decPoint = '.';
    thousandsSep = '';


    var roundedNumber = Math.round( Math.abs( number ) * ('1e' + decimals) ) + '';
    var numbersString = decimals ? roundedNumber.slice(0, decimals * -1) : roundedNumber;
    var decimalsString = decimals ? roundedNumber.slice(decimals * -1) : '';
    var formattedNumber = "";

    while(numbersString.length > 3){
        formattedNumber += thousandsSep + numbersString.slice(-3)
        numbersString = numbersString.slice(0,-3);
    }

    return (number < 0 ? '-' : '') + numbersString + formattedNumber + (decimalsString ? (decPoint + decimalsString) : '');

};

StoreProducts.filterBuyLink = function (config, buyLink) {
    try {
        if (
          typeof config !== 'undefined'
          && typeof config['ignore_promotions'] !== 'undefined'
          && config['ignore_promotions'] == true
        ) {
            if (buyLink.slice(-1) !== '/')
                buyLink = buyLink + '/';

            buyLink = buyLink + 'spid.1/';
        }
    } catch (ex) {
        // console.log(ex);
    }

    /* aici este setat A/B testul cu shopping cartul */
    if ('undefined' !== typeof ttMETA) {
        for (var i in ttMETA) {
            if (ttMETA[i].campaign === 'COM - Classic Line (New Cart BUY Links v6)') {
                if (ttMETA[i].experience.indexOf('v6 New Cart (Variation 1)') !== -1) {
                    buyLink = buyLink + (buyLink.split('?')[1] ? '&' : '?') + 'ORDERSTYLE=nLWs5JSpkHE=&SHORT_FORM=1';
                }
            }
        }
    }


    return buyLink;
};

StoreProducts.appendVisitorID = function (buyLink) {
    if (typeof Visitor !== 'undefined') {
        var visitor = Visitor.getInstance("0E920C0F53DA9E9B0A490D45@AdobeOrg", {
            trackingServer: "stats.bitdefender.com",  //Same as s.trackingServer
            trackingServerSecure: "sstats.bitdefender.com"  //Same as s.trackingServerSecure
        });
    }

    if (typeof visitor === "object") {
        buyLink = visitor.appendVisitorIDsTo(buyLink);
    }

    return buyLink;
};

StoreProducts.getFirstBrowserLanguage = function () {
    var nav = window.navigator,
      browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
      i,
      language;

    // support for HTML 5.1 "navigator.languages"
    if (Array.isArray(nav.languages)) {
        for (i = 0; i < nav.languages.length; i++) {
            language = nav.languages[i];
            if (language && language.length) {
                return language;
            }
        }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
        language = nav[browserLanguagePropertyKeys[i]];
        if (language && language.length) {
            return language;
        }
    }

    return "en";
};

Base64 = {

    // private property
    "_keyStr" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    "encode" : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

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

            output = output +
              this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
              this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    "decode" : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    "_utf8_encode" : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    "_utf8_decode" : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }};

StoreProducts.filterProductIDExceptions = function (product_id) {
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
    //console.log('filterProductIDExceptions: ' + product_id);
    return product_id;
};

var JSON;if(!JSON){JSON={};}(function(){function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){if(typeof rep[c]==="string"){d=rep[c];e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.prototype.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function f(a){return a<10?"0"+a:a}"use strict";if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else if(typeof c==="string"){indent=c}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.prototype.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})();