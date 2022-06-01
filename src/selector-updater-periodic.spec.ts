import { mock, mockReset } from "jest-mock-extended";
import { Updatable } from "./updater.interface";
import { SelectorUpdaterPeriodic } from "./selector-updater-periodic";

const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });

const mockUpdatable = mock<Updatable>();

beforeEach(() => {
    mockReset(mockUpdatable);
});

describe("SelectorUpdaterPeriodic class", () => {
    it("should periodically invoke .performUpdate() on Updatable", async () => {
        const updater = new SelectorUpdaterPeriodic(mockUpdatable, 100);
        await sleep(250);
        updater.stop();
        expect(mockUpdatable.updateBrokers).toHaveBeenCalledTimes(2);
    });
    it("should stop invoking .performUpdate() after .stop() is called", async () => {
        const updater = new SelectorUpdaterPeriodic(mockUpdatable, 100);
        await sleep(150);
        updater.stop();
        await sleep(100);
        expect(mockUpdatable.updateBrokers).toHaveBeenCalledTimes(1);
    });
});
