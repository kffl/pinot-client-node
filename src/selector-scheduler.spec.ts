import { mock, mockReset } from "jest-mock-extended";
import { Updatable } from "./scheduler.interface";
import { SelectorScheduler } from "./selector-scheduler";

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
        const scheduler = new SelectorScheduler(mockUpdatable, 100);
        await sleep(250);
        scheduler.stop();
        expect(mockUpdatable.updateBrokers).toHaveBeenCalledTimes(2);
    });
    it("should stop invoking .performUpdate() after .stop() is called", async () => {
        const scheduler = new SelectorScheduler(mockUpdatable, 100);
        await sleep(150);
        scheduler.stop();
        await sleep(100);
        expect(mockUpdatable.updateBrokers).toHaveBeenCalledTimes(1);
    });
});
