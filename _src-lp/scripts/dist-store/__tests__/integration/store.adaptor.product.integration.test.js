import { Store } from '../../src/store.js';
const makeResponse = (data) => ({ ok: true, json: async () => data });
const idMappings = makeResponse({
    total: 1,
    offset: 0,
    limit: 1,
    data: [{ from: 'tsmd', to: 'com.bitdefender.tsmd.v2' }],
    columns: ['from', 'to'],
    ':type': 'sheet'
});
const tsmdMapping = makeResponse({
    total: 3,
    offset: 0,
    limit: 3,
    data: [
        { fromDevices: '5', fromSubscription: '1', toDevices: '5', toSubscription: '12' },
        { fromDevices: '10', fromSubscription: '1', toDevices: '10', toSubscription: '12' },
        { fromDevices: '25', fromSubscription: '2', toDevices: '25', toSubscription: '24' }
    ],
    columns: ['fromDevices', 'fromSubscription', 'toDevices', 'toSubscription'],
    ':type': 'sheet'
});
const vlaicuProduct = () => makeResponse({
    code: 200,
    message: 'OK',
    campaign: 'DEFAULT',
    campaignType: 'def',
    platformProductId: 'P12345',
    verifoneProductCode: 'CODE',
    product: {
        productId: 'tsmd',
        productName: 'Test Product',
        options: [
            {
                slots: 5,
                months: 12,
                currency: 'USD',
                price: 100,
                discountedPrice: 80,
                discountAmount: 20,
                discountPercentage: 20,
                buyLink: 'https://example.com/buy?opt=5-12'
            }
        ]
    }
});
describe('Store + Adaptor + Provider integration', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('maps id and variation: tsmd + 5/1 -> com.bitdefender.tsmd.v2 + 5/12', async () => {
        vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
            if (typeof url === 'string' && url.includes('sheet=id-mappings')) {
                return idMappings;
            }
            if (typeof url === 'string' && (url.includes('sheet=tsmd'))) {
                return tsmdMapping;
            }
            if (typeof url === 'string' && url.includes('/p-api/v1/products/com.bitdefender.tsmd.v2/locale/en-us')) {
                return vlaicuProduct();
            }
            return makeResponse({});
        });
        const store = new Store({ locale: 'en-us', provider: { name: 'vlaicu' } });
        const product = await store.getProduct({ id: 'tsmd' });
        expect(product?.getId()).toBe('com.bitdefender.tsmd.v2');
        const option = await product?.getOption({ devices: 5, subscription: 1 });
        expect(option?.getDevices()).toBe(5);
        expect(option?.getSubscription()).toBe(12);
    });
});
//# sourceMappingURL=store.adaptor.product.integration.test.js.map