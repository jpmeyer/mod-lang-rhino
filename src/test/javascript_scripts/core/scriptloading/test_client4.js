/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var tu = require('test_utils')

var vertx = require('vertx')

// Test that you can't use load() to load the vert.x CommonJS modules
function testRequireAll() {
  tu.azzert(typeof vertx.createNetServer === 'function');
  tu.azzert(typeof vertx.createNetClient === 'function');
  tu.azzert(typeof vertx.createHttpServer === 'function');
  tu.azzert(typeof vertx.createHttpClient === 'function');
  tu.testComplete()
}

tu.registerTests(this);
tu.appReady();

function vertxStop() {
  tu.unregisterAll();
  tu.appStopped();
}
