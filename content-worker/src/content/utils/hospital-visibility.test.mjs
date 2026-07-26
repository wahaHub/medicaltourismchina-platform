import assert from "node:assert/strict";
import test from "node:test";

import { isPublicHospitalExcluded } from "./hospital-visibility.mjs";

test("excludes the production test hospital by ID or slug", () => {
  assert.equal(
    isPublicHospitalExcluded({
      id: "33246eb1-5dd1-400b-9a31-43607966e997",
      slug: "renamed-test-hospital",
    }),
    true,
  );
  assert.equal(isPublicHospitalExcluded({ slug: "ceshi-logs" }), true);
});

test("keeps legitimate hospital records public", () => {
  assert.equal(
    isPublicHospitalExcluded({
      id: "hospital-1",
      slug: "fuwai-hospital",
    }),
    false,
  );
});
