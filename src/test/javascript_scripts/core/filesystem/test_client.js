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
var fs = require("vertx/file_system")
var Pump = require("vertx/pump")

var fileDir = "js-test-output"

// More tests needed

function testCopy() {
  var from = fileDir + "/foo.tmp";
  var to = fileDir + "/bar.tmp";
  var content = "some-data";
  fs.writeFile(from, content, function() {
    fs.copy(from, to, function(err, res) {
      tu.azzert(err === null);
      fs.readFile(to, function(err, res) {
        tu.azzert(err === null);
        tu.azzert(res.toString() === content);
        tu.testComplete();
      });
    });
  });
}

function testMove() {
  var from = fileDir + "/foo.tmp";
  var to = fileDir + "/bar.tmp";
  var content = "some-data";
  fs.writeFile(from, content, function() {
    fs.move(from, to, function(err, res) {
      tu.azzert(err === null);
      fs.readFile(to, function(err, res) {
        tu.azzert(err === null);
        tu.azzert(res.toString() === content);
        fs.exists(from, function(err, res) {
          tu.azzert(err === null);
          tu.azzert(!res);
          tu.testComplete();
        });
      });
    });
  });
}

function testMkDir() {
  // arguments: string, boolean, handler
  var dir = fileDir + "/foo/bar";
  fs.mkDir(dir, true, function(err, res) {
    tu.azzert(err === null, err);
    fs.readDir(dir, function(err, res) {
      tu.azzert(err === null, err);
      tu.testComplete();
    });
  });
}

function testMkDirSync() {
  var dir = fileDir + "/testMkDirSync";
  fs.mkDirSync(dir);
  fs.readDir(dir, function(err, res) {
    tu.azzert(err === null, err);
    tu.testComplete();
  });
}


function testReadDir() {
  var file1 = fileDir + "/foo.tmp";
  var file2 = fileDir + "/bar.tmp";
  var file3 = fileDir + "/baz.tmp";
  var content = "some-data";
  fs.writeFile(file1, content, function() {
    fs.writeFile(file2, content, function() {
      fs.writeFile(file3, content, function() {
        fs.readDir(fileDir, function(err, res) {
          tu.azzert(err === null);
          tu.azzert(res.length === 3);
          tu.testComplete();
        });
      })
    })
  });
}

function testProps() {
  var file = fileDir + "/foo.tmp";
  var content = "some-data";
  fs.writeFile(file, content, function() {
    fs.props(file, function(err, res) {
      tu.azzert(err === null);
      tu.azzert(res.isRegularFile);
      tu.azzert(typeof res.creationTime === 'number');
      tu.azzert(typeof res.lastAccessTime === 'number');
      tu.azzert(typeof res.lastModifiedTime === 'number');
      tu.testComplete();
    });
  });
}

function testPumpFile() {
  var from = fileDir + "/foo.tmp";
  var to = fileDir + "/bar.tmp";
  var content = tu.generateRandomBuffer(10000);
  fs.writeFile(from, content, function() {
    fs.open(from, function(err, file1) {
      tu.azzert(err === null);
      fs.open(to, function(err, file2) {
        tu.azzert(err === null);
        var rs = file1;
        var ws = file2;
        var pump = new Pump(rs, ws);
        pump.start();
        rs.endHandler(function() {
          file1.close(function() {
            file2.close(function() {
              fs.readFile(to, function(err, res) {
                tu.azzert(err === null);
                tu.azzert(tu.buffersEqual(content, res));
                tu.testComplete();
              });
            });
          });
        });
      });
    });
  });
}

function setup(doneHandler) {
  fs.exists(fileDir, function(err, exists) {
    if (exists) {
      fs.delete(fileDir, true, function() {
        fs.mkDir(fileDir, function() {
          doneHandler();
        });
      });
    } else {
      fs.mkDir(fileDir, function() {
        doneHandler();
      });
    }
  });
}

tu.registerTests(this);

setup(function() {
  tu.appReady();
})

function vertxStop() {
  fs.deleteSync(fileDir, true);
  tu.unregisterAll();
  tu.appStopped();
}

