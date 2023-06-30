/* eslint-disable linebreak-style */
/* eslint-disable */

/*
  Informations: 
  - displays 3 boxes positioned in flex mode:
    1. selectors
    2. product 1
    3. product 2

  MetaData:
  - products : ex: elite/10/1, bs/10/1 (alias_name/nr_devices/nr_years)
  - selectors_name : ex: Devices, Years
  - taxes_text : ex: Taxes not included
  - discount_text : ex: OFF 
  - button_text : ex: BUY NOW 

  Samples:
  - https://www.bitdefender.com/media/html/business/RansomwareTrial/new.html
*/

import { updateProductsList, productAliases } from "../../scripts/scripts.js";

export default function decorate(block) {
    //////////////////////////////////////////////////////////////////////////
    // get data attributes set in metaData
    const parentSelector = block.closest('.section');
    const metaData = parentSelector.dataset;
    const { products, selectorsName, taxesText, discountText, buttonText } = metaData;

    const productsAsList = products.split(',');

    if (productsAsList.length) {
      //////////////////////////////////////////////////////////////////////////
      // check and add products into the final array
      productsAsList.forEach(prod => updateProductsList(prod));
      
      //////////////////////////////////////////////////////////////////////////
      // create the 2 selectors
      const labelName = selectorsName.split(',');
      // devices
      let optionsDevices = Array(101).fill().map((_, d) => {
          if (d < 5) return // starts from 5
          let selected = ''
          if (d === 10) {  // default value selected = 10
            selected = ' selected'
          }
          return `<option value="${d}" ${selected}>${d}</option>`
      });
      block.querySelector('p:nth-child(3)').innerHTML += `<div class="selectorBox"><label>${labelName[0]}</label><select id="select${labelName[0]}" data-trigger="users">${optionsDevices}</select></div>`

      // years
      let optionsYears = Array(4).fill().map((_, y) => {
          if (y < 1) return // starts from 1
          let selected = ''
          if (y === 1) {  // default value selected = 1
            selected = ' selected'
          }
          return `<option value="${y}" ${selected}>${y}</option>`
      });

      block.querySelector('p:nth-child(3)').innerHTML += `<div class="selectorBox"><label>${labelName[1].trim()}</label><select id="select${labelName[1].trim()}" data-trigger="years">${optionsYears}</select></div>`
      
 
      //////////////////////////////////////////////////////////////////////////
      // add eventListener
      if (document.querySelectorAll('.selectorBox')) {
        document.querySelectorAll('.selectorBox').forEach(item => {
          item.addEventListener("change", e => {
            const triggerType = item.children[1].getAttribute('data-trigger')
            const triggerValue = e.target.value

            if (triggerType === 'users') {
              let fileServers_1stProd = Math.ceil((Number(triggerValue)) * 0.35)
              let fileServers_2ndProd = Math.ceil((Number(triggerValue)) * 0.3)
              let mailboxes = Math.ceil((Number(triggerValue)/100) * 150)

              block.querySelector('.b-productswithselectors > div:nth-child(2) ul:last-of-type li:nth-child(1) strong').innerHTML = triggerValue
              block.querySelector('.b-productswithselectors > div:nth-child(3) ul:last-of-type li:nth-child(1) strong').innerHTML = triggerValue
              
              block.querySelector('.b-productswithselectors > div:nth-child(2) ul:last-of-type li:nth-child(2) strong').innerHTML = fileServers_1stProd
              block.querySelector('.b-productswithselectors > div:nth-child(3) ul:last-of-type li:nth-child(2) strong').innerHTML = fileServers_2ndProd

              block.querySelector('.b-productswithselectors > div:nth-child(2) ul:last-of-type li:nth-child(3) strong').innerHTML = mailboxes
            }
            
            productsAsList.map((prod) => {
              const prodName = productAliases(prod.split('/')[0])
              if (document.querySelector(`.${triggerType}_${prodName}_fake`)) {
                const fakeSelector = document.querySelector(`.${triggerType}_${prodName}_fake`);
                fakeSelector.value = triggerValue;
                fakeSelector.dispatchEvent(new Event('change'));
              }
            })
          })
        });
      }


      //////////////////////////////////////////////////////////////////////////
      // create prices sections
      productsAsList.forEach((item, idx) => {
        const prodName = productAliases(productsAsList[idx].split('/')[0])
        const pricesDiv = document.createElement("div");
        pricesDiv.id = 'pricesBox'
        pricesDiv.className = 'prices_box'
        pricesDiv.innerHTML = '<span class="prod-percent green_txt"><b class="percent-' + prodName+'">10%</b> ' + discountText + '<span>'
        pricesDiv.innerHTML += '<span class="prod-oldprice oldprice-' + prodName +'"></span>'
        pricesDiv.innerHTML += '<span class="prod-newprice newprice-' + prodName +'"></span>'
        pricesDiv.innerHTML += '<span class="prod-taxes">' + taxesText + '</span>'
        pricesDiv.innerHTML += '<a class="red-buy-button buylink-' + prodName +'">' + buttonText + '</a>'

        const renderedProductSection = block.querySelector(`.b-productswithselectors > div:nth-child(${idx + 2})`);
        renderedProductSection.querySelector('ul').after(pricesDiv)
      });
    }
}
