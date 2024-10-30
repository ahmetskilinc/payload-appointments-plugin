import type { Payload } from "payload";

import type { PluginTypes } from "./types";

export const onInitExtension = (
	pluginOptions: PluginTypes,
	payload: Payload,
): void => {
	try {
		payload.logger.info({ msg: "Hello from onInitExtension" });
	} catch (err: unknown) {
		payload.logger.error({ err, msg: "Error in onInitExtension" });
	}
};
