import { Adaptor } from "../../src/adaptors/adaptor.base.js";
import { vi } from "vitest";
const idMappings = {
    ok: true,
    json: async () => ({
        total: 1,
        offset: 0,
        limit: 1,
        data: [{ from: "tsmd", to: "com.bitdefender.tsmd.v2" }],
        columns: ["from", "to"],
        ":type": "sheet"
    })
};
const tsmdMapping = {
    ok: true,
    json: async () => ({
        total: 3,
        offset: 0,
        limit: 3,
        data: [
            {
                fromDevices: "5",
                fromSubscription: "1",
                toDevices: "5",
                toSubscription: "12"
            },
            {
                fromDevices: "10",
                fromSubscription: "1",
                toDevices: "10",
                toSubscription: "12"
            },
            {
                fromDevices: "25",
                fromSubscription: "2",
                toDevices: "25",
                toSubscription: "24"
            }
        ],
        columns: [
            "fromDevices",
            "fromSubscription",
            "toDevices",
            "toSubscription"
        ],
        ":type": "sheet"
    })
};
describe("Adaptor Init Selector", () => {
    let adaptor;
    let fetchSpy;
    beforeEach(async () => {
        fetchSpy = vi.spyOn(global, "fetch");
        fetchSpy.mockResolvedValue(idMappings);
        adaptor = await Adaptor.create();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe("test adaptor creation", () => {
        it("adaptor was correctly created", () => {
            expect(adaptor).toBeTruthy();
        });
    });
    describe("adaptTo", () => {
        beforeEach(() => {
            fetchSpy.mockResolvedValue(tsmdMapping);
        });
        it("adapt id", async () => {
            const product = await adaptor.adaptTo({ id: "tsmd" });
            expect(product).toEqual({ id: "com.bitdefender.tsmd.v2" });
        });
        it("adapt option", async () => {
            const product = await adaptor.adaptTo({ id: "tsmd", devices: 5, subscription: 1 });
            expect(product).toEqual({ id: "com.bitdefender.tsmd.v2", devices: 5, subscription: 12 });
        });
        it("adapt id which doesn't exists", async () => {
            const product = await adaptor.adaptTo({ id: "tsmd-1" });
            expect(product).toEqual({ id: "tsmd-1" });
        });
        it("adapt option which doesn't exists", async () => {
            const product = await adaptor.adaptTo({ id: "tsmd-1", devices: 100, subscription: 100 });
            expect(product).toEqual({ id: "tsmd-1", devices: 100, subscription: 100 });
        });
    });
});
//# sourceMappingURL=adaptor.base.test.js.map