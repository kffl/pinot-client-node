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

describe("SelectorScheduler class", () => {
    it("should periodically invoke .performUpdate() on Updatable", async () => {
        const scheduler = new SelectorUpdaterPeriodic(mockUpdatable, 100);
        await sleep(250);
        scheduler.stop();
        expect(mockUpdatable.updateBrokers).toHaveBeenCalledTimes(2);
    });
    it("should stop invoking .performUpdate() after .stop() is called", async () => {
        const scheduler = new SelectorUpdaterPeriodic(mockUpdatable, 100);
        await sleep(150);
        scheduler.stop();
        await sleep(100);
        expect(mockUpdatable.updateBrokers).toHaveBeenCalledTimes(1);
    });
});
