export default class ColumnComponent {
  #el;

  #variant;

  /*
  * @el {HTMLElement} block code  to be rendered
  * @variant {String} "variant = primary | secondary, primary round all corners, secondary round only left corners"
  * */
  constructor(el, variant = 'primary') {
    this.#el = el;
    this.#variant = variant;
  }

  render() {
    return `
      <column-component>
        <div class="inner-container inner-container--${this.#variant}">
           ${this.#el.innerHTML}
        </div>
      </column-component>
    `;
  }
}
