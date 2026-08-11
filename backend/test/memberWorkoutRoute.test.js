const test = require('node:test');
const assert = require('node:assert/strict');
const memberRoutes = require('../routes/memberRoutes');

function findRoute(method, path) {
  const stack = memberRoutes.stack || [];
  return stack.find((layer) => {
    if (!layer.route) return false;
    const methods = Object.keys(layer.route.methods || {});
    return methods.includes(method) && layer.route.path === path;
  });
}

test('member workout routes include summary, editable, and completion endpoints', () => {
  const summaryRoute = findRoute('get', '/me/workout');
  const editRoute = findRoute('patch', '/me/workout');
  const completeRoute = findRoute('patch', '/me/workout/complete');

  assert.ok(summaryRoute, 'Expected GET /me/workout route to exist');
  assert.ok(editRoute, 'Expected PATCH /me/workout route to exist');
  assert.ok(completeRoute, 'Expected PATCH /me/workout/complete route to exist');
});
