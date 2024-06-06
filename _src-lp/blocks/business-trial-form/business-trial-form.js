import { GLOBAL_EVENTS } from '../../scripts/utils.js';

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function selectPrefixByCountry(countryCode) {
  const prefixSelector = document.querySelector('.prefix');
  const prefixValueSelector = document.querySelector('.prefix-value');
  const hiddenCountry = document.querySelector('.hidden-country');
  const stateBox = document.querySelector('.state-box');
  // eslint-disable-next-line no-restricted-syntax
  for (const option of prefixSelector.options) {
    if (option.getAttribute('data-country') === countryCode) {
      option.selected = true;
      prefixValueSelector.innerHTML = option.value;
      hiddenCountry.value = countryCode;
      if (countryCode === 'US') {
        stateBox.style.display = 'block';
      } else {
        stateBox.style.display = 'none';
      }
      break;
    }
  }
}

export default function decorate(block) {
  const metaData = block.closest('.section').dataset;
  const {
    firstName, lastName, businessEmail, companyName, numberEmployees, country,
    phoneNumber, buttonText,
  } = metaData;
  const formRow = block.querySelector('.business-trial-form.block > div:nth-child(3)');
  const agreeRow = block.querySelector('.business-trial-form.block > div:nth-child(4)');

  const formBox = document.createElement('div');
  formBox.innerHTML = `
  <form name="form1" class="free-trial-form" role="form" data-endpoint-url="" novalidate="" __bizdiag="378994890" __biza="WJ__">
  <input type="hidden" name="nfo[enableShortForm]" value="true">
  <input type="hidden" name="nfo[contact_role_no_exist]" value="">
  <input type="hidden" name="do[submit]" value="">
  <div class="row-wrap select-box" bis_skin_checked="1">
    <input type="hidden" name="nfo[product_id]" value="3150" class="free-trial-form-id">
  </div>
  <div class="row-wrap" bis_skin_checked="1">
    <input class="first_name" name="nfo[first_name]" type="text" id="firstName">
    <label for="firstName">${firstName}*</label>
  </div>
  <div class="row-wrap" bis_skin_checked="1">
    <input class="last_name" name="nfo[last_name]" type="text" id="lastName">
    <label for="lastName">${lastName}*</label>
  </div>
  <div class="row-wrap" bis_skin_checked="1">
    <input class="work_email" name="nfo[email]" type="email" id="email">
    <label for="email">${businessEmail}*</label>
  </div>
  <div class="row-wrap" bis_skin_checked="1">
    <input class="company_name" name="nfo[company]" type="text" id="companyName">
    <label for="companyName">${companyName}*</label>
  </div>

  <div class="row-wrap select-box" bis_skin_checked="1">
    <label for="employees">${numberEmployees}*</label>
    <select name="nfo[employees]" id="employees" class="no_of_employee">
      <option value=""></option>
      <option value="1-24">1-24</option>
      <option value="25-99">25-99</option>
    </select>
  </div>
  <div class="row-wrap select-box" bis_skin_checked="1">
    <label>${country}*</label>
  <select id="country" class="country">
  <option value="AF">Afghanistan</option>
  <option value="AX">Åland Islands</option>
  <option value="AL">Albania</option>
  <option value="DZ">Algeria</option>
  <option value="AS">American Samoa</option>
  <option value="AD">Andorra</option>
  <option value="AO">Angola</option>
  <option value="AI">Anguilla</option>
  <option value="AQ">Antarctica</option>
  <option value="AG">Antigua and Barbuda</option>
  <option value="AR">Argentina</option>
  <option value="AM">Armenia</option>
  <option value="AW">Aruba</option>
  <option value="AU">Australia</option>
  <option value="AT">Austria</option>
  <option value="AZ">Azerbaijan</option>
  <option value="BS">Bahamas</option>
  <option value="BH">Bahrain</option>
  <option value="BD">Bangladesh</option>
  <option value="BB">Barbados</option>
  <option value="BE">Belgium</option>
  <option value="BZ">Belize</option>
  <option value="BJ">Benin</option>
  <option value="BM">Bermuda</option>
  <option value="BT">Bhutan</option>
  <option value="BO">Bolivia, Plurinational State of</option>
  <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
  <option value="BA">Bosnia and Herzegovina</option>
  <option value="BW">Botswana</option>
  <option value="BV">Bouvet Island</option>
  <option value="BR">Brazil</option>
  <option value="IO">British Indian Ocean Territory</option>
  <option value="BN">Brunei Darussalam</option>
  <option value="BG">Bulgaria</option>
  <option value="BF">Burkina Faso</option>
  <option value="BI">Burundi</option>
  <option value="KH">Cambodia</option>
  <option value="CM">Cameroon</option>
  <option value="CA">Canada</option>
  <option value="CV">Cape Verde</option>
  <option value="KY">Cayman Islands</option>
  <option value="CF">Central African Republic</option>
  <option value="TD">Chad</option>
  <option value="CL">Chile</option>
  <option value="CN">China</option>
  <option value="CX">Christmas Island</option>
  <option value="CC">Cocos (Keeling) Islands</option>
  <option value="CO">Colombia</option>
  <option value="KM">Comoros</option>
  <option value="CG">Congo</option>
  <option value="CD">Congo, the Democratic Republic of the</option>
  <option value="CK">Cook Islands</option>
  <option value="CR">Costa Rica</option>
  <option value="CI">Côte d'Ivoire</option>
  <option value="HR">Croatia</option>
  <option value="CW">Curaçao</option>
  <option value="CY">Cyprus</option>
  <option value="CZ">Czech Republic</option>
  <option value="DK">Denmark</option>
  <option value="DJ">Djibouti</option>
  <option value="DM">Dominica</option>
  <option value="DO">Dominican Republic</option>
  <option value="EC">Ecuador</option>
  <option value="EG">Egypt</option>
  <option value="SV">El Salvador</option>
  <option value="GQ">Equatorial Guinea</option>
  <option value="ER">Eritrea</option>
  <option value="EE">Estonia</option>
  <option value="ET">Ethiopia</option>
  <option value="FK">Falkland Islands (Malvinas)</option>
  <option value="FO">Faroe Islands</option>
  <option value="FJ">Fiji</option>
  <option value="FI">Finland</option>
  <option value="FR">France</option>
  <option value="GF">French Guiana</option>
  <option value="PF">French Polynesia</option>
  <option value="TF">French Southern Territories</option>
  <option value="GA">Gabon</option>
  <option value="GM">Gambia</option>
  <option value="GE">Georgia</option>
  <option value="DE">Germany</option>
  <option value="GH">Ghana</option>
  <option value="GI">Gibraltar</option>
  <option value="GR">Greece</option>
  <option value="GL">Greenland</option>
  <option value="GD">Grenada</option>
  <option value="GP">Guadeloupe</option>
  <option value="GU">Guam</option>
  <option value="GT">Guatemala</option>
  <option value="GG">Guernsey</option>
  <option value="GN">Guinea</option>
  <option value="GW">Guinea-Bissau</option>
  <option value="GY">Guyana</option>
  <option value="HT">Haiti</option>
  <option value="HM">Heard Island and McDonald Islands</option>
  <option value="VA">Holy See (Vatican City State)</option>
  <option value="HN">Honduras</option>
  <option value="HK">Hong Kong</option>
  <option value="HU">Hungary</option>
  <option value="IS">Iceland</option>
  <option value="IN">India</option>
  <option value="ID">Indonesia</option>
  <option value="IQ">Iraq</option>
  <option value="IE">Ireland</option>
  <option value="IM">Isle of Man</option>
  <option value="IL">Israel</option>
  <option value="IT">Italy</option>
  <option value="JM">Jamaica</option>
  <option value="JP">Japan</option>
  <option value="JE">Jersey</option>
  <option value="JO">Jordan</option>
  <option value="KZ">Kazakhstan</option>
  <option value="KE">Kenya</option>
  <option value="KI">Kiribati</option>
  <option value="KR">Korea, Republic of</option>
  <option value="KW">Kuwait</option>
  <option value="KG">Kyrgyzstan</option>
  <option value="LA">Lao People's Democratic Republic</option>
  <option value="LV">Latvia</option>
  <option value="LB">Lebanon</option>
  <option value="LS">Lesotho</option>
  <option value="LR">Liberia</option>
  <option value="LY">Libya</option>
  <option value="LI">Liechtenstein</option>
  <option value="LT">Lithuania</option>
  <option value="LU">Luxembourg</option>
  <option value="MO">Macao</option>
  <option value="MK">Macedonia, the former Yugoslav Republic of</option>
  <option value="MG">Madagascar</option>
  <option value="MW">Malawi</option>
  <option value="MY">Malaysia</option>
  <option value="MV">Maldives</option>
  <option value="ML">Mali</option>
  <option value="MT">Malta</option>
  <option value="MH">Marshall Islands</option>
  <option value="MQ">Martinique</option>
  <option value="MR">Mauritania</option>
  <option value="MU">Mauritius</option>
  <option value="YT">Mayotte</option>
  <option value="MX">Mexico</option>
  <option value="FM">Micronesia, Federated States of</option>
  <option value="MD">Moldova, Republic of</option>
  <option value="MC">Monaco</option>
  <option value="MN">Mongolia</option>
  <option value="ME">Montenegro</option>
  <option value="MS">Montserrat</option>
  <option value="MA">Morocco</option>
  <option value="MZ">Mozambique</option>
  <option value="MM">Myanmar</option>
  <option value="NA">Namibia</option>
  <option value="NR">Nauru</option>
  <option value="NP">Nepal</option>
  <option value="NL">Netherlands</option>
  <option value="NC">New Caledonia</option>
  <option value="NZ">New Zealand</option>
  <option value="NI">Nicaragua</option>
  <option value="NE">Niger</option>
  <option value="NG">Nigeria</option>
  <option value="NU">Niue</option>
  <option value="NF">Norfolk Island</option>
  <option value="MP">Northern Mariana Islands</option>
  <option value="NO">Norway</option>
  <option value="OM">Oman</option>
  <option value="PK">Pakistan</option>
  <option value="PW">Palau</option>
  <option value="PS">Palestinian Territory, Occupied</option>
  <option value="PA">Panama</option>
  <option value="PG">Papua New Guinea</option>
  <option value="PY">Paraguay</option>
  <option value="PE">Peru</option>
  <option value="PH">Philippines</option>
  <option value="PN">Pitcairn</option>
  <option value="PL">Poland</option>
  <option value="PT">Portugal</option>
  <option value="PR">Puerto Rico</option>
  <option value="QA">Qatar</option>
  <option value="RE">Réunion</option>
  <option value="RO" selected="selected">Romania</option>
  <option value="RW">Rwanda</option>
  <option value="BL">Saint Barthélemy</option>
  <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
  <option value="KN">Saint Kitts and Nevis</option>
  <option value="LC">Saint Lucia</option>
  <option value="MF">Saint Martin (French part)</option>
  <option value="PM">Saint Pierre and Miquelon</option>
  <option value="VC">Saint Vincent and the Grenadines</option>
  <option value="WS">Samoa</option>
  <option value="SM">San Marino</option>
  <option value="ST">Sao Tome and Principe</option>
  <option value="SA">Saudi Arabia</option>
  <option value="SN">Senegal</option>
  <option value="RS">Serbia</option>
  <option value="SC">Seychelles</option>
  <option value="SL">Sierra Leone</option>
  <option value="SG">Singapore</option>
  <option value="SX">Sint Maarten (Dutch part)</option>
  <option value="SK">Slovakia</option>
  <option value="SI">Slovenia</option>
  <option value="SB">Solomon Islands</option>
  <option value="SO">Somalia</option>
  <option value="ZA">South Africa</option>
  <option value="GS">South Georgia and the South Sandwich Islands</option>
  <option value="SS">South Sudan</option>
  <option value="ES">Spain</option>
  <option value="LK">Sri Lanka</option>
  <option value="SD">Sudan</option>
  <option value="SR">Suriname</option>
  <option value="SJ">Svalbard and Jan Mayen</option>
  <option value="SZ">Swaziland</option>
  <option value="SE">Sweden</option>
  <option value="CH">Switzerland</option>
  <option value="TW">Taiwan, Province of China</option>
  <option value="TJ">Tajikistan</option>
  <option value="TZ">Tanzania, United Republic of</option>
  <option value="TH">Thailand</option>
  <option value="TL">Timor-Leste</option>
  <option value="TG">Togo</option>
  <option value="TK">Tokelau</option>
  <option value="TO">Tonga</option>
  <option value="TT">Trinidad and Tobago</option>
  <option value="TN">Tunisia</option>
  <option value="TR">Turkey</option>
  <option value="TM">Turkmenistan</option>
  <option value="TC">Turks and Caicos Islands</option>
  <option value="TV">Tuvalu</option>
  <option value="UG">Uganda</option>
  <option value="UA">Ukraine</option>
  <option value="AE">United Arab Emirates</option>
  <option value="GB">United Kingdom</option>
  <option value="US">United States</option>
  <option value="UM">United States Minor Outlying Islands</option>
  <option value="UY">Uruguay</option>
  <option value="UZ">Uzbekistan</option>
  <option value="VU">Vanuatu</option>
  <option value="VE">Venezuela, Bolivarian Republic of</option>
  <option value="VN">Viet Nam</option>
  <option value="VG">Virgin Islands, British</option>
  <option value="VI">Virgin Islands, U.S.</option>
  <option value="WF">Wallis and Futuna</option>
  <option value="EH">Western Sahara</option>
  <option value="YE">Yemen</option>
  <option value="ZM">Zambia</option>
  <option value="ZW">Zimbabwe</option>
</select>
</div>

<div class="row-wrap tw-hidden select-box state-box" bis_skin_checked="1">
<label id="state-label">State*</label>
<select id="state" class="state-us" name="nfo[state]">
    <option value=""></option>
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <option value="AZ">Arizona</option>
    <option value="AR">Arkansas</option>
    <option value="CA">California</option>
    <option value="CO">Colorado</option>
    <option value="CT">Connecticut</option>
    <option value="DE">Delaware</option>
    <option value="DC">District Of Columbia</option>
    <option value="FL">Florida</option>
    <option value="GA">Georgia</option>
    <option value="HI">Hawaii</option>
    <option value="ID">Idaho</option>
    <option value="IL">Illinois</option>
    <option value="IN">Indiana</option>
    <option value="IA">Iowa</option>
    <option value="KS">Kansas</option>
    <option value="KY">Kentucky</option>
    <option value="LA">Louisiana</option>
    <option value="ME">Maine</option>
    <option value="MD">Maryland</option>
    <option value="MA">Massachusetts</option>
    <option value="MI">Michigan</option>
    <option value="MN">Minnesota</option>
    <option value="MS">Mississippi</option>
    <option value="MO">Missouri</option>
    <option value="MT">Montana</option>
    <option value="NE">Nebraska</option>
    <option value="NV">Nevada</option>
    <option value="NH">New Hampshire</option>
    <option value="NJ">New Jersey</option>
    <option value="NM">New Mexico</option>
    <option value="NY">New York</option>
    <option value="NC">North Carolina</option>
    <option value="ND">North Dakota</option>
    <option value="OH">Ohio</option>
    <option value="OK">Oklahoma</option>
    <option value="OR">Oregon</option>
    <option value="PA">Pennsylvania</option>
    <option value="RI">Rhode Island</option>
    <option value="SC">South Carolina</option>
    <option value="SD">South Dakota</option>
    <option value="TN">Tennessee</option>
    <option value="TX">Texas</option>
    <option value="UT">Utah</option>
    <option value="VT">Vermont</option>
    <option value="VA">Virginia</option>
    <option value="WA">Washington</option>
    <option value="WV">West Virginia</option>
    <option value="WI">Wisconsin</option>
    <option value="WY">Wyoming</option>
</select>

              </div>

<input type="hidden" class="hidden-country" name="nfo[country_id]">
  </div>
  
  <div class="row-wrap" bis_skin_checked="1">
    <select id="prefix" class="prefix tw-absolute !tw-w-[80px] tw-opacity-0">
<option data-country="AF" value="+93">Afghanistan +93</option>
<option data-country="AX" value="+358">Åland Islands +358</option>
<option data-country="AL" value="+355">Albania +355</option>
<option data-country="DZ" value="+213">Algeria +213</option>
<option data-country="AS" value="+1">American Samoa +1</option>
<option data-country="AD" value="+376">Andorra +376</option>
<option data-country="AO" value="+244">Angola +244</option>
<option data-country="AI" value="+1">Anguilla +1</option>
<option data-country="AQ" value="+672">Antarctica +672</option>
<option data-country="AG" value="+1">Antigua and Barbuda +1</option>
<option data-country="AR" value="+54">Argentina +54</option>
<option data-country="AM" value="+374">Armenia +374</option>
<option data-country="AW" value="+297">Aruba +297</option>
<option data-country="AU" value="+61">Australia +61</option>
<option data-country="AT" value="+43">Austria +43</option>
<option data-country="AZ" value="+994">Azerbaijan +994</option>
<option data-country="BS" value="+1">Bahamas +1</option>
<option data-country="BH" value="+973">Bahrain +973</option>
<option data-country="BD" value="+880">Bangladesh +880</option>
<option data-country="BB" value="+1">Barbados +1</option>
<option data-country="BE" value="+32">Belgium +32</option>
<option data-country="BZ" value="+501">Belize +501</option>
<option data-country="BJ" value="+229">Benin +229</option>
<option data-country="BM" value="+1">Bermuda +1</option>
<option data-country="BT" value="+975">Bhutan +975</option>
<option data-country="BO" value="+591">Bolivia +591</option>
<option data-country="BQ" value="+599">Bonaire +599</option>
<option data-country="BA" value="+387">Bosnia and Herzegovina +387</option>
<option data-country="BW" value="+267">Botswana +267</option>
<option data-country="BV" value="+47">Bouvet Island +47</option>
<option data-country="BR" value="+55">Brazil +55</option>
<option data-country="IO" value="+246">British Indian Ocean Territory +246</option>
<option data-country="BN" value="+673">Brunei Darussalam +673</option>
<option data-country="BG" value="+359">Bulgaria +359</option>
<option data-country="BF" value="+226">Burkina Faso +226</option>
<option data-country="BI" value="+257">Burundi +257</option>
<option data-country="KH" value="+855">Cambodia +855</option>
<option data-country="CM" value="+237">Cameroon +237</option>
<option data-country="CA" value="+1">Canada +1</option>
<option data-country="CV" value="+238">Cape Verde +238</option>
<option data-country="KY" value="+1">Cayman Islands +1</option>
<option data-country="CF" value="+236">Central African Republic +236</option>
<option data-country="TD" value="+235">Chad +235</option>
<option data-country="CL" value="+56">Chile +56</option>
<option data-country="CN" value="+86">China +86</option>
<option data-country="CX" value="+61">Christmas Island +61</option>
<option data-country="CC" value="+61">Cocos (Keeling) Islands +61</option>
<option data-country="CO" value="+57">Colombia +57</option>
<option data-country="KM" value="+269">Comoros +269</option>
<option data-country="CG" value="+242">Congo +242</option>
<option data-country="CD" value="+243">Congo, the Democratic Republic of the +243</option>
<option data-country="CK" value="+682">Cook Islands +682</option>
<option data-country="CR" value="+506">Costa Rica +506</option>
<option data-country="CI" value="+225">Ivory Coast +225</option>
<option data-country="HR" value="+385">Croatia +385</option>
<option data-country="CW" value="+599">Curaçao +599</option>
<option data-country="CY" value="+357">Cyprus +357</option>
<option data-country="CZ" value="+420">Czech Republic +420</option>
<option data-country="DK" value="+45">Denmark +45</option>
<option data-country="DJ" value="+253">Djibouti +253</option>
<option data-country="DM" value="+1">Dominica +1</option>
<option data-country="DO" value="+1">Dominican Republic +1</option>
<option data-country="EC" value="+593">Ecuador +593</option>
<option data-country="EG" value="+20">Egypt +20</option>
<option data-country="SV" value="+503">El Salvador +503</option>
<option data-country="GQ" value="+240">Equatorial Guinea +240</option>
<option data-country="ER" value="+291">Eritrea +291</option>
<option data-country="EE" value="+372">Estonia +372</option>
<option data-country="ET" value="+251">Ethiopia +251</option>
<option data-country="FK" value="+500">Falkland Islands +500</option>
<option data-country="FO" value="+298">Faroe Islands +298</option>
<option data-country="FJ" value="+679">Fiji +679</option>
<option data-country="FI" value="+358">Finland +358</option>
<option data-country="FR" value="+33">France +33</option>
<option data-country="GF" value="+594">French Guiana +594</option>
<option data-country="PF" value="+689">French Polynesia +689</option>
<option data-country="TF" value="+262">French Southern Territories +262</option>
<option data-country="GA" value="+241">Gabon +241</option>
<option data-country="GM" value="+220">Gambia +220</option>
<option data-country="GE" value="+995">Georgia +995</option>
<option data-country="DE" value="+49">Germany +49</option>
<option data-country="GH" value="+233">Ghana +233</option>
<option data-country="GI" value="+350">Gibraltar +350</option>
<option data-country="GR" value="+30">Greece +30</option>
<option data-country="GL" value="+299">Greenland +299</option>
<option data-country="GD" value="+1">Grenada +1</option>
<option data-country="GP" value="+590">Guadeloupe +590</option>
<option data-country="GU" value="+1">Guam +1</option>
<option data-country="GT" value="+502">Guatemala +502</option>
<option data-country="GG" value="+44">Guernsey +44</option>
<option data-country="GN" value="+224">Guinea +224</option>
<option data-country="GW" value="+245">Guinea-Bissau +245</option>
<option data-country="GY" value="+592">Guyana +592</option>
<option data-country="HT" value="+509">Haiti +509</option>
<option data-country="HM" value="+672">Heard Island and McDonald Islands +672</option>
<option data-country="VA" value="+39">Holy See (Vatican City State) +39</option>
<option data-country="HN" value="+504">Honduras +504</option>
<option data-country="HK" value="+852">Hong Kong +852</option>
<option data-country="HU" value="+36">Hungary +36</option>
<option data-country="IS" value="+354">Iceland +354</option>
<option data-country="IN" value="+91">India +91</option>
<option data-country="ID" value="+62">Indonesia +62</option>
<option data-country="IQ" value="+964">Iraq +964</option>
<option data-country="IE" value="+353">Ireland +353</option>
<option data-country="IM" value="+44">Isle of Man +44</option>
<option data-country="IL" value="+972">Israel +972</option>
<option data-country="IT" value="+39">Italy +39</option>
<option data-country="JM" value="+1">Jamaica +1</option>
<option data-country="JP" value="+81">Japan +81</option>
<option data-country="JE" value="+44">Jersey +44</option>
<option data-country="JO" value="+962">Jordan +962</option>
<option data-country="KZ" value="+7">Kazakhstan +7</option>
<option data-country="KE" value="+254">Kenya +254</option>
<option data-country="KI" value="+686">Kiribati +686</option>
<option data-country="KR" value="+82">Korea, Republic of +82</option>
<option data-country="KW" value="+965">Kuwait +965</option>
<option data-country="KG" value="+996">Kyrgyzstan +996</option>
<option data-country="LA" value="+856">Lao People's Democratic Republic +856</option>
<option data-country="LV" value="+371">Latvia +371</option>
<option data-country="LB" value="+961">Lebanon +961</option>
<option data-country="LS" value="+266">Lesotho +266</option>
<option data-country="LR" value="+231">Liberia +231</option>
<option data-country="LY" value="+218">Libya +218</option>
<option data-country="LI" value="+423">Liechtenstein +423</option>
<option data-country="LT" value="+370">Lithuania +370</option>
<option data-country="LU" value="+352">Luxembourg +352</option>
<option data-country="MO" value="+853">Macau +853</option>
<option data-country="MK" value="+389">Macedonia +389</option>
<option data-country="MG" value="+261">Madagascar +261</option>
<option data-country="MW" value="+265">Malawi +265</option>
<option data-country="MY" value="+60">Malaysia +60</option>
<option data-country="MV" value="+960">Maldives +960</option>
<option data-country="ML" value="+223">Mali +223</option>
<option data-country="MT" value="+356">Malta +356</option>
<option data-country="MH" value="+692">Marshall Islands +692</option>
<option data-country="MQ" value="+596">Martinique +596</option>
<option data-country="MR" value="+222">Mauritania +222</option>
<option data-country="MU" value="+230">Mauritius +230</option>
<option data-country="YT" value="+262">Mayotte +262</option>
<option data-country="MX" value="+52">Mexico +52</option>
<option data-country="FM" value="+691">Micronesia, Federated States of +691</option>
<option data-country="MD" value="+373">Moldova +373</option>
<option data-country="MC" value="+377">Monaco +377</option>
<option data-country="MN" value="+976">Mongolia +976</option>
<option data-country="ME" value="+382">Montenegro +382</option>
<option data-country="MS" value="+1">Montserrat +1</option>
<option data-country="MA" value="+212">Morocco +212</option>
<option data-country="MZ" value="+258">Mozambique +258</option>
<option data-country="MM" value="+95">Myanmar +95</option>
<option data-country="NA" value="+264">Namibia +264</option>
<option data-country="NR" value="+674">Nauru +674</option>
<option data-country="NP" value="+977">Nepal +977</option>
<option data-country="NL" value="+31">Netherlands +31</option>
<option data-country="NC" value="+687">New Caledonia +687</option>
<option data-country="NZ" value="+64">New Zealand +64</option>
<option data-country="NI" value="+505">Nicaragua +505</option>
<option data-country="NE" value="+227">Niger +227</option>
<option data-country="NG" value="+234">Nigeria +234</option>
<option data-country="NU" value="+683">Niue +683</option>
<option data-country="NF" value="+672">Norfolk Island +672</option>
<option data-country="MP" value="+1">Northern Mariana Islands +1</option>
<option data-country="NO" value="+47">Norway +47</option>
<option data-country="OM" value="+968">Oman +968</option>
<option data-country="PK" value="+92">Pakistan +92</option>
<option data-country="PW" value="+680">Palau +680</option>
<option data-country="PS" value="+970">Palestinian Territory, Occupied +970</option>
<option data-country="PA" value="+507">Panama +507</option>
<option data-country="PG" value="+675">Papua New Guinea +675</option>
<option data-country="PY" value="+595">Paraguay +595</option>
<option data-country="PE" value="+51">Peru +51</option>
<option data-country="PH" value="+63">Philippines +63</option>
<option data-country="PN" value="+64">Pitcairn Islands +64</option>
<option data-country="PL" value="+48">Poland +48</option>
<option data-country="PT" value="+351">Portugal +351</option>
<option data-country="PR" value="+1">Puerto Rico +1</option>
<option data-country="QA" value="+974">Qatar +974</option>
<option data-country="RE" value="+262">Réunion +262</option>
<option data-country="RO" value="+40" selected="selected">Romania +40</option>
<option data-country="RW" value="+250">Rwanda +250</option>
<option data-country="BL" value="+590">Saint Barthélemy +590</option>
<option data-country="SH" value="+290">Saint Helena +290</option>
<option data-country="KN" value="+1">Saint Kitts and Nevis +1</option>
<option data-country="LC" value="+1">Saint Lucia +1</option>
<option data-country="MF" value="+590">Saint Martin (France) +590</option>
<option data-country="PM" value="+508">Saint Pierre and Miquelon +508</option>
<option data-country="VC" value="+1">Saint Vincent and the Grenadines +1</option>
<option data-country="WS" value="+685">Samoa +685</option>
<option data-country="SM" value="+378">San Marino +378</option>
<option data-country="ST" value="+239">São Tomé and Príncipe +239</option>
<option data-country="SA" value="+966">Saudi Arabia +966</option>
<option data-country="SN" value="+221">Senegal +221</option>
<option data-country="RS" value="+381">Serbia +381</option>
<option data-country="SC" value="+248">Seychelles +248</option>
<option data-country="SL" value="+232">Sierra Leone +232</option>
<option data-country="SG" value="+65">Singapore +65</option>
<option data-country="SX" value="+1">Sint Maarten (Netherlands) +1</option>
<option data-country="SK" value="+421">Slovakia +421</option>
<option data-country="SI" value="+386">Slovenia +386</option>
<option data-country="SB" value="+677">Solomon Islands +677</option>
<option data-country="SO" value="+252">Somalia +252</option>
<option data-country="ZA" value="+27">South Africa +27</option>
<option data-country="GS" value="+500">South Georgia and the South Sandwich Islands +500</option>
<option data-country="SS" value="+211">South Sudan +211</option>
<option data-country="ES" value="+34">Spain +34</option>
<option data-country="LK" value="+94">Sri Lanka +94</option>
<option data-country="SD" value="+249">Sudan +249</option>
<option data-country="SR" value="+597">Suriname +597</option>
<option data-country="SJ" value="+47">Svalbard +47</option>
<option data-country="SZ" value="+268">Swaziland +268</option>
<option data-country="SE" value="+46">Sweden +46</option>
<option data-country="CH" value="+41">Switzerland +41</option>
<option data-country="TW" value="+886">Taiwan, Province of China +886</option>
<option data-country="TJ" value="+992">Tajikistan +992</option>
<option data-country="TZ" value="+255">Tanzania +255</option>
<option data-country="TH" value="+66">Thailand +66</option>
<option data-country="TL" value="+670">Timor-Leste +670</option>
<option data-country="TG" value="+228">Togo +228</option>
<option data-country="TK" value="+690">Tokelau +690</option>
<option data-country="TO" value="+676">Tonga +676</option>
<option data-country="TT" value="+1">Trinidad and Tobago +1</option>
<option data-country="TN" value="+216">Tunisia +216</option>
<option data-country="TR" value="+90">Turkey +90</option>
<option data-country="TM" value="+993">Turkmenistan +993</option>
<option data-country="TC" value="+1">Turks and Caicos Islands +1</option>
<option data-country="TV" value="+688">Tuvalu +688</option>
<option data-country="UG" value="+256">Uganda +256</option>
<option data-country="UA" value="+380">Ukraine +380</option>
<option data-country="AE" value="+971">United Arab Emirates +971</option>
<option data-country="GB" value="+44">United Kingdom +44</option>
<option data-country="US" value="+1">United States +1</option>
<option data-country="UM" value="+1">United States Minor Outlying Islands +1</option>
<option data-country="UY" value="+598">Uruguay +598</option>
<option data-country="UZ" value="+998">Uzbekistan +998</option>
<option data-country="VU" value="+678">Vanuatu +678</option>
<option data-country="VE" value="+58">Venezuela +58</option>
<option data-country="VN" value="+84">Vietnam +84</option>
<option data-country="VG" value="+1">Virgin Islands, British +1</option>
<option data-country="VI" value="+1">Virgin Islands, U.S. +1</option>
<option data-country="WF" value="+681">Wallis and Futuna +681</option>
<option data-country="EH" value="+212">Western Sahara +212</option>
<option data-country="YE" value="+967">Yemen +967</option>
<option data-country="ZM" value="+260">Zambia +260</option>
<option data-country="ZW" value="+263">Zimbabwe +263</option>
</select>

    <div class="prefix-value tw-absolute tw-w-[54px] tw-top-[15px] tw-ml-[9px] tw-pl-[6px] tw-pointer-events-none" bis_skin_checked="1">+40</div>
    <input type="tel" class="phone !tw-pl-[80px]" name="nfo[phone]" id="phone" maxlength="13">
    <label for="phone" class="phone-label">${phoneNumber}*</label>
  </div>
  

  <script class="grecaptcha-v3" src="https://www.google.com/recaptcha/api.js?render=explicit&amp;onload=onRecaptchaLoadCallback" defer=""></script>
  <script>
  window.onRecaptchaLoadCallback = function () {
  window.clientId = grecaptcha.render('inline-badge', {
  'sitekey': "6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR",
  'badge': 'inline',
  'size': 'invisible'
  });
  }
  </script>
  <div id="inline-badge" class="tw-inline-block" bis_skin_checked="1"><div class="grecaptcha-badge" data-style="inline" bis_skin_checked="1" style="width: 256px; height: 60px; box-shadow: gray 0px 0px 5px;"><div class="grecaptcha-logo" bis_skin_checked="1"><iframe title="reCAPTCHA" width="256" height="60" role="presentation" name="a-7lxks96764va" frameborder="0" scrolling="no" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LcEH5onAAAAAH4800Uc6IYdUvmqPLHFGi_nOGeR&amp;co=aHR0cHM6Ly93d3cuYml0ZGVmZW5kZXIuY29tOjQ0Mw..&amp;hl=en&amp;v=8k85QBI-qzxmenDv318AZH30&amp;size=invisible&amp;badge=inline&amp;cb=leqamhuuyxk6" bis_size="{&quot;x&quot;:1209,&quot;y&quot;:1017,&quot;w&quot;:256,&quot;h&quot;:60,&quot;abs_x&quot;:1209,&quot;abs_y&quot;:1017}"></iframe></div><div class="grecaptcha-error" bis_skin_checked="1"></div><textarea id="g-recaptcha-response" name="g-recaptcha-response" class="g-recaptcha-response" style="width: 250px; height: 40px; border: 1px solid rgb(193, 193, 193); margin: 10px 25px; padding: 0px; resize: none; display: none;"></textarea></div><iframe style="display: none;"></iframe></div>
    <div class="row-wrap checkbox" bis_skin_checked="1">
      <input type="checkbox" id="checked-terms" aria-labelledby="checked-terms-label" value="1">
      <label id="checked-terms-label" for="checked-terms">${agreeRow.innerHTML}
  </label>
  </div>
    
    <div class="row-wrap btn" bis_skin_checked="1">
      <a hidden="" class="thankYouUrl" href="/business/products/free-trials/thank-you/gravityzone-small-business-security-ft-ty.html"></a>
      <button type="submit" class="we-btn-red">
        <span>${buttonText}</span>
      </button>
    </div>

    <div class="row-wrap errorMessages btn" bis_skin_checked="1">
    </div>
  </form>
  `;

  formRow.appendChild(formBox);
  block.removeChild(agreeRow);

  const formular = block.querySelector('.free-trial-form');

  window.addEventListener(GLOBAL_EVENTS.GEOIPINFO_LOADED, (event) => {
    const countryDetect = event.detail.country;
    // const countryDetect = 'ES';
    const countrySelector = block.querySelector('.country');
    countrySelector.value = countryDetect;

    selectPrefixByCountry(countryDetect);

    countrySelector.addEventListener('change', () => {
      selectPrefixByCountry(countrySelector.value);
    });
  });

  formular.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    block.querySelector('.errorMessages').innerHTML = '';

    // Collect form data
    const firstNameValue = block.querySelector('.first_name').value.trim();
    const lastNameValue = block.querySelector('.last_name').value.trim();
    const businessEmailValue = block.querySelector('.work_email').value.trim();
    const companyNameValue = block.querySelector('.company_name').value.trim();
    const numberOfEmployeesValue = block.querySelector('.no_of_employee').value;
    const countryValue = block.querySelector('.country').value;
    // const stateValue = block.querySelector('.state-us').value;
    const phoneValue = block.querySelector('.phone').value;

    // Validate form data
    let isValid = true;
    const errorMessages = [];

    if (firstNameValue === '') {
      isValid = false;
      errorMessages.push('First Name is required.');
    }

    if (lastNameValue === '') {
      isValid = false;
      errorMessages.push('Last Name is required.');
    }

    if (businessEmailValue === '') {
      isValid = false;
      errorMessages.push('Business Email is required.');
    } else if (!validateEmail(businessEmailValue)) {
      isValid = false;
      errorMessages.push('Business Email is not valid.');
    }

    if (companyNameValue === '') {
      isValid = false;
      errorMessages.push('Company Name is required.');
    }

    if (numberOfEmployeesValue === '') {
      isValid = false;
      errorMessages.push('Number of Employees is required.');
    }

    if (countryValue === '') {
      isValid = false;
      errorMessages.push('Country is required.');
    }

    // if (state === '') {
    //     isValid = false;
    //     errorMessages.push('State is required.');
    // }

    if (phoneValue === '') {
      isValid = false;
      errorMessages.push('Phone is required.');
    }

    // Display error messages if any
    if (!isValid) {
      block.querySelector('.errorMessages').innerHTML = errorMessages.join('<br>');
      return;
    }

    // Gather form data
    const form = event.target;
    const formData = new FormData(form);

    console.log(formData);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.bitdefender.com/content/bitdefender/us/en/business/products/free-trials/gravityzone-small-business-security-free-trial/jcr:content/root/container/free_trail_form_tbd.trial.json', true);

    // Set headers if necessary
    // xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function handleReadyStateChange() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log('Form submitted successfully:', xhr.responseText);
        } else {
          console.error('Error submitting form:', xhr.status, xhr.statusText);
        }
      }
    };

    const object = {};
    formData.forEach((value, key) => {
      object[key] = value;
    });
    // var json = JSON.stringify(object);

    // Send the serialized form data
    xhr.send(formData); // If sending as FormData
    // xhr.send(json); // If sending as JSON
  });
}
