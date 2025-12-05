export class Adaptor {
    mapper;
    constructor(mapper) {
        this.mapper = mapper;
    }
    static async create() {
        const productsMapping = await this.getMappings();
        return new Adaptor(productsMapping);
    }
    async adaptTo(param) {
        const { id, devices, subscription } = param;
        const product = { id, devices, subscription };
        if (!this.mapper) {
            return product;
        }
        const mappedProduct = this.mapper.get(id);
        if (mappedProduct) {
            product.id = mappedProduct.id;
        }
        else {
            return product;
        }
        if (mappedProduct && !mappedProduct?.options) {
            mappedProduct.options = this.getMappingForId(id);
        }
        if (devices && subscription) {
            const options = await mappedProduct.options;
            if (options) {
                const option = options[devices]?.[subscription];
                if (option) {
                    product.devices = option.devices;
                    product.subscription = option.subscription;
                }
            }
        }
        return product;
    }
    static async getMappings() {
        try {
            const response = await fetch("https://www.bitdefender.com/common/store-config/init-to-vlaicu-mappings.json?sheet=id-mappings");
            if (!response.ok) {
                console.error(`${response.status}: ${response.statusText}`);
                return null;
            }
            const sheet = await response.json();
            const products = new Map();
            for (const product of sheet.data) {
                const { from, to } = product;
                products.set(from, { id: to });
            }
            return products;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async getMappingForId(id) {
        try {
            const response = await fetch(`https://www.bitdefender.com/common/store-config/init-to-vlaicu-mappings.json?sheet=${id}`);
            if (!response.ok) {
                console.error(`${response.status}: ${response.statusText}`);
                return null;
            }
            const sheet = await response.json();
            const options = {};
            for (const option of sheet.data) {
                const fromDevices = Number(option.fromDevices), fromSubscription = Number(option.fromSubscription), toDevices = Number(option.toDevices), toSubscription = Number(option.toSubscription);
                if (!options[fromDevices]) {
                    options[fromDevices] = {};
                }
                options[fromDevices][fromSubscription] = {
                    devices: toDevices,
                    subscription: toSubscription
                };
            }
            return options;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
}
//# sourceMappingURL=adaptor.base.js.map