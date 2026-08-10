const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const adminRoutes = require('../routes/adminRoutes');

function findRoute(method, path) {
  const stack = adminRoutes.stack || [];
  return stack.find((layer) => {
    if (!layer.route) return false;
    const methods = Object.keys(layer.route.methods || {});
    return methods.includes(method) && layer.route.path === path;
  });
}

test('admin trainer routes include get-by-id endpoint for edit flow', () => {
  const route = findRoute('get', '/trainers/:id');
  assert.ok(route, 'Expected GET /trainers/:id route to exist');
});
