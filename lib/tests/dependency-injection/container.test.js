"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container_1 = require("@/dependency-injection/container");
const container_helpers_1 = require("./container-helpers");
describe('IracaContainer', () => {
    let container;
    beforeEach(() => (container = new container_1.IracaContainer()));
    test('should return the same instance when the strategy is singleton', () => {
        container.add({
            component: container_helpers_1.A,
            strategy: 'factory',
        });
        container.add({
            component: container_helpers_1.C,
            strategy: 'factory',
        });
        container.add({
            component: container_helpers_1.D,
            strategy: 'singleton',
            dependencies: ['A', 'C'],
        });
        const initSize = (0, container_helpers_1.calcularBytes)(container.instancesTable);
        const d = container.getInstance('D');
        let size = (0, container_helpers_1.calcularBytes)(container.instancesTable);
        expect(size).toBeGreaterThan(initSize);
    });
});
//# sourceMappingURL=container.test.js.map