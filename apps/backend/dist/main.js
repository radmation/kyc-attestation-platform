"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const backend_module_1 = require("./backend.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(backend_module_1.BackendModule);
    await app.listen(process.env.port ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map