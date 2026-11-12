import { createHandler } from './handler.mjs';
Deno.serve(createHandler(() => Deno.env.toObject(), fetch, checks => console.info('leafchef_interest_configuration', JSON.stringify(checks))));
